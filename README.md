# GitHub Contributions Chart API

一个基于 Express 和 Puppeteer 的高性能 GitHub 贡献图表生成服务，提供图片缓存、并发控制和自动重试机制。

## 📋 目录

- [功能特性](#功能特性)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [API 文档](#api-文档)
- [性能优化](#性能优化)
- [配置说明](#配置说明)
- [主题列表](#主题列表)
- [部署指南](#部署指南)

## ✨ 功能特性

- 🎨 **多主题支持** - 支持 14+ 种预设主题（standard、dracula、halloween 等）
- 🚀 **并发控制** - 智能请求队列，最大并发数 5，防止服务器过载
- 💾 **智能缓存** - 30 分钟内存缓存，减少重复请求的处理时间
- 🔄 **自动重试** - 失败自动重试最多 2 次，提高稳定性
- 📊 **高清输出** - 1000x625 分辨率 @ 3x DPR，PNG 无损格式
- 🏥 **健康检查** - 实时监控服务状态、队列长度、缓存情况
- 🛡️ **参数校验** - 严格的 GitHub 用户名格式验证
- 🔍 **智能渲染检测** - 动态等待 Canvas 渲染完成，而非固定延迟
- ♻️ **浏览器复用** - 全局浏览器实例，避免重复启动开销
- 🎯 **优雅退出** - 正确处理 SIGINT/SIGTERM 信号，关闭资源

## 🏗️ 技术架构

### 核心技术栈
- **Express** - Web 框架
- **Puppeteer** - 无头浏览器自动化
- **Node.js** - 运行环境

### 架构设计
```
客户端请求
    ↓
参数验证 → 缓存检查 (命中则直接返回)
    ↓
并发控制 (最大 5 个并发)
    ↓
浏览器自动化 (Puppeteer)
    ↓
Canvas 截图 → PNG 编码
    ↓
缓存存储 + 返回图片
```

## 🚀 快速开始

### 环境要求
- Node.js >= 14.x
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 启动服务
```bash
# 开发环境
npm start

# 或指定端口
PORT=8080 npm start
```

### 测试访问
```bash
# 浏览器访问
http://localhost:3000/YOUR_GITHUB_USERNAME

# 或使用 curl
curl http://localhost:3000/sallar > chart.png
```

## 📖 API 文档

### 1. 生成贡献图表

**端点**
```
GET /:username
```

**路径参数**
- `username` (必需) - GitHub 用户名
  - 格式要求：1-39 个字符，只能包含字母、数字和连字符
  - 不能以连字符开头或结尾
  - 示例：`torvalds`, `tj`, `github-user-123`

**查询参数**
- `theme` (可选) - 主题名称，默认 `standard`
  - 可选值：见[主题列表](#主题列表)

**响应**
- **成功** (200)
  - Content-Type: `image/png`
  - Cache-Control: `public, max-age=86400` (缓存 24 小时)
  - X-Cache: `HIT` (缓存命中) 或 `MISS` (缓存未命中)
  - Body: PNG 图片二进制数据

- **失败** (400/500)
  - 400: 无效的用户名格式
  - 500: 生成失败（用户不存在或网络问题）

**使用示例**
```bash
# 默认主题
curl http://localhost:3000/torvalds -o chart.png

# 指定主题
curl "http://localhost:3000/tj?theme=dracula" -o chart.png

# HTML 中使用
<img src="http://localhost:3000/YOUR_USERNAME?theme=halloween" alt="GitHub Chart">

# Markdown 中使用
![GitHub Chart](http://localhost:3000/YOUR_USERNAME?theme=githubDark)
```

### 2. 健康检查

**端点**
```
GET /health
```

**响应示例**
```json
{
  "status": "ok",
  "timestamp": "2026-02-07T10:30:00.000Z",
  "browserRunning": true,
  "activeRequests": 2,
  "queueLength": 3,
  "cachedImages": 15,
  "uptime": 3600.5
}
```

**字段说明**
- `status` - 服务状态 (`ok` 或 `error`)
- `timestamp` - 当前时间戳
- `browserRunning` - 浏览器实例是否运行
- `activeRequests` - 当前正在处理的请求数
- `queueLength` - 等待队列中的请求数
- `cachedImages` - 缓存中的图片数量
- `uptime` - 服务运行时间（秒）

## ⚡ 性能优化

### 1. 图像缓存系统
- **缓存时间**: 30 分钟 (1800 秒)
- **缓存键**: `username:theme`
- **存储方式**: 内存 Map
- **效果**: 缓存命中时响应时间 < 10ms

### 2. 浏览器实例复用
- 全局单例浏览器实例，避免每次请求启动新浏览器
- 仅为每个请求创建新页面
- 请求结束后关闭页面释放内存

### 3. 并发控制
- **最大并发数**: 5 个请求
- **队列机制**: 超出限制的请求自动排队
- **防止**: 服务器内存溢出和崩溃

### 4. 视口优化
- **分辨率**: 1000x625 (相比原始方案减少 40% 面积)
- **设备像素比**: 3x (保证高清晰度)
- **格式**: PNG 无损压缩

### 5. 智能渲染等待
- MutationObserver 监听 Canvas 变化
- 动态检测渲染完成，而非固定延迟
- 最大等待时间 1.5 秒，典型情况 < 1 秒

## ⚙️ 配置说明

### 环境变量
```bash
# 服务端口（默认 3000）
PORT=3000
```

### 代码配置
在 [new_Crawler.js](new_Crawler.js) 中可修改：

```javascript
// 最大并发请求数
const MAX_CONCURRENT_REQUESTS = 5;

// 缓存有效期（毫秒）
const CACHE_TTL = 30 * 60 * 1000; // 30 分钟

// 重试次数
const MAX_RETRIES = 2;

// 视口设置
await page.setViewport({ 
  width: 1000, 
  height: 625, 
  deviceScaleFactor: 3 
});
```

## 🎨 主题列表

以下是所有支持的主题（通过 `?theme=` 参数使用）：

| 主题代码 | 主题名称 | 风格描述 |
|---------|---------|---------|
| `standard` | Standard | GitHub 默认绿色主题 |
| `classic` | GitHub Classic | 早期经典风格 |
| `githubDark` | GitHub Dark | 官方深色模式 |
| `halloween` | Halloween | 万圣节橙黄色 |
| `teal` | Teal | 青色/蓝绿色 |
| `leftPad` | @left_pad | 极简灰色调 |
| `dracula` | Dracula | Dracula 紫粉深色 |
| `blue` | Blue | 蓝色主题 |
| `panda` | Panda 🐼 | 深紫/淡紫熊猫配色 |
| `sunny` | Sunny | 阳光金黄色 |
| `pink` | Pink | 粉色主题 |
| `YlGnBu` | YlGnBu | 黄→绿→蓝渐变 |
| `solarizedDark` | Solarized Dark | Solarized 深色 |
| `solarizedLight` | Solarized Light | Solarized 浅色 |

**使用示例**
```bash
curl "http://localhost:3000/torvalds?theme=dracula"
```

## 🚀 部署指南

详细部署文档请查看 **[DEPLOYMENT.md](DEPLOYMENT.md)**

### 快速部署选项

#### 1. 本地部署
```bash
npm install
node crawler.js
```
访问：`http://localhost:3000/username`

#### 2. Docker 部署
```bash
docker build -t github-chart-api .
docker run -d -p 7860:7860 github-chart-api
```
访问：`http://localhost:7860/username`

#### 3. Hugging Face Spaces（推荐 - 免费）
1. 创建新 Space，选择 Docker SDK
2. 上传 `crawler.js`, `package.json`, `Dockerfile`
3. 等待自动构建完成
4. 访问：`https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/username`

**其他平台**: Railway、Render、云服务器等，详见 [DEPLOYMENT.md](DEPLOYMENT.md)

## 🔧 故障排除

### 常见问题

**问题 1: 浏览器启动失败**
```bash
# Linux 安装依赖
sudo apt-get install -y ca-certificates fonts-liberation \
  libappindicator3-1 libasound2 libatk-bridge2.0-0 \
  libatk1.0-0 libcups2 libdbus-1-3 libgbm1 \
  libgtk-3-0 libnspr4 libnss3 libxcomposite1 \
  libxdamage1 libxrandr2 xdg-utils
```

**问题 2: 内存不足**
- 减少 `MAX_CONCURRENT_REQUESTS` 为 2-3
- 增加服务器内存
- Docker 限制内存：`docker run --memory=2g ...`

**问题 3: 生成超时**
- 检查网络连接
- 增加超时时间（修改 crawler.js）

更多问题解决方案请查看 [DEPLOYMENT.md](DEPLOYMENT.md#故障排除)

## 📊 监控和日志

### 健康检查
```bash
# 检查服务状态
curl http://localhost:3000/health

# 持续监控
watch -n 5 'curl -s http://localhost:3000/health | jq'
```

### 查看日志
```bash
# PM2 部署
pm2 logs github-chart

# Docker 部署
docker logs -f github-chart
```

## 📈 性能基准

在标准配置下（2 核 4GB RAM）：

| 指标 | 数值 |
|------|------|
| 缓存命中响应时间 | < 10ms |
| 首次生成响应时间 | 2-4s |
| 最大并发处理 | 5 个请求 |
| 平均内存占用 | 500MB - 1GB |
| 推荐配置 | 2 核 2GB+ |

## 📚 相关文档

- 📖 [API 文档](API.md) - 详细的 API 接口说明
- 🚀 [部署指南](DEPLOYMENT.md) - 多平台部署方案
- 🤝 [贡献指南](CONTRIBUTING.md) - 如何参与项目
- 📝 [更新日志](CHANGELOG.md) - 版本更新历史

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 快速开始贡献
```bash
# 1. Fork 并克隆
git clone https://github.com/YOUR_USERNAME/GitHub-contribution-chart.git

# 2. 创建功能分支
git checkout -b feature/amazing-feature

# 3. 提交更改
git commit -m "feat: 添加新功能"

# 4. 推送并创建 PR
git push origin feature/amazing-feature
```

详细贡献指南请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [github-contributions-chart](https://github-contributions-chart-nine.vercel.app/) - 前端图表生成服务
- [Puppeteer](https://pptr.dev/) - 浏览器自动化工具
- [Express](https://expressjs.com/) - Web 框架
- 所有贡献者 ❤️

## 📞 支持与联系

- 📝 提交 [Issue](../../issues)
- 💬 [Discussions](../../discussions)
- ⭐ 如果这个项目对你有帮助，欢迎给个 Star！

---

**最后更新**: 2026年2月7日  
**版本**: v1.1.0
