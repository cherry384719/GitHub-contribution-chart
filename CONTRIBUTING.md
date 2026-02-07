# 贡献指南

感谢你对 GitHub Contributions Chart API 项目的关注！本文档将帮助你了解如何为项目做出贡献。

## 目录

- [开始之前](#开始之前)
- [开发环境搭建](#开发环境搭建)
- [项目结构](#项目结构)
- [代码规范](#代码规范)
- [提交流程](#提交流程)
- [功能开发指南](#功能开发指南)
- [测试指南](#测试指南)
- [文档贡献](#文档贡献)

## 开始之前

### 行为准则

- 尊重所有贡献者
- 使用友好和包容的语言
- 接受建设性的批评
- 关注对社区最有利的事情

### 贡献类型

我们欢迎以下类型的贡献：

- 🐛 **Bug 修复** - 修复已知问题
- ✨ **新功能** - 添加新特性
- 📝 **文档改进** - 改善文档质量
- 🎨 **代码优化** - 性能提升、代码重构
- 🧪 **测试** - 添加或改进测试
- 🌍 **国际化** - 多语言支持
- 💡 **建议** - 提出改进想法

## 开发环境搭建

### 1. Fork 和克隆项目

```bash
# Fork 项目到你的 GitHub 账号
# 然后克隆你的 fork
git clone https://github.com/YOUR_USERNAME/GitHub-contribution-chart.git
cd GitHub-contribution-chart

# 添加上游仓库
git remote add upstream https://github.com/ORIGINAL_OWNER/GitHub-contribution-chart.git
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
# 使用 nodemon 实现热重载
npm install -g nodemon
nodemon crawler.js

# 或直接启动
node crawler.js
```

### 4. 测试你的修改

```bash
# 健康检查
curl http://localhost:3000/health

# 生成测试图表
curl http://localhost:3000/torvalds -o test.png
```

## 项目结构

```
GitHub-contribution-chart/
├── crawler.js           # 主应用文件（Express + Puppeteer）
├── package.json         # 项目依赖和脚本
├── Dockerfile           # Docker 构建文件
├── README.md            # 项目主文档
├── DEPLOYMENT.md        # 部署指南
├── CONTRIBUTING.md      # 本文件
└── LICENSE              # MIT 许可证
```

### 核心文件说明

#### crawler.js

主要模块：

1. **Express 服务器**
   - 路由定义
   - 中间件配置

2. **缓存系统**
   - `imageCache` - 内存缓存 Map
   - `getCachedImage()` - 获取缓存
   - `setCachedImage()` - 设置缓存

3. **浏览器管理**
   - `initBrowser()` - 初始化浏览器
   - `generateChart()` - 生成图表核心逻辑

4. **并发控制**
   - `processRequest()` - 请求队列管理
   - `requestQueue` - 请求队列

5. **工具函数**
   - `validateUsername()` - 用户名验证
   - `gracefulShutdown()` - 优雅退出

## 代码规范

### JavaScript 风格

- **模块系统**: ESM (`import/export`)
- **缩进**: 2 个空格
- **引号**: 单引号优先
- **分号**: 总是使用分号
- **命名**:
  - 变量和函数: `camelCase`
  - 常量: `UPPER_SNAKE_CASE`
  - 类: `PascalCase`

### 代码示例

```javascript
// ✅ 好的示例
const MAX_RETRIES = 3;

async function generateChart(username, theme = 'standard') {
  const url = 'https://example.com';
  try {
    const result = await fetchData(url);
    return result;
  } catch (error) {
    console.error('[错误]', error.message);
    throw error;
  }
}

// ❌ 避免的写法
const maxretries = 3;  // 常量应使用大写

async function GenerateChart(username, theme='standard') {  // 函数名应小写开头
  let url = "https://example.com"  // 应使用单引号和分号
  try {
    let result = await fetchData(url)  // 应使用 const
    return result
  } catch(error) {  // catch 前应有空格
    console.error(error)  // 缺少描述性前缀
    throw error
  }
}
```

### 注释规范

```javascript
// 单行注释使用 // 

/**
 * 多行注释使用 JSDoc 风格
 * @param {string} username - GitHub 用户名
 * @param {string} theme - 主题名称
 * @returns {Promise<Buffer>} PNG 图片 Buffer
 */
async function generateChart(username, theme) {
  // 实现...
}

// 🚀 性能优化标记
// ⚠️ 注意事项标记
// 🐛 Bug 修复标记
// ✨ 新功能标记
```

### 日志规范

```javascript
// 使用统一的日志格式
console.log(`[模块] 描述性消息`);
console.error(`[错误] 错误描述:`, error.message);
console.warn(`[警告] 警告信息`);

// 示例
console.log(`[缓存] 命中缓存: ${cacheKey}`);
console.log(`[生成] ✅ 图表生成成功，大小: ${size} KB`);
console.error(`[错误] ❌ 生成失败:`, error.message);
```

## 提交流程

### 1. 创建功能分支

```bash
# 从最新的 main 分支创建
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name

# 或修复 bug
git checkout -b fix/bug-description
```

### 2. 进行修改

- 保持每个提交专注于单一目的
- 编写清晰的提交信息
- 添加必要的测试和文档

### 3. 提交代码

```bash
git add .
git commit -m "feat: 添加新功能描述"

# 或
git commit -m "fix: 修复某个 bug"
```

#### 提交信息格式

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<类型>(<范围>): <简短描述>

<详细描述>

<footer>
```

**类型**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档修改
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例**:
```bash
# 新功能
git commit -m "feat: 添加 Redis 缓存支持"

# Bug 修复
git commit -m "fix: 修复用户名验证正则表达式"

# 文档
git commit -m "docs: 更新部署指南"

# 性能优化
git commit -m "perf: 优化图像压缩算法"
```

### 4. 推送到你的 Fork

```bash
git push origin feature/your-feature-name
```

### 5. 创建 Pull Request

1. 访问你的 Fork 页面
2. 点击 "New Pull Request"
3. 填写 PR 信息：
   - **标题**: 简洁描述你的修改
   - **描述**: 详细说明修改内容、原因和测试方法
   - **关联 Issue**: 如果有相关 Issue，使用 `Fixes #123` 引用

#### PR 模板

```markdown
## 修改类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 性能优化
- [ ] 文档更新
- [ ] 代码重构

## 修改描述
简要描述你的修改...

## 测试
- [ ] 在本地测试通过
- [ ] 添加了单元测试
- [ ] 更新了文档

## 相关 Issue
Fixes #123

## 截图（如果适用）
![screenshot](url)
```

### 6. 代码审查

- 维护者会审查你的 PR
- 根据反馈进行必要的修改
- 所有讨论解决后，PR 将被合并

## 功能开发指南

### 添加新主题支持

目前主题是在前端页面控制的，如果要添加主题验证：

```javascript
// crawler.js
const VALID_THEMES = [
  'standard', 'classic', 'githubDark', 'halloween',
  'teal', 'leftPad', 'dracula', 'blue', 'panda',
  'sunny', 'pink', 'YlGnBu', 'solarizedDark', 'solarizedLight'
];

function validateTheme(theme) {
  return VALID_THEMES.includes(theme);
}

app.get('/:username', async (req, res) => {
  const { theme = 'standard' } = req.query;
  
  if (!validateTheme(theme)) {
    return res.status(400).send('无效的主题');
  }
  
  // ...继续处理
});
```

### 添加 Redis 缓存

```javascript
import redis from 'redis';

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

await redisClient.connect();

async function getCachedImage(username, theme) {
  const cacheKey = getCacheKey(username, theme);
  const cached = await redisClient.get(cacheKey);
  
  if (cached) {
    console.log(`[缓存] Redis 命中: ${cacheKey}`);
    return Buffer.from(cached, 'base64');
  }
  
  return null;
}

async function setCachedImage(username, theme, buffer) {
  const cacheKey = getCacheKey(username, theme);
  await redisClient.setEx(
    cacheKey,
    CACHE_TTL / 1000,
    buffer.toString('base64')
  );
  console.log(`[缓存] Redis 已缓存: ${cacheKey}`);
}
```

### 添加认证中间件

```javascript
function authMiddleware(req, res, next) {
  const apiToken = req.headers['x-api-token'];
  const validToken = process.env.API_TOKEN;
  
  if (validToken && apiToken !== validToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
}

// 应用到需要保护的路由
app.get('/:username', authMiddleware, async (req, res) => {
  // ...
});
```

### 添加 Webhook 通知

```javascript
import axios from 'axios';

async function sendWebhook(event, data) {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) return;
  
  try {
    await axios.post(webhookUrl, {
      event,
      timestamp: new Date().toISOString(),
      data
    });
  } catch (error) {
    console.error('[Webhook] 发送失败:', error.message);
  }
}

// 使用示例
app.get('/:username', async (req, res) => {
  try {
    // ...生成图表
    await sendWebhook('chart_generated', { username, theme });
    res.send(imageBuffer);
  } catch (error) {
    await sendWebhook('chart_failed', { username, error: error.message });
    res.status(500).send('生成失败');
  }
});
```

## 测试指南

### 手动测试

```bash
# 1. 基本功能测试
curl http://localhost:3000/torvalds -o test.png

# 2. 主题测试
for theme in standard dracula halloween githubDark; do
  curl "http://localhost:3000/torvalds?theme=$theme" -o "test-$theme.png"
done

# 3. 错误处理测试
curl http://localhost:3000/invalid-user-name-123456789012345678901234567890
curl http://localhost:3000/nonexistentuser123456

# 4. 并发测试
for i in {1..10}; do
  curl http://localhost:3000/torvalds -o "concurrent-$i.png" &
done
wait

# 5. 缓存测试
time curl http://localhost:3000/torvalds -o test1.png  # 慢
time curl http://localhost:3000/torvalds -o test2.png  # 快（缓存命中）
```

### 自动化测试（未来计划）

```javascript
// test/api.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../crawler.js';

describe('API Tests', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('should generate chart for valid username', async () => {
    const response = await request(app).get('/torvalds');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/png');
  });

  it('should reject invalid username', async () => {
    const response = await request(app).get('/invalid-user-!@#');
    expect(response.status).toBe(400);
  });
});
```

## 文档贡献

### 文档类型

- **README.md** - 项目概述、快速开始
- **DEPLOYMENT.md** - 详细部署指南
- **CONTRIBUTING.md** - 本文件
- **API.md** - API 接口文档（待添加）
- **CHANGELOG.md** - 版本更新日志（待添加）

### 文档编写规范

- 使用清晰的标题层级
- 提供代码示例
- 添加必要的截图
- 保持语言简洁明了
- 更新文档目录

### 文档审查清单

- [ ] 语法和拼写正确
- [ ] 代码示例可运行
- [ ] 链接有效
- [ ] 格式一致
- [ ] 信息准确且最新

## 问题报告

### Bug 报告模板

提交 Issue 时，请包含以下信息：

```markdown
## Bug 描述
清楚简洁地描述 bug

## 复现步骤
1. 访问 '...'
2. 点击 '....'
3. 看到错误

## 预期行为
描述你期望发生什么

## 实际行为
描述实际发生了什么

## 环境信息
- OS: [e.g. macOS 13.0]
- Node.js 版本: [e.g. 18.17.0]
- 部署方式: [e.g. Docker, 本地]

## 日志和截图
如果适用，添加日志输出或截图

## 额外信息
其他相关信息
```

### 功能请求模板

```markdown
## 功能描述
清楚简洁地描述你想要的功能

## 使用场景
为什么需要这个功能？它解决什么问题？

## 建议的实现方案
如果有想法，描述你认为如何实现

## 替代方案
是否考虑过其他替代方案？

## 额外信息
其他相关信息
```

## 获取帮助

如果你在贡献过程中遇到问题：

1. 查看现有的 [Issues](../../issues)
2. 阅读项目文档
3. 在 [Discussions](../../discussions) 提问
4. 联系维护者

## 许可证

通过贡献代码，你同意你的贡献将使用与项目相同的 MIT 许可证。

---

再次感谢你的贡献！🎉
