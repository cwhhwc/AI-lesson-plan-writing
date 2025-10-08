# AI-lesson-plan-writing
基于 UniApp + Vue3 的 AI 教案生成工具，助力教师高效备课。
# 📄 AI 教师辅助写作系统

> 🎯 一个基于 Vue3 的 AI 教案生成工具，支持流式响应、消息队列管理与跨页面内容同步  
> 🔗 在线体验：[https://zhezhiai.top](https://zhezhiai.top)  
> 🛠️ 技术栈：uniapp + Vue3 + Vite + Pinia + express + Vercel + Cloudflare

---

## 🌟 项目简介

本项目是一个面向教师群体的 **AI 教学设计辅助工具**，用户输入课程信息后，系统调用大模型 API 自动生成结构化教案，并支持实时编辑与内容复用。

项目从 0 到 1 独立开发，涵盖产品设计、前端架构、核心功能实现、部署上线全流程，具备产品级可用性。

> ✅ 支持国内访问（通过 Cloudflare 代理）  
> ✅ 支持 HTTPS 安全访问  
> ✅ 已上线并可公开体验

---

## 🚀 核心功能

| 功能 | 说明 |
|------|------|
| **双 Token 登录机制** | 使用 `access token` 和 `refresh token` 实现安全会话管理，支持自动续期，避免频繁登录 |
| **消息队列化渲染** | 用户与 AI 的消息按唯一 ID 有序存储，防止流式响应中消息错乱或丢失 |
| **流式响应不间断传输** | 在“教案模式”下，AI 回复以流式方式逐字输出，保证内容完整性和用户体验 |
| **跨页面内容同步** | AI 生成的非正文内容保留在聊天区，教案正文自动同步至编辑器，支持通过选项卡点击跳转 |
| **响应式界面** | 适配 PC 与移动端，提升多场景使用体验 |

---

## 🏗️ 技术架构

```
+------------------+     +---------------------+
|   用户浏览器      | ↔→ |   Vercel (前端部署)   |
+------------------+     +----------+----------+
↓
+---------+----------+
|  Express.js 后端     |
| - 用户认证           |
| - Token 管理         |
| - API 请求代理       |
| - 流式响应转发       |
+---------+----------+
↓
+---------+----------+
|  大模型 API         |
+---------+----------+
```


### 🔧 技术栈
- **前端**：Vue3 + Composition API + Pinia + Vite
- **后端**：Express.js（Node.js）
- **状态管理**：Pinia（前端本地状态）
- **部署平台**：
  - 前端：Vercel
  - 后端：Sealos Cloud
- **CDN 加速**：Cloudflare

---

## 📦 项目运行（开发者模式）

### 1. 克隆项目
```bash
git clone https://github.com/yourname/ai-lesson-plan-generator.git
cd ai-lesson-plan-generator
```

### 2.安装依赖
```bash
npm install
```

### 3. 配置环境变量

前端
```.env
VITE_APP_API_BASE_URL = https://your-express-backend.com
```

后端
## 🔐 后端安全与服务配置

本项目后端使用 `.env` 文件管理敏感信息与服务配置，确保代码安全性与环境可移植性。

### JWT 安全策略
| 配置项 | 值 | 说明 |
|-------|-----|------|
| `ACCESS_TOKEN_SECRET` | 随机长字符串 | 用于签发和验证 JWT |
| `ACCESS_TOKEN_EXPIRATION` | `15m` | 15分钟过期，降低泄露风险 |
| `REFRESH_TOKEN_SECRET` | 独立密钥 | 与 Access Token 使用不同密钥 |
| `REFRESH_TOKEN_EXPIRATION` | `7d` | 7天有效，支持自动续期 |
| `REFRESH_TOKEN_COOKIE_MAX_AGE` | `604800000` | 7天（毫秒），设置 Cookie 过期时间 |

> ✅ 双密钥设计 + HttpOnly Cookie，提升会话安全性

### AI 服务配置
| 配置项 | 说明 |
|-------|------|
| `DASHSCOPE_API_KEY` | 通义千问 API 密钥，仅在后端使用 |
| `DASHSCOPE_APP_ID` | 模型应用 ID，用于指定调用模型 |

> 🔒 所有 AI 请求由后端代理转发，前端不暴露任何密钥

### 数据库与网络
| 配置项 | 说明 |
|-------|------|
| `CONNECTION_STRING` | PostgreSQL 数据库连接地址，包含认证信息 |
| `PORT` | 服务监听端口 |
| `CORS_ORIGIN` | 白名单域名，仅允许指定前端访问，防止 XSS 攻击 |

> 🌐 支持跨域安全通信，适用于前后端分离部署
### 4. 启动开发服务器
```bash
npm run dev:h5
```

### 5. 构建生产版本
```bash
npm run build
```

### 🌐 部署说明
✅ 前后端分离部署

前端：部署于 Vercel，静态资源全球 CDN 加速
后端：使用 Express.js 编写 API 接口，部署于 Vercel Serverless Functions 或独立 Node 服务器（如阿里云 ECS）
🌍 解决国内访问问题
由于 Vercel 在国内访问不稳定，项目通过 Cloudflare 代理 实现加速：

将域名 zhezhai.top 的 NS 记录指向 Cloudflare
添加 CNAME 记录：
@ → cname.vercel-dns.com（橙色云朵）
www → cname.vercel-dns.com（橙色云朵）
开启代理模式（Proxied），启用 CDN 与 DDoS 防护
自动申请 HTTPS 证书

### 🎯 求职说明
本项目为个人全栈作品，用于展示 前端开发、系统设计、部署上线与问题解决能力。

如您是招聘方，欢迎联系我投递简历，期待加入贵团队！
