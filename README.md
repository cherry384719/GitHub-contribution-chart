# GitHub Contributions Chart API

一个简单的 GitHub 贡献图表生成服务，基于 Express 和 Puppeteer 实现。

## 💡 工作原理

本服务通过 Puppeteer 自动化访问 [github-contributions-chart](https://github.com/sallar/github-contributions-chart) 项目的网站，该网站提供了美观的 GitHub 贡献图表可视化界面。服务会：

1. 使用 Puppeteer 无头浏览器访问目标网站
2. 自动填入 GitHub 用户名和选择主题
3. 等待图表渲染完成
4. 截取 Canvas 生成高清 PNG 图片
5. 通过 Express API 提供图片访问接口

简单来说，这是一个将网页版图表转换为 API 服务的工具。

## ✨ 核心特性（高性能版本）

- 🚀 浏览器单例复用（避免重复启动）
- 🧵 线程池任务调度（限制并发，防止崩溃）
- 📄 Page Pool 页面复用（提升 30%+ 性能）
- 🧠 LRU + TTL 内存缓存（自动淘汰最久未使用）
- 🔁 请求去重（同一用户同时请求只渲染一次）
- ⚡ 冷启动预热（首次访问不卡顿）
- 🖼 高清 PNG 输出（400x250 @4x）
- 📊 健康检查接口


## 🚀 快速开始

### 本地运行

```bash
# 安装依赖
npm install

# 启动服务
node crawler.js

# 测试
curl http://localhost:3000/your-github-name -o chart.png
```

### Docker 运行

```bash
# 构建并运行
docker build -t github-chart .
docker run -d -p 7860:7860 github-chart

# 测试
curl http://localhost:7860/your-github-name -o chart.png
```

## 📖 使用方法

### API 端点

```
GET /:username              # 生成图表（默认主题）
GET /:username?theme=xxx    # 指定主题
GET /health                 # 健康检查
```

### 在 HTML 中使用

```html
<img src="http://localhost:3000/your-github-name" alt="GitHub Chart">
<img src="http://localhost:3000/your-github-name?theme=dracula" alt="GitHub Chart">
```

### 在 Markdown 中使用

```markdown
![GitHub Chart](http://localhost:3000/your-github-name)
![GitHub Chart](http://localhost:3000/your-github-name?theme=halloween)
```

## 🎨 主题列表

| 主题代码 | 说明 |
|---------|------|
| `standard` | GitHub 默认绿色 |
| `githubDark` | GitHub 深色模式 |
| `dracula` | Dracula 紫粉色 |
| `halloween` | 万圣节橙黄色 |
| `teal` | 青色 |
| `blue` | 蓝色 |
| `panda` | 熊猫配色 |
| `sunny` | 阳光金黄 |
| `pink` | 粉色 |
| `classic` | 经典风格 |
| `leftPad` | 极简灰色 |
| `YlGnBu` | 黄绿蓝渐变 |
| `solarizedDark` | Solarized 深色 |
| `solarizedLight` | Solarized 浅色 |

默认URL`http://localhost:3000/your-github-name`的显示主题为`standard`，如需更改，在此基础上加上`?theme=`，后面的内容替换为列表中的主题，例如：`http://localhost:3000/your-github-name?theme=halloween`

## 🐳 部署方案

### Hugging Face Spaces（推荐！免费，空间永久存在）

1. 创建新 Space，选择 Docker SDK，默认为 blank（空）
2. 上传所有文件
3. 等待自动构建
4. 访问：`https://YOUR_USERNAME-YOUR_SPACE.hf.space/<your-github-name>`

若你的Hugging Face账号名称为`zhangsan`，创建的Space空间名称为`ABC-123`，那么自动构建完成后的访问链接为：`https://zhangsan-ABC-123.hf.space/<your-github-name>`

> 该空间在一段时间没有活动后会休眠，再次启动需要耗费较长时间，所以推荐使用 https://uptimerobot.com 自动机器人来监控服务，保持空间持续活动，监控url为 https://https://YOUR_USERNAME-YOUR_SPACE.hf.space/health，间隔时长可设为5-15分钟。

### Railway / Render

直接连接 GitHub 仓库，自动检测 Dockerfile 并部署。

### 云服务器

```bash
# 安装 Node.js 和依赖
npm install

# 使用 PM2 保持运行
npm install -g pm2
pm2 start crawler.js --name github-chart
pm2 startup
pm2 save
```

## ⚙️ 配置选项

```javascript
// crawler.js 中可修改的配置
MAX_CONCURRENT_REQUESTS = 5        // 最大并发数
CACHE_TTL = 30 * 60 * 1000        // 缓存时间（30分钟）
MAX_RETRIES = 2                    // 重试次数
```

```bash
# 环境变量
PORT=3000  # 服务端口
```

## 🔧 常见问题

### 浏览器启动失败

Linux 系统需要安装依赖：
```bash
sudo apt-get install -y ca-certificates fonts-liberation \
  libappindicator3-1 libasound2 libatk-bridge2.0-0 \
  libcups2 libdbus-1-3 libgbm1 libgtk-3-0 libnspr4 \
  libnss3 libxcomposite1 libxdamage1 libxrandr2
```

### 内存不足

减少并发数或增加服务器内存：
```javascript
const MAX_CONCURRENT_REQUESTS = 2;  // 降低并发
```

### Docker 共享内存不足

```bash
docker run -d -p 7860:7860 --shm-size=2gb github-chart
```

## 📊 技术栈

- **Express** - Web 框架
- **Puppeteer** - 浏览器自动化
- **Node.js** - 运行环境

## � 相关项目

本项目基于以下开源项目构建：

- **[github-contributions-chart](https://github.com/sallar/github-contributions-chart)** - 提供图表可视化的前端项目（原始作者：[@sallar](https://github.com/sallar)）
  - 项目地址：https://github.com/sallar/github-contributions-chart
  - 在线演示：https://github-contributions.vercel.app/

## 🙏 致谢

- **[@sallar](https://github.com/sallar)** - [github-contributions-chart](https://github.com/sallar/github-contributions-chart) 项目作者，提供了优秀的图表可视化界面
- **[Puppeteer](https://pptr.dev/)** - Google 出品的浏览器自动化工具
- **[Express](https://expressjs.com/)** - 简洁的 Node.js Web 框架

## 📝 说明

本项目仅用于学习和个人使用。如果你喜欢原始的图表项目，请访问 [github-contributions-chart](https://github.com/sallar/github-contributions-chart) 给作者一个 ⭐️！
