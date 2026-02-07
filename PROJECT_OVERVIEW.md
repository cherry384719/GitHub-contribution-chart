# 项目概览

GitHub Contributions Chart API - 完整的项目文档索引和快速导航。

## 📁 项目结构

```
GitHub-contribution-chart/
├── crawler.js              # 主应用程序（Express + Puppeteer）
├── package.json            # 项目依赖配置
├── Dockerfile              # Docker 镜像构建文件
├── .gitignore              # Git 忽略规则
│
├── README.md               # 📖 项目主文档（从这里开始）
├── API.md                  # 📡 API 接口详细文档
├── DEPLOYMENT.md           # 🚀 部署指南（多平台）
├── CONTRIBUTING.md         # 🤝 贡献者指南
├── CHANGELOG.md            # 📝 版本更新历史
└── LICENSE                 # ⚖️ MIT 许可证
```

## 📚 文档导航

### 🎯 快速开始

| 文档 | 描述 | 适合人群 |
|------|------|---------|
| [README.md](README.md) | 项目简介、功能特性、快速开始 | 所有用户 |
| [DEPLOYMENT.md](DEPLOYMENT.md) | 详细的部署方案和配置指南 | 部署人员 |

### 📖 深入了解

| 文档 | 描述 | 适合人群 |
|------|------|---------|
| [API.md](API.md) | API 端点、参数、响应格式、集成示例 | 开发者 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 开发环境、代码规范、提交流程 | 贡献者 |
| [CHANGELOG.md](CHANGELOG.md) | 版本历史和更新内容 | 所有用户 |

## 🚀 5 分钟快速部署

### 本地测试
```bash
# 1. 克隆项目
git clone <your-repo-url>
cd GitHub-contribution-chart

# 2. 安装依赖
npm install

# 3. 启动服务
node crawler.js

# 4. 测试
curl http://localhost:3000/torvalds -o test.png
```

### Docker 部署
```bash
# 1. 构建镜像
docker build -t github-chart-api .

# 2. 运行容器
docker run -d -p 7860:7860 github-chart-api

# 3. 测试
curl http://localhost:7860/torvalds -o test.png
```

### Hugging Face Spaces（推荐）
1. 访问 https://huggingface.co/spaces
2. 创建新 Space，选择 Docker SDK
3. 上传所有文件或通过 Git 推送
4. 等待自动构建（3-5 分钟）
5. 访问：`https://YOUR_USERNAME-YOUR_SPACE.hf.space/username`

## 🔑 核心功能

### 主要特性
- ✅ 生成 GitHub 贡献图表（PNG 格式）
- ✅ 14+ 种主题支持
- ✅ 智能缓存（30 分钟）
- ✅ 并发控制（最大 5 请求）
- ✅ 自动重试机制
- ✅ 健康检查端点
- ✅ Docker 支持

### API 端点
```
GET /:username              # 生成图表
GET /:username?theme=xxx    # 指定主题
GET /health                 # 健康检查
```

## 💡 使用示例

### 在 HTML 中使用
```html
<img src="https://your-api.com/torvalds" alt="GitHub Chart">
<img src="https://your-api.com/tj?theme=dracula" alt="GitHub Chart">
```

### 在 Markdown 中使用
```markdown
![GitHub Chart](https://your-api.com/torvalds)
![GitHub Chart](https://your-api.com/tj?theme=halloween)
```

### 命令行使用
```bash
# 下载图片
curl https://your-api.com/torvalds -o chart.png

# 带主题
curl "https://your-api.com/torvalds?theme=dracula" -o chart.png
```

## 🎨 主题预览

| 主题 | 代码 | 风格 |
|------|------|------|
| Standard | `standard` | GitHub 默认绿色 |
| Dracula | `dracula` | 紫粉深色主题 |
| Halloween | `halloween` | 橙黄色 |
| GitHub Dark | `githubDark` | 官方深色模式 |
| Panda | `panda` | 熊猫配色 |
| ... | ... | [查看完整列表](README.md#主题列表) |

## 🛠️ 技术栈

### 核心技术
- **Node.js** (18.x+) - 运行环境
- **Express** (4.x) - Web 框架
- **Puppeteer** (24.x) - 浏览器自动化

### 架构特点
```
客户端请求
    ↓
参数验证
    ↓
缓存检查 ──→ 命中 ──→ 直接返回
    ↓ 未命中
并发控制队列
    ↓
Puppeteer 渲染
    ↓
Canvas → PNG
    ↓
缓存 + 返回
```

## 📊 性能指标

| 指标 | 数值 |
|------|------|
| 响应时间（缓存命中） | < 10ms |
| 响应时间（首次生成） | 2-4s |
| 图片大小 | 50-150KB |
| 内存占用 | 500MB-1GB |
| 并发能力 | 5 请求/秒 |

## 🌐 部署平台对比

| 平台 | 免费额度 | 难度 | 推荐度 |
|------|---------|------|--------|
| Hugging Face Spaces | ✅ 完全免费 | ⭐ 简单 | ⭐⭐⭐⭐⭐ |
| Railway | $5/月 | ⭐ 极简 | ⭐⭐⭐⭐⭐ |
| Render | ✅ 有限制 | ⭐⭐ 简单 | ⭐⭐⭐⭐ |
| 云服务器 | ❌ 付费 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐ |
| Vercel | ✅ 有限 | ⭐⭐⭐⭐ 困难 | ⭐⭐ |

详细对比请查看 [DEPLOYMENT.md](DEPLOYMENT.md)

## 🔧 配置选项

### 环境变量
```bash
PORT=3000                   # 服务端口
```

### 代码配置
```javascript
MAX_CONCURRENT_REQUESTS = 5  # 最大并发数
CACHE_TTL = 30 * 60 * 1000  # 缓存时间（毫秒）
MAX_RETRIES = 2              # 重试次数
```

详细配置说明请查看 [README.md](README.md#配置说明)

## 🐛 问题排查

### 快速诊断
```bash
# 1. 检查服务状态
curl http://localhost:3000/health

# 2. 测试基本功能
curl http://localhost:3000/torvalds -o test.png

# 3. 查看日志
# PM2: pm2 logs github-chart
# Docker: docker logs -f <container-id>
```

### 常见问题
- **浏览器启动失败** → 安装缺失的系统依赖
- **内存不足** → 减少并发数或增加内存
- **生成超时** → 检查网络连接
- **字体显示异常** → 安装中文字体

完整故障排除请查看 [DEPLOYMENT.md](DEPLOYMENT.md#故障排除)

## 🤝 如何贡献

1. **Fork 项目** - 创建你自己的副本
2. **创建分支** - `git checkout -b feature/amazing-feature`
3. **提交更改** - `git commit -m 'feat: 添加新功能'`
4. **推送分支** - `git push origin feature/amazing-feature`
5. **创建 PR** - 提交 Pull Request

详细指南请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

## 📋 开发检查清单

### 提交前检查
- [ ] 代码遵循项目规范
- [ ] 添加必要的注释
- [ ] 在本地测试通过
- [ ] 更新相关文档
- [ ] 提交信息清晰明确

### 发布前检查
- [ ] 更新 CHANGELOG.md
- [ ] 更新版本号（package.json）
- [ ] 测试所有部署方式
- [ ] 更新文档截图（如有）
- [ ] 创建 Release 标签

## 🔐 安全建议

### 生产环境必做
- ✅ 配置 HTTPS
- ✅ 添加速率限制
- ✅ 设置访问日志
- ✅ 配置健康检查
- ✅ 启用防火墙

### 可选加固
- 添加 API Token 认证
- 配置 IP 白名单
- 使用 CDN 加速
- 启用请求签名

详细方案请查看 [DEPLOYMENT.md](DEPLOYMENT.md#安全加固)

## 📞 获取帮助

### 问题和讨论
- 🐛 [报告 Bug](../../issues/new?labels=bug)
- 💡 [功能建议](../../issues/new?labels=enhancement)
- 💬 [技术讨论](../../discussions)
- 📚 [查看 Wiki](../../wiki)

### 社区资源
- GitHub Issues - 问题追踪
- Discussions - 技术讨论
- Wiki - 知识库（待建设）

## 📈 项目状态

- **当前版本**: v1.1.0
- **最后更新**: 2026年2月7日
- **维护状态**: ✅ 活跃维护
- **许可证**: MIT

## 🎯 路线图

### v1.2.0 (计划中)
- [ ] 单元测试和集成测试
- [ ] Redis 缓存支持
- [ ] Prometheus 监控
- [ ] 速率限制中间件

### v1.3.0 (未来)
- [ ] 自定义图表尺寸
- [ ] WebP 格式支持
- [ ] 批量生成接口
- [ ] 管理后台

查看完整路线图请访问 [CHANGELOG.md](CHANGELOG.md)

## 📜 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

这意味着你可以：
- ✅ 商业使用
- ✅ 修改代码
- ✅ 分发副本
- ✅ 私人使用

条件：
- 📝 保留版权声明
- 📝 包含许可证副本

## ⭐ 支持项目

如果这个项目对你有帮助，请考虑：

- ⭐ 给项目加星
- 🔀 Fork 并改进
- 🐛 报告问题
- 💡 提出建议
- 📝 改进文档
- 🌍 分享给朋友

---

**感谢使用 GitHub Contributions Chart API！**

有问题？查看 [FAQ](API.md#faq) 或 [提交 Issue](../../issues)
