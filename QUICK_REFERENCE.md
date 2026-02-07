# 快速参考

GitHub Contributions Chart API 常用命令和配置速查表。

## 🚀 快速启动

### 本地运行
```bash
npm install && node crawler.js
```

### Docker 运行
```bash
docker build -t github-chart . && docker run -d -p 7860:7860 github-chart
```

## 📡 API 端点

| 端点 | 方法 | 说明 | 示例 |
|------|------|------|------|
| `/:username` | GET | 生成图表 | `/torvalds` |
| `/:username?theme=xxx` | GET | 指定主题 | `/tj?theme=dracula` |
| `/health` | GET | 健康检查 | `/health` |

## 🎨 主题代码

```
standard  classic  githubDark  halloween  teal  leftPad
dracula   blue     panda       sunny      pink  YlGnBu
solarizedDark  solarizedLight
```

## 🔧 常用命令

### 开发
```bash
# 安装依赖
npm install

# 启动服务
node crawler.js

# 热重载
nodemon crawler.js

# 指定端口
PORT=8080 node crawler.js
```

### Docker
```bash
# 构建
docker build -t github-chart-api .

# 运行
docker run -d -p 7860:7860 --name github-chart github-chart-api

# 查看日志
docker logs -f github-chart

# 停止
docker stop github-chart

# 重启
docker restart github-chart

# 删除
docker rm -f github-chart
```

### PM2
```bash
# 启动
pm2 start crawler.js --name github-chart

# 查看状态
pm2 status

# 查看日志
pm2 logs github-chart

# 监控
pm2 monit

# 重启
pm2 restart github-chart

# 停止
pm2 stop github-chart

# 开机自启
pm2 startup
pm2 save
```

### Git
```bash
# 克隆
git clone <repo-url>

# 创建分支
git checkout -b feature/my-feature

# 提交
git add .
git commit -m "feat: 添加新功能"

# 推送
git push origin feature/my-feature
```

## 🧪 测试命令

```bash
# 健康检查
curl http://localhost:3000/health

# 生成图表
curl http://localhost:3000/torvalds -o test.png

# 指定主题
curl "http://localhost:3000/tj?theme=dracula" -o test.png

# 查看响应头
curl -I http://localhost:3000/torvalds

# 测试错误
curl http://localhost:3000/invalid-username-!@#

# 并发测试
for i in {1..10}; do curl http://localhost:3000/torvalds -o "test-$i.png" & done; wait

# 缓存测试
time curl http://localhost:3000/torvalds -o test1.png  # 慢
time curl http://localhost:3000/torvalds -o test2.png  # 快
```

## 📊 监控命令

```bash
# 持续监控健康状态
watch -n 5 'curl -s http://localhost:3000/health | jq'

# 查看进程
ps aux | grep node

# 查看端口占用
lsof -i :3000

# 查看内存使用
ps aux | grep node | awk '{print $4 " " $11}'

# Docker 资源使用
docker stats github-chart
```

## ⚙️ 配置参数

### 环境变量
```bash
PORT=3000                    # 服务端口
```

### 代码配置
```javascript
// crawler.js 中的关键配置
MAX_CONCURRENT_REQUESTS = 5   # 最大并发数
CACHE_TTL = 1800000          # 缓存时间（30分钟）
MAX_RETRIES = 2              # 重试次数
```

### Docker 配置
```dockerfile
ENV PORT=7860
EXPOSE 7860
```

### Nginx 配置
```nginx
listen 80;
server_name your-domain.com;
proxy_pass http://127.0.0.1:3000;
```

## 🐛 故障排查

### 问题诊断流程
```bash
# 1. 检查服务状态
curl http://localhost:3000/health

# 2. 查看日志
# PM2: pm2 logs github-chart
# Docker: docker logs -f github-chart
# 直接运行: 查看终端输出

# 3. 检查端口
lsof -i :3000

# 4. 测试基本功能
curl http://localhost:3000/torvalds -o test.png && open test.png
```

### 常见问题快速修复

**浏览器启动失败**
```bash
# Ubuntu/Debian
sudo apt-get install -y ca-certificates fonts-liberation libappindicator3-1 \
  libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 libgbm1 \
  libgtk-3-0 libnspr4 libnss3 libxcomposite1 libxdamage1 libxrandr2 xdg-utils
```

**端口被占用**
```bash
# 查找占用进程
lsof -i :3000
# 或
netstat -tulnp | grep 3000

# 杀死进程
kill -9 <PID>
```

**内存不足**
```javascript
// 在 crawler.js 中修改
const MAX_CONCURRENT_REQUESTS = 2; // 降低并发数
```

## 📦 部署平台快速命令

### Hugging Face Spaces
```bash
# 安装 CLI
pip install huggingface_hub

# 登录
huggingface-cli login

# 克隆 Space
git clone https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE
cd YOUR_SPACE

# 推送更新
git add .
git commit -m "Update"
git push
```

### Railway
```bash
# 安装 CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化
railway init

# 部署
railway up
```

### Render
```bash
# 通过 Web 界面部署
# 或连接 GitHub 仓库自动部署
```

## 🔗 常用 URL

### 开发
```
http://localhost:3000/health          # 健康检查
http://localhost:3000/torvalds        # 测试用户
http://localhost:3000/tj?theme=dracula  # 带主题
```

### 生产
```
https://your-domain.com/username
https://your-domain.com/username?theme=halloween
https://your-domain.com/health
```

## 📝 提交信息模板

```bash
# 新功能
git commit -m "feat: 添加 Redis 缓存支持"

# Bug 修复
git commit -m "fix: 修复用户名验证问题"

# 文档
git commit -m "docs: 更新部署文档"

# 性能优化
git commit -m "perf: 优化图像压缩"

# 重构
git commit -m "refactor: 重构缓存逻辑"

# 测试
git commit -m "test: 添加单元测试"
```

## 🛠️ 有用的脚本

### 批量测试主题
```bash
#!/bin/bash
themes=(standard classic githubDark halloween teal dracula)
for theme in "${themes[@]}"; do
  echo "Testing theme: $theme"
  curl "http://localhost:3000/torvalds?theme=$theme" -o "test-$theme.png"
done
```

### 性能测试
```bash
#!/bin/bash
echo "Performance test starting..."
for i in {1..20}; do
  (time curl -s http://localhost:3000/torvalds -o /dev/null) 2>&1 | grep real
done
```

### 健康检查循环
```bash
#!/bin/bash
while true; do
  status=$(curl -s http://localhost:3000/health | jq -r '.status')
  echo "[$(date)] Status: $status"
  sleep 10
done
```

## 📋 检查清单

### 部署前检查
- [ ] 测试所有 API 端点
- [ ] 验证缓存功能
- [ ] 检查并发控制
- [ ] 测试错误处理
- [ ] 确认健康检查工作正常

### 发布前检查
- [ ] 更新版本号
- [ ] 更新 CHANGELOG.md
- [ ] 更新文档
- [ ] 创建 Git 标签
- [ ] 推送到远程仓库

## 🔢 关键指标

| 指标 | 目标值 |
|------|--------|
| 响应时间（缓存） | < 10ms |
| 响应时间（首次） | < 4s |
| 内存占用 | < 1GB |
| 并发能力 | 5 req/s |
| 错误率 | < 1% |
| 可用性 | > 99% |

## 📞 快速链接

- 📖 [完整文档](README.md)
- 🚀 [部署指南](DEPLOYMENT.md)
- 📡 [API 文档](API.md)
- 🤝 [贡献指南](CONTRIBUTING.md)
- 🐛 [报告问题](../../issues)
- 💬 [讨论区](../../discussions)

---

**提示**: 将本文件添加到浏览器书签，随时快速查阅！

**版本**: v1.1.0 | **更新**: 2026-02-07
