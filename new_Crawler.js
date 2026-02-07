import express from 'express';
import puppeteer from 'puppeteer';
const app = express();
const port = process.env.PORT || 3000;

// 启动浏览器实例（为了性能，最好复用浏览器实例，或者使用连接池）
// 在简单版中，我们为每个请求启动新页面，但可以通过全局 browser 优化
let browser;

// 并发控制：限制同时处理的请求数量
const MAX_CONCURRENT_REQUESTS = 5;
let activeRequests = 0;
const requestQueue = [];

async function initBrowser() {
  if (!browser) {
    console.log('[初始化] 正在启动浏览器实例...');
    browser = await puppeteer.launch({
      headless: true, 
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage' // 内存优化，防止在服务器上崩溃
      ]
    });
    console.log('[初始化] 浏览器实例启动成功');
  }
  return browser;
}

// 核心生成函数（带重试机制）
async function generateChart(username, theme = 'standard', retryCount = 0) {
  const MAX_RETRIES = 2;
  const url = 'https://github-contributions-chart-nine.vercel.app/';
  const browserInstance = await initBrowser();
  const page = await browserInstance.newPage();

  try {
    console.log(`[生成] 开始为用户 ${username} 生成图表 (主题: ${theme})`);
    
    // 设置视口 (Scale 4 以获得更高清晰度，适当增大尺寸)
    await page.setViewport({ 
      width: 1600, 
      height: 1000, 
      deviceScaleFactor: 4 // 最高到 4 倍像素密度，显著提升清晰度，一般设置为3就行
    });

    // 1. 前往页面 (优化超时设置)
    console.log(`[生成] 正在访问页面: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // 2. 输入用户名
    console.log(`[生成] 正在输入用户名: ${username}`);
    await page.waitForSelector('#username', { timeout: 10000 });
    await page.click('#username', { clickCount: 3 });
    await page.type('#username', username);

    // 3. 选择主题
    const themeSelector = `input[name="theme"][value="${theme}"]`;
    // 检查主题是否存在，不存在则使用默认
    const themeExists = await page.$(themeSelector);
    if (themeExists) {
      console.log(`[生成] 选择主题: ${theme}`);
      await page.click(themeSelector);
    } else {
      console.warn(`[警告] 主题 ${theme} 不存在，使用默认主题`);
    }

    // 4. 点击生成
    console.log(`[生成] 点击生成按钮`);
    await page.click('button[type="submit"]');

    // 5. 等待 Canvas
    console.log(`[生成] 等待图表渲染...`);
    await page.waitForSelector('canvas', { timeout: 15000 });
    // 等待渲染动画结束，确保完全加载
    await new Promise(r => setTimeout(r, 2000)); // 增加到 2 秒确保完全渲染

    // 6. 提取 Canvas 数据（使用高质量 PNG 编码）
    const imgData = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      // PNG 格式无损压缩，保证最高质量
      // 注意：toDataURL 的第二个参数对 PNG 无效，PNG 始终是无损的
      return canvas.toDataURL('image/png');
    });

    if (!imgData) throw new Error('无法获取图片数据');

    // 处理 Base64
    const base64Data = imgData.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    console.log(`[生成] ✅ 图表生成成功，大小: ${(buffer.length / 1024).toFixed(2)} KB`);
    return buffer;

  } catch (error) {
    console.error(`[错误] 生成失败 (尝试 ${retryCount + 1}/${MAX_RETRIES + 1}):`, error.message);
    
    // 重试机制
    if (retryCount < MAX_RETRIES) {
      console.log(`[重试] 将在 2 秒后重试...`);
      await page.close();
      await new Promise(r => setTimeout(r, 2000));
      return generateChart(username, theme, retryCount + 1);
    }
    
    throw error;
  } finally {
    // 务必关闭页面释放内存，但不要关闭 browser
    if (page && !page.isClosed()) {
      await page.close();
    }
  }
}

// 并发控制函数
async function processRequest(fn) {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    console.log(`[队列] 当前请求数已达上限 (${activeRequests}/${MAX_CONCURRENT_REQUESTS})，加入队列`);
    await new Promise(resolve => requestQueue.push(resolve));
  }
  
  activeRequests++;
  try {
    return await fn();
  } finally {
    activeRequests--;
    if (requestQueue.length > 0) {
      const resolve = requestQueue.shift();
      resolve();
    }
  }
}

// 参数验证函数
function validateUsername(username) {
  // GitHub 用户名规则：1-39个字符，只能包含字母、数字和连字符，不能以连字符开头或结尾
  const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
  return usernameRegex.test(username);
}

// 健康检查端点
app.get('/health', async (req, res) => {
  try {
    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      browserRunning: !!browser,
      activeRequests: activeRequests,
      queueLength: requestQueue.length,
      uptime: process.uptime()
    };
    console.log(`[健康检查] 服务状态正常`);
    res.json(status);
  } catch (error) {
    console.error(`[健康检查] 服务异常:`, error.message);
    res.status(503).json({ status: 'error', message: error.message });
  }
});

// 路由定义： /:username
// 例如: http://localhost:3000/sallar?theme=halloween
app.get('/:username', async (req, res) => {
  const { username } = req.params;
  const { theme } = req.query; // 从 ?theme=xxx 获取参数

  console.log(`[请求] 收到请求: 用户=${username}, 主题=${theme || '默认'}, 活跃请求数=${activeRequests}`);

  // 参数验证
  if (!validateUsername(username)) {
    console.warn(`[验证] ❌ 无效的用户名: ${username}`);
    return res.status(400).send('无效的 GitHub 用户名格式');
  }

  try {
    const imageBuffer = await processRequest(() => generateChart(username, theme));

    // 设置响应头，告诉浏览器这是一张 PNG 图片
    res.setHeader('Content-Type', 'image/png');
    // 设置缓存头：public, 缓存 1 天 (86400秒)
    res.setHeader('Cache-Control', 'public, max-age=86400');

    res.send(imageBuffer);
    console.log(`[响应] ✅ 成功返回图片: ${username}`);

  } catch (error) {
    console.error(`[响应] ❌ 请求失败: ${username}`, error.message);
    res.status(500).send('生成图片失败，请检查用户名是否正确或稍后重试');
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`========================================`);
  console.log(`[服务器] Web 服务已启动!`);
  console.log(`[服务器] 访问地址: http://localhost:${port}/YOUR_USERNAME`);
  console.log(`[服务器] 健康检查: http://localhost:${port}/health`);
  console.log(`[服务器] 最大并发数: ${MAX_CONCURRENT_REQUESTS}`);
  console.log(`========================================`);
});

// 优雅退出：确保浏览器实例被正确关闭
async function gracefulShutdown(signal) {
  console.log(`\n[退出] 收到 ${signal} 信号，正在优雅关闭...`);
  
  if (browser) {
    console.log('[退出] 正在关闭浏览器实例...');
    await browser.close();
    console.log('[退出] 浏览器已关闭');
  }
  
  console.log('[退出] 服务已停止');
  process.exit(0);
}

// 监听退出信号
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// 捕获未处理的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('[异常] 未处理的 Promise 拒绝:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[异常] 未捕获的异常:', error);
  gracefulShutdown('uncaughtException');
});