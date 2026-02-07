# GitHub Contributions Chart Generator

一个基于 Express 和 Puppeteer 的 GitHub 贡献图表生成服务。

## 功能特性

- 🎨 支持多种主题
- 🚀 智能并发控制
- 🔄 自动重试机制
- 💾 24小时缓存
- 🏥 健康检查端点
- 📊 高清图表输出

## 本地运行

```bash
# 安装依赖
npm install

# 启动服务
npm start

# 访问服务
curl http://localhost:3000/YOUR_GITHUB_USERNAME
```

## API 使用

### 生成图表
```
GET /:username?theme=classic
```

**参数：**
- `username`：GitHub 用户名（必需）
- `theme`：图表主题（可选，默认 classic）

**示例：**
```bash
# 默认主题
curl http://localhost:3000/sallar

# 指定主题
curl http://localhost:3000/sallar?theme=halloween
```

### 健康检查
```
GET /health
```

返回服务状态信息。

## 部署到 Railway

详见 [DEPLOY.md](DEPLOY.md)

## License

MIT
