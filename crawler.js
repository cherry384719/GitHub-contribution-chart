import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// --- 配置区域 ---
const CONFIG = {
  url: 'https://github-contributions.vercel.app/',
  username: 'cherry384719', // 替换为你想要的 GitHub 用户名
  theme: 'dracula', // 主题
  outputDir: 'downloads', // 图片保存目录
  filename: 'contributions.png', // 保存的文件名
  scaleFactor: 3 // 设置像素比，2=Retina屏，3=更高清
};

(async () => {
  console.log(`🚀 正在启动爬虫 (Scale: ${CONFIG.scaleFactor}x)...`);
  
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  await page.setViewport({ 
    width: 1200, 
    height: 800,
    deviceScaleFactor: CONFIG.scaleFactor 
  });

  try {
    console.log(`Gt 前往: ${CONFIG.url}`);
    await page.goto(CONFIG.url, { waitUntil: 'networkidle0', timeout: 60000 });

    console.log(`⌨️ 输入用户名: ${CONFIG.username}`);
    await page.waitForSelector('#username');
    await page.click('#username', { clickCount: 3 }); 
    await page.type('#username', CONFIG.username);

    console.log(`Bg 切换主题: ${CONFIG.theme}`);
    const themeSelector = `input[name="theme"][value="${CONFIG.theme}"]`;
    await page.waitForSelector(themeSelector);
    await page.click(themeSelector);

    console.log('Gt 点击生成...');
    await page.click('button[type="submit"]');

    console.log('Gt 等待渲染...');
    try {
      await page.waitForSelector('canvas', { timeout: 15000 });
      // 给一点时间让 Canvas 根据新的像素比重绘
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      throw new Error('生成超时，未找到 Canvas 元素。');
    }

    // 直接提取 Canvas 数据
    const imgData = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      // toDataURL 默认导出 96dpi，但因为我们前面设置了 deviceScaleFactor，
      // 网页生成的 canvas 自身的 width/height 属性应该已经变大了。
      // 如果想要最高质量，可以使用 image/png
      return canvas.toDataURL('image/png', 1.0);
    });

    if (!imgData) {
      throw new Error('无法读取 Canvas 数据');
    }

    const base64Data = imgData.replace(/^data:image\/png;base64,/, "");
    
    if (!fs.existsSync(CONFIG.outputDir)){
        fs.mkdirSync(CONFIG.outputDir);
    }
    
    const outputPath = path.join(CONFIG.outputDir, CONFIG.filename);
    
    fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));

    console.log(`✅ 成功! 高清图片已保存至: ${outputPath}`);

  } catch (error) {
    console.error('❌ 发生错误:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();