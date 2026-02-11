import express from 'express';
import puppeteer from 'puppeteer';
import { LRUCache } from 'lru-cache';

const app = express();
const port = process.env.PORT || 3000;

/* =======================================================
   基础配置
======================================================= */

const MAX_CONCURRENT_TASKS = 5;
const PAGE_POOL_SIZE = 5;
const CACHE_MAX = 200;
const CACHE_TTL = 1000 * 60 * 30; // 30分钟
const TARGET_URL = 'https://github-contributions.vercel.app/'; // 官方网站

/* =======================================================
   浏览器 + Page 池
======================================================= */

let browser;
const pagePool = [];

async function initBrowser() {
  if (browser) return browser;

  console.log('[初始化] 启动浏览器...');
  browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  console.log('[初始化] 创建页面池...');
  for (let i = 0; i < PAGE_POOL_SIZE; i++) {
    const page = await browser.newPage();
    pagePool.push(page);
  }

  console.log('[初始化] 完成');
  return browser;
}

async function acquirePage() {
  while (pagePool.length === 0) {
    await new Promise(r => setTimeout(r, 20));
  }
  return pagePool.pop();
}

async function releasePage(page) {
  try {
    await page.goto('about:blank');
  } catch {}
  pagePool.push(page);
}

/* =======================================================
   LRU 缓存
======================================================= */

const imageCache = new LRUCache({
  max: CACHE_MAX,
  ttl: CACHE_TTL
});


function getCacheKey(username, theme) {
  return `${username}:${theme || 'standard'}`;
}

/* =======================================================
   线程池（任务调度器）
======================================================= */

class TaskPool {
  constructor(max) {
    this.max = max;
    this.running = 0;
    this.queue = [];
  }

  run(task) {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        this.running++;
        try {
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          this.running--;
          this.next();
        }
      };

      if (this.running < this.max) {
        execute();
      } else {
        this.queue.push(execute);
      }
    });
  }

  next() {
    if (this.queue.length > 0 && this.running < this.max) {
      const task = this.queue.shift();
      task();
    }
  }
}

const pool = new TaskPool(MAX_CONCURRENT_TASKS);

/* =======================================================
   请求去重（防止同一用户重复渲染）
======================================================= */

const pendingRequests = new Map();

/* =======================================================
   核心渲染逻辑
======================================================= */

async function generateChart(username, theme = 'standard') {
  const page = await acquirePage();

  try {
    await page.setViewport({
      width: 400,
      height: 250,
      deviceScaleFactor: 4
    });

    await page.goto(TARGET_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });

    await page.waitForSelector('#username', { timeout: 10000 });

    await page.click('#username', { clickCount: 3 });
    await page.type('#username', username);

    const themeSelector = `input[name="theme"][value="${theme}"]`;
    const themeExists = await page.$(themeSelector);
    if (themeExists) {
      await page.click(themeSelector);
    }

    await page.click('button[type="submit"]');

    await page.waitForSelector('canvas', { timeout: 15000 });

    const imgData = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      return canvas.toDataURL('image/png');
    });

    if (!imgData) throw new Error('Canvas 渲染失败');

    const base64Data = imgData.replace(/^data:image\/png;base64,/, "");
    return Buffer.from(base64Data, 'base64');

  } finally {
    await releasePage(page);
  }
}

/* =======================================================
   用户名校验
======================================================= */

function validateUsername(username) {
  const regex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
  return regex.test(username);
}

/* =======================================================
   健康检查
======================================================= */

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    runningTasks: pool.running,
    queuedTasks: pool.queue.length,
    cacheSize: imageCache.size,
    pagePoolSize: pagePool.length
  });
});

/* =======================================================
   主路由
======================================================= */

app.get('/:username', async (req, res) => {
  const { username } = req.params;
  const { theme } = req.query;

  if (!validateUsername(username)) {
    return res.status(400).send('Invalid GitHub username');
  }

  const cacheKey = getCacheKey(username, theme);

  // 1️⃣ 命中缓存
  const cached = imageCache.get(cacheKey);
  if (cached) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Cache', 'HIT');
    return res.send(cached);
  }

  // 2️⃣ 正在生成
  if (pendingRequests.has(cacheKey)) {
    const buffer = await pendingRequests.get(cacheKey);
    res.setHeader('Content-Type', 'image/png');
    return res.send(buffer);
  }

  // 3️⃣ 新任务
  const taskPromise = pool.run(() =>
    generateChart(username, theme)
  );

  pendingRequests.set(cacheKey, taskPromise);

  try {
    const buffer = await taskPromise;
    imageCache.set(cacheKey, buffer);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Cache', 'MISS');
    res.send(buffer);
  } catch (err) {
    res.status(500).send('生成失败');
  } finally {
    pendingRequests.delete(cacheKey);
  }
});

/* =======================================================
   启动服务 + 冷启动预热
======================================================= */

app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
  await initBrowser(); // 预热
});

/* =======================================================
   优雅退出
======================================================= */

async function gracefulShutdown(signal) {
  console.log(`\n收到 ${signal}，关闭服务...`);
  if (browser) await browser.close();
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
