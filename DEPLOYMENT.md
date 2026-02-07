# 部署指南

本文档提供 GitHub Contributions Chart API 的详细部署方案，涵盖多种部署平台和场景。

## 目录

- [本地开发部署](#本地开发部署)
- [Docker 部署](#docker-部署)
- [云平台部署](#云平台部署)
  - [Hugging Face Spaces](#hugging-face-spaces)
  - [Railway](#railway)
  - [Render](#render)
  - [Vercel](#vercel-不推荐)
- [云服务器部署](#云服务器部署)
  - [阿里云/腾讯云 ECS](#阿里云腾讯云-ecs)
  - [AWS EC2](#aws-ec2)
- [容器编排部署](#容器编排部署)
  - [Docker Compose](#docker-compose)
  - [Kubernetes](#kubernetes)
- [反向代理配置](#反向代理配置)
- [生产环境优化](#生产环境优化)

---

## 本地开发部署

### 系统要求
- **操作系统**: macOS / Linux / Windows (WSL2)
- **Node.js**: >= 14.x (推荐 18.x LTS)
- **内存**: 至少 2GB RAM
- **磁盘**: 500MB+

### 步骤

#### 1. 克隆项目
```bash
git clone https://github.com/your-username/GitHub-contribution-chart.git
cd GitHub-contribution-chart
```

#### 2. 安装依赖
```bash
npm install
```

#### 3. 启动服务
```bash
# 默认端口 3000
node crawler.js

# 指定端口
PORT=8080 node crawler.js

# 后台运行
nohup node crawler.js > app.log 2>&1 &
```

#### 4. 测试服务
```bash
# 健康检查
curl http://localhost:3000/health

# 生成图表
curl http://localhost:3000/torvalds -o test.png
open test.png  # macOS
xdg-open test.png  # Linux
```

### 开发建议
- 使用 `nodemon` 实现热重载：
  ```bash
  npm install -g nodemon
  nodemon crawler.js
  ```
- 配置环境变量文件 `.env`（需安装 `dotenv`）

---

## Docker 部署

### 优势
- ✅ 环境一致性
- ✅ 包含所有 Puppeteer 依赖
- ✅ 易于扩展和迁移
- ✅ 内存和资源隔离

### 步骤

#### 1. 构建镜像
```bash
docker build -t github-chart-api:latest .
```

#### 2. 运行容器
```bash
# 基础运行
docker run -d \
  --name github-chart \
  -p 7860:7860 \
  github-chart-api:latest

# 带资源限制
docker run -d \
  --name github-chart \
  -p 7860:7860 \
  --memory=2g \
  --cpus=2 \
  --shm-size=2gb \
  github-chart-api:latest

# 自定义端口
docker run -d \
  --name github-chart \
  -p 3000:3000 \
  -e PORT=3000 \
  github-chart-api:latest
```

#### 3. 管理容器
```bash
# 查看日志
docker logs -f github-chart

# 停止容器
docker stop github-chart

# 重启容器
docker restart github-chart

# 删除容器
docker rm -f github-chart

# 进入容器调试
docker exec -it github-chart /bin/bash
```

#### 4. 推送到镜像仓库
```bash
# Docker Hub
docker tag github-chart-api:latest your-username/github-chart-api:latest
docker push your-username/github-chart-api:latest

# 阿里云容器镜像服务
docker login --username=your-aliyun-id registry.cn-hangzhou.aliyuncs.com
docker tag github-chart-api:latest registry.cn-hangzhou.aliyuncs.com/your-namespace/github-chart-api:latest
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/github-chart-api:latest
```

---

## 云平台部署

### Hugging Face Spaces

**推荐指数**: ⭐⭐⭐⭐⭐  
**费用**: 免费  
**难度**: 简单

#### 特点
- 完全免费的 Docker 托管
- 自动 HTTPS
- CDN 加速
- 社区友好

#### 部署步骤

1. **创建新 Space**
   - 访问 https://huggingface.co/spaces
   - 点击 "Create new Space"
   - 填写信息：
     - **Owner**: 你的用户名
     - **Space name**: `github-chart-api`（自定义）
     - **License**: MIT
     - **SDK**: 选择 **Docker**
     - **Visibility**: Public（或 Private）

2. **上传文件**
   
   方式 A：Web 界面上传
   - 点击 "Files" → "Add file"
   - 上传：`crawler.js`, `package.json`, `Dockerfile`

   方式 B：Git 推送（推荐）
   ```bash
   # 安装 Hugging Face CLI
   pip install huggingface_hub
   huggingface-cli login

   # 克隆 Space 仓库
   git clone https://huggingface.co/spaces/YOUR_USERNAME/github-chart-api
   cd github-chart-api

   # 复制文件
   cp /path/to/your/project/{crawler.js,package.json,Dockerfile} .

   # 提交推送
   git add .
   git commit -m "Initial deployment"
   git push
   ```

3. **等待构建**
   - 构建时间约 3-5 分钟
   - 查看 "Logs" 标签页监控进度

4. **访问服务**
   ```
   https://YOUR_USERNAME-github-chart-api.hf.space/torvalds
   ```

#### 注意事项
- ⚠️ 端口必须是 7860（Dockerfile 中已配置）
- ⚠️ 免费版有资源限制（2 核 16GB RAM）
- ⚠️ 长时间无请求会休眠，首次访问需等待唤醒

---

### Railway

**推荐指数**: ⭐⭐⭐⭐⭐  
**费用**: 免费额度 $5/月，超出按量付费  
**难度**: 极简

#### 特点
- 自动检测 Dockerfile
- 自动 HTTPS 和域名
- GitHub 集成
- 友好的管理界面

#### 部署步骤

1. **连接 GitHub**
   - 访问 https://railway.app
   - 使用 GitHub 登录
   - 点击 "New Project" → "Deploy from GitHub repo"
   - 选择你的仓库

2. **自动部署**
   - Railway 自动检测 Dockerfile
   - 无需任何配置即可部署
   - 等待 2-3 分钟

3. **配置域名**
   - 点击项目 → "Settings" → "Domains"
   - 点击 "Generate Domain" 获取免费子域名
   - 或绑定自定义域名

4. **环境变量**（可选）
   - 点击 "Variables" 标签
   - 添加 `PORT` 等环境变量（Railway 会自动设置）

5. **访问服务**
   ```
   https://your-project.railway.app/torvalds
   ```

#### 注意事项
- Railway 会自动分配端口，建议使用环境变量 `PORT`
- 更新 Dockerfile：
  ```dockerfile
  ENV PORT=${PORT:-7860}
  EXPOSE ${PORT}
  ```

---

### Render

**推荐指数**: ⭐⭐⭐⭐  
**费用**: 免费版（有限制），Pro $7/月起  
**难度**: 简单

#### 特点
- 免费静态站点托管
- Docker 支持良好
- 自动 SSL
- 简单易用

#### 部署步骤

1. **创建 Web Service**
   - 访问 https://render.com
   - 点击 "New" → "Web Service"
   - 连接 GitHub 仓库

2. **配置服务**
   - **Name**: `github-chart-api`
   - **Runtime**: Docker
   - **Region**: Oregon (US West) 或其他
   - **Branch**: main
   - **Docker Build Context**: `.`
   - **Docker Dockerfile Path**: `./Dockerfile`

3. **设置健康检查**
   - **Health Check Path**: `/health`

4. **部署**
   - 点击 "Create Web Service"
   - 等待构建完成（3-5 分钟）

5. **访问服务**
   ```
   https://github-chart-api.onrender.com/torvalds
   ```

#### 免费版限制
- ⚠️ 15 分钟无请求后会休眠
- ⚠️ 唤醒时间较长（30 秒 - 1 分钟）
- ⚠️ 每月 750 小时运行时间
- 升级到 Pro 可解除限制

---

### Vercel (不推荐)

**推荐指数**: ⭐⭐  
**费用**: 免费  
**难度**: 较难

#### 为什么不推荐？
- ❌ Serverless 环境对 Puppeteer 支持差
- ❌ 需要使用 `chrome-aws-lambda`
- ❌ 50MB 部署大小限制
- ❌ 10 秒函数执行超时（Hobby 版）
- ✅ 但如果你只是想尝试...

#### 替代方案（使用外部浏览器）

1. **使用 Browserless.io**
   ```javascript
   const puppeteer = require('puppeteer-core');
   const browser = await puppeteer.connect({
     browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`
   });
   ```

2. **创建 `vercel.json`**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "crawler.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/crawler.js"
       }
     ]
   }
   ```

3. **部署**
   ```bash
   npm install -g vercel
   vercel
   ```

---

## 云服务器部署

### 阿里云/腾讯云 ECS

#### 系统要求
- **系统**: Ubuntu 20.04+ / CentOS 7+
- **配置**: 2 核 4GB（最低 1 核 2GB）
- **带宽**: 1Mbps+

#### 部署步骤

##### 1. 连接服务器
```bash
ssh root@your-server-ip
```

##### 2. 安装 Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

##### 3. 安装 Puppeteer 依赖
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  fonts-wqy-zenhei \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils

# CentOS
sudo yum install -y \
  alsa-lib \
  atk \
  cups-libs \
  gtk3 \
  ipa-gothic-fonts \
  libXcomposite \
  libXcursor \
  libXdamage \
  libXext \
  libXi \
  libXrandr \
  libXScrnSaver \
  libXtst \
  pango \
  xorg-x11-fonts-100dpi \
  xorg-x11-fonts-75dpi \
  xorg-x11-fonts-cyrillic \
  xorg-x11-fonts-misc \
  xorg-x11-fonts-Type1 \
  xorg-x11-utils
```

##### 4. 克隆项目
```bash
cd /opt
git clone https://github.com/your-username/GitHub-contribution-chart.git
cd GitHub-contribution-chart
npm install
```

##### 5. 使用 PM2 管理进程
```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start crawler.js --name github-chart

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs github-chart
pm2 monit

# 重启服务
pm2 restart github-chart

# 停止服务
pm2 stop github-chart
```

##### 6. 配置防火墙
```bash
# Ubuntu (UFW)
sudo ufw allow 3000/tcp
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# 云服务器安全组
# 在控制台添加入站规则：TCP 3000
```

##### 7. 配置 Nginx 反向代理（推荐）
```bash
# 安装 Nginx
sudo apt-get install -y nginx  # Ubuntu
sudo yum install -y nginx      # CentOS

# 创建配置文件
sudo nano /etc/nginx/sites-available/github-chart
```

Nginx 配置内容：
```nginx
# 限流配置
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;

upstream github_chart {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    # 限流
    limit_req zone=api burst=5 nodelay;

    # 访问日志
    access_log /var/log/nginx/github-chart-access.log;
    error_log /var/log/nginx/github-chart-error.log;

    location / {
        proxy_pass http://github_chart;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态资源缓存（如果有）
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        proxy_pass http://github_chart;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置：
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/github-chart /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

##### 8. 配置 HTTPS (Let's Encrypt)
```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书并自动配置
sudo certbot --nginx -d your-domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

---

### AWS EC2

流程类似阿里云，主要差异：

1. **安全组配置**
   - 在 EC2 控制台添加入站规则
   - 类型：自定义 TCP，端口：3000

2. **系统选择**
   - 推荐 Amazon Linux 2 或 Ubuntu 20.04

3. **弹性 IP**
   - 分配并绑定弹性 IP 避免重启后 IP 变化

---

## 容器编排部署

### Docker Compose

适合单机多容器管理。

#### docker-compose.yml
```yaml
version: '3.8'

services:
  github-chart:
    build: .
    container_name: github-chart-api
    ports:
      - "7860:7860"
    environment:
      - PORT=7860
    restart: unless-stopped
    mem_limit: 2g
    cpus: 2
    shm_size: 2gb
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7860/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # 可选：添加 Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - github-chart
    restart: unless-stopped
```

#### 使用方法
```bash
# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 重启
docker-compose restart

# 停止
docker-compose down

# 更新并重启
docker-compose up -d --build
```

---

### Kubernetes

适合大规模生产环境。

#### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: github-chart-api
  labels:
    app: github-chart
spec:
  replicas: 3
  selector:
    matchLabels:
      app: github-chart
  template:
    metadata:
      labels:
        app: github-chart
    spec:
      containers:
      - name: github-chart
        image: your-registry/github-chart-api:latest
        ports:
        - containerPort: 7860
        env:
        - name: PORT
          value: "7860"
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 7860
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 7860
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: github-chart-service
spec:
  type: LoadBalancer
  selector:
    app: github-chart
  ports:
  - protocol: TCP
    port: 80
    targetPort: 7860
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: github-chart-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - chart.yourdomain.com
    secretName: github-chart-tls
  rules:
  - host: chart.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: github-chart-service
            port:
              number: 80
```

#### 部署命令
```bash
# 应用配置
kubectl apply -f deployment.yaml

# 查看状态
kubectl get pods
kubectl get services
kubectl get ingress

# 查看日志
kubectl logs -f deployment/github-chart-api

# 扩容
kubectl scale deployment github-chart-api --replicas=5

# 更新镜像
kubectl set image deployment/github-chart-api github-chart=your-registry/github-chart-api:v2

# 回滚
kubectl rollout undo deployment/github-chart-api
```

---

## 反向代理配置

### Nginx 完整配置

```nginx
# /etc/nginx/nginx.conf 或独立配置文件

# 限流配置（防止滥用）
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=20r/m;
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

# 缓存配置（可选）
proxy_cache_path /var/cache/nginx/github-chart 
    levels=1:2 
    keys_zone=chart_cache:10m 
    max_size=1g 
    inactive=60m 
    use_temp_path=off;

upstream github_chart_backend {
    least_conn;  # 最少连接负载均衡
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    # 如果有多个实例
    # server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
    # server 127.0.0.1:3002 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name chart.yourdomain.com;

    # HTTP 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name chart.yourdomain.com;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/chart.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chart.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 访问日志
    access_log /var/log/nginx/github-chart-access.log combined;
    error_log /var/log/nginx/github-chart-error.log warn;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 限流和限连
    limit_req zone=api_limit burst=10 nodelay;
    limit_conn conn_limit 10;

    # 主路由
    location / {
        proxy_pass http://github_chart_backend;
        proxy_http_version 1.1;
        
        # 请求头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # 健康检查端点（不限流）
    location /health {
        limit_req off;
        limit_conn off;
        proxy_pass http://github_chart_backend;
        access_log off;
    }

    # 可选：启用 Nginx 缓存
    location ~ ^/[a-zA-Z0-9-]+$ {
        proxy_pass http://github_chart_backend;
        proxy_cache chart_cache;
        proxy_cache_key "$scheme$request_method$host$request_uri";
        proxy_cache_valid 200 10m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

### Caddy 配置

Caddy 自动处理 HTTPS 证书，配置更简单：

```caddyfile
chart.yourdomain.com {
    # 反向代理
    reverse_proxy localhost:3000

    # 速率限制（需要插件）
    rate_limit {
        zone dynamic {
            key {remote_host}
            events 20
            window 1m
        }
    }

    # 日志
    log {
        output file /var/log/caddy/github-chart.log
        format json
    }

    # 压缩
    encode gzip

    # 安全头
    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
    }
}
```

---

## 生产环境优化

### 1. 性能优化

#### 使用 Redis 缓存
```javascript
const redis = require('redis');
const client = redis.createClient();

async function getCachedImage(username, theme) {
  const key = `chart:${username}:${theme}`;
  const cached = await client.get(key);
  if (cached) {
    return Buffer.from(cached, 'base64');
  }
  return null;
}

async function setCachedImage(username, theme, buffer) {
  const key = `chart:${username}:${theme}`;
  await client.setEx(key, 1800, buffer.toString('base64'));
}
```

#### 增加并发数
```javascript
// 根据服务器配置调整
const MAX_CONCURRENT_REQUESTS = process.env.MAX_CONCURRENT || 10;
```

#### 使用 Cluster 模式
```javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // 启动 Express 服务
  require('./crawler.js');
}
```

### 2. 监控和告警

#### 使用 Prometheus + Grafana

1. **安装 prom-client**
```bash
npm install prom-client
```

2. **添加监控指标**
```javascript
const promClient = require('prom-client');
const register = new promClient.Registry();

// 默认指标
promClient.collectDefaultMetrics({ register });

// 自定义指标
const requestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const cacheHits = new promClient.Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  registers: [register]
});

// 暴露指标端点
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

3. **Prometheus 配置**
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'github-chart'
    static_configs:
      - targets: ['localhost:3000']
```

### 3. 日志管理

#### 使用 Winston
```bash
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// 使用
logger.info('Server started', { port: 3000 });
logger.error('Request failed', { error: err.message });
```

### 4. 安全加固

#### 添加速率限制中间件
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 20, // 最多 20 个请求
  message: '请求过于频繁，请稍后再试',
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);
```

#### 添加 Helmet 安全头
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

## 常见问题

### Q: 如何选择部署平台？

| 需求 | 推荐平台 |
|-----|---------|
| 快速免费体验 | Hugging Face Spaces |
| 个人项目/小流量 | Railway / Render 免费版 |
| 生产环境/中流量 | Railway Pro / Render Pro |
| 企业级/大流量 | 云服务器 + K8s |
| 最低成本 | Hugging Face (完全免费) |

### Q: 需要多大的服务器配置？

| 日请求量 | 推荐配置 | 并发数 |
|---------|---------|--------|
| < 1000 | 1 核 2GB | 3 |
| 1000-10000 | 2 核 4GB | 5 |
| 10000-50000 | 4 核 8GB | 10 |
| > 50000 | 8 核 16GB + 集群 | 20+ |

### Q: 如何实现高可用？

1. **多实例部署** - Nginx 负载均衡
2. **健康检查** - 自动剔除故障节点
3. **进程守护** - PM2 / Supervisor 自动重启
4. **数据持久化** - Redis 缓存
5. **监控告警** - Prometheus + Grafana

---

## 总结

本文档涵盖了从本地开发到生产环境的完整部署方案。根据你的需求选择合适的部署方式：

- **快速演示**: 本地部署
- **免费托管**: Hugging Face Spaces
- **快速上线**: Railway / Render
- **生产环境**: 云服务器 + Nginx + PM2
- **大规模**: Kubernetes 集群

如有问题，欢迎提交 Issue！
