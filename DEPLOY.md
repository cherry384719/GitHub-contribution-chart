# Railway 部署指南

## 方法 1：通过 Railway CLI 部署（推荐）

### 1. 安装 Railway CLI

```bash
# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh

# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# 或使用 npm
npm install -g @railway/cli
```

### 2. 登录 Railway

```bash
railway login
```

这会打开浏览器进行授权。

### 3. 初始化项目

在项目目录下运行：

```bash
railway init
```

按提示选择：
- 创建新项目或选择现有项目
- 输入项目名称

### 4. 部署

```bash
railway up
```

等待部署完成，你会看到部署日志。

### 5. 获取部署地址

```bash
# 生成公开域名
railway domain

# 查看项目信息
railway status
```

---

## 方法 2：通过 GitHub 部署

### 1. 创建 GitHub 仓库

```bash
# 初始化 git（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 关联远程仓库
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

### 2. 在 Railway 上部署

1. 访问 [railway.app](https://railway.app)
2. 点击 "Start a New Project"
3. 选择 "Deploy from GitHub repo"
4. 授权并选择你的仓库
5. Railway 会自动检测 Dockerfile 并部署

---

## 方法 3：一键部署

点击下方按钮直接部署：

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/你的用户名/你的仓库名)

---

## 环境变量配置（可选）

在 Railway 项目设置中可以添加环境变量：

```bash
PORT=3000  # Railway 会自动设置，通常不需要手动配置
```

---

## 常用命令

```bash
# 查看日志
railway logs

# 查看服务状态
railway status

# 打开项目控制台
railway open

# 本地连接到 Railway 服务
railway link

# 添加环境变量
railway variables set KEY=VALUE
```

---

## 验证部署

部署成功后：

```bash
# 测试生成图表（替换为你的 Railway 域名）
curl https://your-app.railway.app/sallar

# 测试健康检查
curl https://your-app.railway.app/health
```

---

## 价格说明

- **免费额度**：每月 $5 的免费额度
- **付费计划**：按使用量计费
- **估算**：这个服务在低流量下通常在免费额度内

---

## 故障排查

### 部署失败

```bash
# 查看详细日志
railway logs --deployment

# 重新部署
railway up --detach
```

### 内存不足

在 Railway 控制台中增加内存限制（Settings → Resources）

### Puppeteer 启动失败

确保 Dockerfile 正确安装了 Chromium 依赖。

---

## 性能优化建议

1. **启用 CDN**：使用 Cloudflare 等 CDN 缓存图片
2. **数据库缓存**：添加 Redis 缓存常用结果
3. **增加实例**：在 Railway 中可以添加多个实例

---

## 更多资源

- [Railway 官方文档](https://docs.railway.app)
- [Puppeteer 文档](https://pptr.dev)
- [项目仓库](https://github.com/你的用户名/你的仓库名)
