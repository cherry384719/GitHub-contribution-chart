# 使用官方 Node.js 镜像
FROM node:20-slim

# 安装 Puppeteer 所需的依赖
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-ipafont-gothic \
  fonts-wqy-zenhei \
  fonts-thai-tlwg \
  fonts-kacst \
  fonts-freefont-ttf \
  libxss1 \
  libxtst6 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 设置 Puppeteer 使用系统安装的 Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "new_Crawler.js"]
