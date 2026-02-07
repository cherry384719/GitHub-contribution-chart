# API 文档

GitHub Contributions Chart API 的详细接口文档。

## 基础信息

- **Base URL**: `https://your-domain.com` 或 `http://localhost:3000`
- **协议**: HTTP/HTTPS
- **响应格式**: PNG 图片或 JSON

## 端点列表

### 1. 生成贡献图表

生成指定 GitHub 用户的贡献图表。

#### 请求

```http
GET /:username
```

#### 路径参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `username` | string | 是 | GitHub 用户名 |

**用户名格式要求**:
- 长度：1-39 个字符
- 字符：仅允许字母、数字和连字符 `-`
- 限制：不能以连字符开头或结尾
- 示例：`torvalds`, `tj`, `github-user-123`

#### 查询参数

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `theme` | string | 否 | `standard` | 图表主题 |

**可用主题列表**:
- `standard` - GitHub 默认绿色主题
- `classic` - 早期经典风格
- `githubDark` - 官方深色模式
- `halloween` - 万圣节橙黄色
- `teal` - 青色/蓝绿色
- `leftPad` - 极简灰色调
- `dracula` - Dracula 紫粉深色
- `blue` - 蓝色主题
- `panda` - 深紫/淡紫熊猫配色
- `sunny` - 阳光金黄色
- `pink` - 粉色主题
- `YlGnBu` - 黄→绿→蓝渐变
- `solarizedDark` - Solarized 深色
- `solarizedLight` - Solarized 浅色

#### 响应

**成功响应 (200 OK)**

```http
HTTP/1.1 200 OK
Content-Type: image/png
Content-Length: 123456
Cache-Control: public, max-age=86400
X-Cache: HIT

<PNG 二进制数据>
```

**响应头说明**:
| 响应头 | 值 | 说明 |
|--------|-----|------|
| `Content-Type` | `image/png` | 返回 PNG 格式图片 |
| `Cache-Control` | `public, max-age=86400` | 客户端可缓存 24 小时 |
| `X-Cache` | `HIT` / `MISS` | 服务端缓存状态 |

**错误响应**

| 状态码 | 说明 | 响应示例 |
|--------|------|---------|
| 400 | 无效的用户名格式 | `无效的 GitHub 用户名格式` |
| 500 | 生成失败 | `生成图片失败，请检查用户名是否正确或稍后重试` |

#### 请求示例

**cURL**
```bash
# 基本请求
curl https://api.example.com/torvalds -o chart.png

# 指定主题
curl "https://api.example.com/tj?theme=dracula" -o chart.png

# 查看响应头
curl -I https://api.example.com/torvalds

# 带超时设置
curl --max-time 30 https://api.example.com/torvalds -o chart.png
```

**JavaScript (Fetch API)**
```javascript
// 获取图片 Blob
async function getGitHubChart(username, theme = 'standard') {
  const url = `https://api.example.com/${username}?theme=${theme}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const blob = await response.blob();
    const cacheStatus = response.headers.get('X-Cache');
    
    console.log(`Cache status: ${cacheStatus}`);
    return blob;
  } catch (error) {
    console.error('Failed to fetch chart:', error);
    throw error;
  }
}

// 使用示例
const blob = await getGitHubChart('torvalds', 'dracula');
const url = URL.createObjectURL(blob);
document.getElementById('chart').src = url;
```

**Python (requests)**
```python
import requests

def get_github_chart(username, theme='standard'):
    url = f'https://api.example.com/{username}'
    params = {'theme': theme}
    
    response = requests.get(url, params=params, timeout=30)
    
    if response.status_code == 200:
        cache_status = response.headers.get('X-Cache')
        print(f'Cache status: {cache_status}')
        
        with open(f'{username}-{theme}.png', 'wb') as f:
            f.write(response.content)
        
        return response.content
    else:
        raise Exception(f'HTTP {response.status_code}: {response.text}')

# 使用示例
get_github_chart('torvalds', 'dracula')
```

**HTML**
```html
<!-- 直接显示图片 -->
<img src="https://api.example.com/torvalds" alt="GitHub Contributions">

<!-- 带主题 -->
<img src="https://api.example.com/tj?theme=halloween" alt="GitHub Contributions">

<!-- 带加载状态 -->
<img 
  src="https://api.example.com/torvalds" 
  alt="GitHub Contributions"
  loading="lazy"
  onerror="this.src='fallback.png'"
>
```

**Markdown**
```markdown
<!-- 默认主题 -->
![GitHub Contributions](https://api.example.com/torvalds)

<!-- 指定主题 -->
![GitHub Contributions](https://api.example.com/tj?theme=dracula)
```

---

### 2. 健康检查

检查服务运行状态和统计信息。

#### 请求

```http
GET /health
```

#### 参数

无

#### 响应

**成功响应 (200 OK)**

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

**响应字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | string | 服务状态：`ok` 或 `error` |
| `timestamp` | string | ISO 8601 格式的当前时间 |
| `browserRunning` | boolean | Puppeteer 浏览器实例是否运行 |
| `activeRequests` | number | 当前正在处理的请求数 |
| `queueLength` | number | 等待队列中的请求数 |
| `cachedImages` | number | 当前缓存中的图片数量 |
| `uptime` | number | 服务运行时间（秒） |

**错误响应 (503 Service Unavailable)**

```json
{
  "status": "error",
  "message": "Service temporarily unavailable"
}
```

#### 请求示例

**cURL**
```bash
# 基本请求
curl https://api.example.com/health

# 格式化输出
curl -s https://api.example.com/health | jq

# 持续监控
watch -n 5 'curl -s https://api.example.com/health | jq'
```

**JavaScript**
```javascript
async function checkHealth() {
  const response = await fetch('https://api.example.com/health');
  const data = await response.json();
  
  console.log('Status:', data.status);
  console.log('Uptime:', (data.uptime / 3600).toFixed(2), 'hours');
  console.log('Active requests:', data.activeRequests);
  console.log('Queue length:', data.queueLength);
  console.log('Cached images:', data.cachedImages);
  
  return data;
}

// 定期检查
setInterval(checkHealth, 60000); // 每分钟检查一次
```

**Python**
```python
import requests
import time

def check_health():
    response = requests.get('https://api.example.com/health')
    data = response.json()
    
    print(f"Status: {data['status']}")
    print(f"Uptime: {data['uptime'] / 3600:.2f} hours")
    print(f"Active requests: {data['activeRequests']}")
    print(f"Queue length: {data['queueLength']}")
    print(f"Cached images: {data['cachedImages']}")
    
    return data

# 定期检查
while True:
    check_health()
    time.sleep(60)  # 每分钟检查一次
```

---

## 速率限制

### 默认限制

服务端使用并发控制和队列机制：

- **最大并发请求数**: 5
- **队列长度**: 无限制（但超时会自动失败）
- **缓存时间**: 30 分钟

### 推荐限流配置

如果你部署了自己的实例，建议在反向代理层添加限流：

**Nginx 示例**:
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=20r/m;
limit_req zone=api burst=10 nodelay;
```

这样配置后：
- 每个 IP 每分钟最多 20 个请求
- 突发最多允许 10 个请求
- 超出限制返回 429 Too Many Requests

### 最佳实践

1. **使用缓存响应头**
   ```javascript
   // 浏览器会自动缓存 24 小时
   const img = document.createElement('img');
   img.src = 'https://api.example.com/torvalds';
   ```

2. **避免短时间重复请求**
   ```javascript
   // ❌ 不好的做法
   setInterval(() => {
     fetchChart('torvalds');
   }, 1000); // 每秒请求一次

   // ✅ 好的做法
   setInterval(() => {
     fetchChart('torvalds');
   }, 3600000); // 每小时请求一次
   ```

3. **使用条件请求**（未来可能支持）
   ```bash
   curl -H "If-None-Match: \"abc123\"" https://api.example.com/torvalds
   ```

---

## 错误处理

### 错误类型

| HTTP 状态码 | 错误类型 | 说明 |
|------------|---------|------|
| 400 | Bad Request | 请求参数错误（如无效用户名） |
| 429 | Too Many Requests | 请求过于频繁（需配置限流） |
| 500 | Internal Server Error | 服务器内部错误 |
| 503 | Service Unavailable | 服务暂时不可用 |

### 错误响应格式

```
纯文本错误消息
```

示例：
```
无效的 GitHub 用户名格式
```

### 错误处理示例

**JavaScript**
```javascript
async function fetchChartWithRetry(username, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`https://api.example.com/${username}`);
      
      if (response.ok) {
        return await response.blob();
      }
      
      if (response.status === 400) {
        throw new Error('Invalid username format');
      }
      
      if (response.status === 429) {
        // 等待后重试
        await new Promise(r => setTimeout(r, 5000 * (i + 1)));
        continue;
      }
      
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries}...`);
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
}
```

**Python**
```python
import time
import requests

def fetch_chart_with_retry(username, max_retries=3):
    for i in range(max_retries):
        try:
            response = requests.get(
                f'https://api.example.com/{username}',
                timeout=30
            )
            
            if response.status_code == 200:
                return response.content
            
            if response.status_code == 400:
                raise ValueError('Invalid username format')
            
            if response.status_code == 429:
                # 等待后重试
                time.sleep(5 * (i + 1))
                continue
            
            response.raise_for_status()
            
        except requests.Timeout:
            if i == max_retries - 1:
                raise
            print(f'Retry {i + 1}/{max_retries}...')
            time.sleep(2 * (i + 1))
    
    raise Exception('Max retries exceeded')
```

---

## 性能优化建议

### 客户端缓存

利用服务端返回的 `Cache-Control` 头：

```javascript
// Service Worker 缓存示例
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('api.example.com')) {
    event.respondWith(
      caches.open('github-charts').then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
```

### 预加载和懒加载

```html
<!-- 预加载关键图表 -->
<link rel="preload" as="image" href="https://api.example.com/torvalds">

<!-- 懒加载非关键图表 -->
<img 
  src="https://api.example.com/torvalds" 
  loading="lazy"
  alt="GitHub Chart"
>
```

### 批量请求优化

```javascript
// ❌ 串行请求
for (const username of usernames) {
  await fetchChart(username);
}

// ✅ 并行请求（注意控制并发数）
const promises = usernames.map(username => fetchChart(username));
const results = await Promise.all(promises);
```

---

## 集成示例

### React 组件

```jsx
import React, { useState, useEffect } from 'react';

function GitHubChart({ username, theme = 'standard' }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.example.com/${username}?theme=${theme}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChart();

    // 清理 URL
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [username, theme]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <img 
      src={imageUrl} 
      alt={`${username}'s GitHub Contributions`}
      style={{ width: '100%', height: 'auto' }}
    />
  );
}

export default GitHubChart;
```

### Vue 组件

```vue
<template>
  <div class="github-chart">
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <img 
      v-else
      :src="imageUrl" 
      :alt="`${username}'s GitHub Contributions`"
      style="width: 100%; height: auto;"
    />
  </div>
</template>

<script>
export default {
  name: 'GitHubChart',
  props: {
    username: {
      type: String,
      required: true
    },
    theme: {
      type: String,
      default: 'standard'
    }
  },
  data() {
    return {
      loading: true,
      error: null,
      imageUrl: null
    };
  },
  async mounted() {
    await this.fetchChart();
  },
  methods: {
    async fetchChart() {
      try {
        this.loading = true;
        const response = await fetch(
          `https://api.example.com/${this.username}?theme=${this.theme}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const blob = await response.blob();
        this.imageUrl = URL.createObjectURL(blob);
        this.error = null;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  },
  beforeUnmount() {
    if (this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl);
    }
  }
};
</script>
```

---

## 监控和分析

### 健康检查集成

**Uptime Robot 配置**:
- Monitor Type: HTTP(s)
- URL: `https://api.example.com/health`
- Monitoring Interval: 5 minutes
- Alert Contacts: 你的邮箱

**Prometheus 监控**:
```yaml
scrape_configs:
  - job_name: 'github-chart-api'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['api.example.com:3000']
```

---

## FAQ

### Q: 图表多久更新一次？

A: 图表数据来自 GitHub 官方，实时生成。服务端会缓存 30 分钟，客户端建议缓存 24 小时。

### Q: 支持私有仓库吗？

A: 不支持。API 只能获取 GitHub 公开的贡献数据。

### Q: 可以自定义图表样式吗？

A: 目前只支持预设的 14 种主题。如需完全自定义，可以 fork 前端项目修改。

### Q: 有请求次数限制吗？

A: 服务端默认最大并发 5 个请求。如果自行部署，可以配置反向代理限流。

### Q: 生成一张图需要多久？

A: 首次生成约 2-4 秒，缓存命中则 < 10ms。

---

## 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新历史。

## 支持

- 📝 [Issues](../../issues)
- 💬 [Discussions](../../discussions)
- 📚 [Documentation](../../wiki)
