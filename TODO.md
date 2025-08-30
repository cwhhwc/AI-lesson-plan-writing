## 登录/注册流程现代化重构 (V2)

**目标:** 彻底翻新登录注册模块，实现现代化UI、更安全的认证机制和更清晰的代码结构。

### 第一阶段：架构升级 (后端支持 Access/Refresh Token)

- [ ] **任务 1.1: 核心状态管理 - 创建 `authStore`**
  - **目的:** 使用 Pinia 集中管理用户的认证信息和状态。
  - **位置:** `src/stores/auth.js`
  - **实现:**
    - `state`: `accessToken`, `refreshToken`, `user`, `isAuthenticated`
    - `actions`:
      - `login(credentials)`: 调用API，保存双 token。
      - `logout()`: 清除 tokens 和用户信息，重定向到登录页。
      - `refreshToken()`: 异步 action，用于在 access token 过期时获取新的。
      - `loadTokensFromStorage()`: 应用初始化时调用，尝试从本地存储恢复登录状态。

- [ ] **任务 1.2: Token 持久化 - 改造 `token.js`**
  - **目的:** 封装对 Access Token 和 Refresh Token 的本地存储操作。
  - **位置:** `src/utils/token.js`
  - **实现:**
    - `setTokens({ accessToken, refreshToken })`
    - `getAccessToken()`
    - `getRefreshToken()`
    - `removeTokens()`

- [ ] **任务 1.3: 智能请求封装 - 改造 `request.js`**
  - **目的:** 创建一个能自动处理 Token 过期和刷新的全局请求拦截器。这是实现新流程的核心。
  - **位置:** `src/utils/request.js`
  - **实现:**
    - **请求拦截器:** 自动在每个请求头中附加 `Authorization: Bearer ${accessToken}`。
    - **响应拦截器:**
      - 监听 `401 Unauthorized` 错误。
      - 收到 401 后，调用 `authStore.refreshToken()` 获取新 token。
      - 刷新成功后，用新 token 重新发送失败的请求。
      - 刷新失败后 (例如 refresh token 也过期了)，调用 `authStore.logout()` 清理并强制用户重新登录。

### 第二阶段：UI 与逻辑重构

- [ ] **任务 2.1: 统一视觉 - 翻新 UI 并添加 Logo**
  - **目的:** 使登录/注册页面的风格与应用主界面保持一致。
  - **实现:**
    - 分析主界面 (`chat.vue`) 的设计语言（色彩、布局、组件风格）。
    - 将 `src/static/logo.png` 整合进 `login.vue` 和 `register.vue` 的布局中。
    - 提取共用的样式到 `src/styles/auth.scss`，并在两个页面中引入，减少代码重复。

- [ ] **任务 2.2: 逻辑解耦 - 创建 `useAuth` Composable**
  - **目的:** 将表单处理逻辑从 Vue 组件中抽离，使组件代码更简洁。
  - **位置:** `src/composables/useAuth.js`
  - **实现:**
    - 管理表单数据 (`username`, `password` 等) 的 `ref`。
    - 包含表单验证逻辑和错误信息。
    - 暴露 `handleLogin()` 和 `handleRegister()` 方法，内部调用 `authStore` 的 actions。

- [ ] **任务 2.3: 应用重构 - 更新 `login.vue` 和 `register.vue`**
  - **目的:** 将新的架构和 UI 应用到页面组件中。
  - **实现:**
    - 移除组件内旧的业务逻辑和本地状态。
    - 引入并使用 `useAuth` composable 来驱动表单。
    - 登录成功后，使用 `uni.reLaunch()` 跳转到主应用页面，以获得更好的导航体验。

### 第三阶段：整合与验证

- [ ] **任务 3.1: 全面功能测试**
  - **目的:** 确保新流程的稳定性和用户体验。
  - **测试点:**
    - [ ] 正常登录、注册、登出。
    - [ ] Access Token 过期后，API 请求是否能自动刷新并成功。
    - [ ] Refresh Token 过期后，是否会强制用户返回登录页。
    - [ ] 表单输入验证和错误提示是否正常工作。
    - [ ] “记住我”功能是否影响 token 的存储策略 (localStorage vs sessionStorage)。