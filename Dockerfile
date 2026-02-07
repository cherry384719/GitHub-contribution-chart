# 使用最新的官方 Puppeteer 镜像 (包含 Chrome 和所有运行依赖)
FROM ghcr.io/puppeteer/puppeteer:latest

# 切换到 root 用户安装中文字体，确保图表文字显示正常
USER root
RUN apt-get update && apt-get install -y \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-freefont-ttf \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制 package.json 并安装最新依赖
COPY package*.json ./
RUN npm install

# 复制源代码
COPY . .

# 修正目录所有权
RUN chown -R pptruser:pptruser /app

# 切换回安全用户
USER pptruser

# Hugging Face 必须使用 7860 端口
ENV PORT=7860
EXPOSE 7860

# 启动程序
CMD ["node", "new_Crawler.js"]