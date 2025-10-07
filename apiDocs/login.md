# API 接口文档

> 本项目前端依赖的后端 API 接口规范。  
> 适用于项目部署、协作开发与接口对接。  
> 🔐 所有接口示例使用 `https://api.example.com/api` 为基准地址（请替换为实际服务地址）。
## 基本信息

- **Base URL**：
  ```
  https://api.example.com/v1/api
  ```
- **协议**：`https`
- **数据传输格式**：所有接口均采用 `Content-Type: application/json`，请求和响应均为 JSON。
- **认证方式**：JWT(通过`Authorization: Bearer <token>` 传递)
- **通用错误码说明**：
  | code  | 说明                         |
  |-------|------------------------------|
  | 0     | 成功                         |
  | 1     | 参数错误、业务失败、服务器错误 |
  | 401   | 未授权/未登录                |
  | 409   | 资源冲突（如用户名已存在）    |
  | 500   | 服务器内部错误               |
- **字符编码**：UTF-8
---

## API接口列表

### 1. 用户登录
- **URL** `/login`
- **请求方式**：POST
- **描述**：用户登录，返回登录成功、用户信息、token。
- **请求参数**：
  ```json
  {
    "username": "testuser",
    "password": "123456",
    "rememberMe": true
  }
  ```
- **成功响应参数**：
  ```json
  {
    "code": 0,
    "message": "登录成功",
    "token": "xxxxxx",
    "userInfo": {
      "id": 1,
      "username": "testuser"
    }
  }
  ```
- **失败响应参数举例**：
  ```json
  {
    "code": 1,
    "message": "用户名或密码错误"
  }
  ```
  ```json
  {
    "code": 401,
    "message": "未提供token，禁止访问"
  }
  ```

### 2. 用户注册
- **URL** `/register`
- **请求方式**：POST
- **描述**：用户注册，创建新用户账号。
- **请求参数**：
  ```json
  {
    "username": "newuser",
    "password": "123456",
    "confirmPwd": "123456"
  }
  ```
- **成功响应参数**：
  ```json
  {
    "code": 0,
    "message": "注册成功",
    "userId": 2
  }
  ```
- **失败响应参数举例**：
  ```json
  {
    "code": 1,
    "message": "用户名已存在"
  }
  ```
  ```json
  {
    "code": 1,
    "message": "两次输入的密码不一致"
  }
  ```

### 3. AI 对话消息接口
- **URL** `/chat`
- **请求方式**：POST
- **描述**：与AI进行对话，支持流式输出。
- **请求头**：
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **请求参数**：
  ```json
  {
    "message": "你好，AI！",
    "session_id": "fe4ce8b093bf46159ea9927a7b22f0d3" 
  }
  ```
  - `session_id` 可选，首轮对话无需传，后续多轮对话请传递上一次响应中的 session_id。
- **响应方式**：
  - 流式输出（`text/event-stream`），每个数据块为 AI 回复的增量内容，前端需按流式处理。
  - **每条流数据格式**：
    ```json
    { "code": 0, "reply": "AI回复内容" }
    ```
  - **首次流数据中**，如果本轮对话有 session_id，会额外输出一条：
    ```json
    { "code": 0, "session_id": "fe4ce8b093bf46159ea9927a7b22f0d3" }
    ```
  - **注意**：每条流数据不包含 `message` 字段，`session_id` 只在首次流数据时单独输出一次，后续不会再输出 session_id。

- **失败响应参数举例**（流式或普通 JSON）：
  ```json
  { "code": 1, "message": "消息内容不能为空" }
  ```
  ```json
  { "code": 1, "message": "AI服务调用失败" }
  ```
  - `session_id` 字段为本轮对话的会话ID，请在首次对话后保存并在下次请求时带上。

### 4. 用户登出

- **URL** `/auth/logout`
- **请求方式**：POST
- **描述**：用户登出，使当前会话失效并清除本地认证信息。
- **请求参数**：无（通过 Cookie 自动携带会话信息）
- **成功响应参数**：
  ```json
  {
    "code": 0,
    "message": "登出成功"
  }
  ```
- **失败响应参数举例**：
  ```json
  {
    "code": 1,
    "message": "登出失败，请稍后再试"
  }
  ```

### 5.刷新 Access Token

- **URL** `/auth/refresh`
- **请求方式**：POST
- **描述**：主动刷新用户的 Access Token，以延长会话有效期。依赖于HTTP Only Cookie中存储的 Refresh Token。
- **请求参数**：无（通过 Cookie 自动携带 Refresh Token）
- **成功响应参数**：
    ```json
    {
      "code": 0,
      "message": "Token刷新成功",
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiaWF0IjoxNj..."
      }
    }
    ```
- **失败响应参数举例**：
    *   **`401 Unauthorized`** - 未提供 Refresh Token (Cookie 中缺失)。
        ```json
        {
          "code": 401,
          "message": "Refresh Token不能为空"
        }
        ```
    *   **`403 Forbidden`** - Refresh Token 无效、已过期或已被吊销。**前端收到此错误时，必须清除本地所有 Token 和用户信息，并强制用户跳转到登录页。**
        ```json
        { 
          "code": 403,
          "message": "Refresh Token无效或已过期"
        }
        ```

### 6. 导出教案为 DOCX
- **URL** `/htmlToDocx`
- **请求方式**：POST
- **描述**：将指定教案内容导出为 DOCX 格式文件。
- **请求头**：
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **请求参数**：
  ```json
  {
    "htmlId": "document_html_id",
    "title": "教案标题",
    "content": "教案的HTML内容"
  }
  ```
  - `htmlId`: 可选，如果后端需要根据ID查找HTML内容。
  - `title`: 导出的文件名。
  - `content`: 待导出的HTML字符串。
- **成功响应参数**：
  - 文件下载流（`application/vnd.openxmlformats-officedocument.wordprocessingml.document`），前端直接触发下载。
- **失败响应参数举例**：
  ```json
  {
    "code": 1,
    "message": "导出失败，请检查参数或稍后再试"
  }
  ```

### 7. 教案相关

#### 7.1. 新建教案
- **URL** `/documents`
- **请求方式**：POST
- **描述**：新建一篇教案文档。
- **请求头**：
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **请求参数**：
  ```json
  {
    "title": "AI生成的新教案标题",
    "content": "<h1>这是教案的初始HTML内容</h1>"
  }
  ```
- **成功响应参数**：
  ```json
  {
    "code": 0,
    "message": "创建成功",
    "data": {
      "id": 123,
      "title": "AI生成的新教案标题",
      "content": "<h1>这是教案的初始HTML内容</h1>",
      "user_id": 42,
      "created_at": "2025-08-16T12:00:00Z",
      "updated_at": "2025-08-16T12:00:00Z"
    }
  }
  ```
- **失败响应参数举例**：
  ```json
  {
    "code": 400,
    "message": "缺少或非法的title"
  }
  ```
  ```json
  {
    "code": 401,
    "message": "未认证/Token无效"
  }
  ```

---


#### 7.2. 获取单篇教案详情
- **URL** `/documents/{documentId}`
- **请求方式**：GET
- **描述**：根据教案ID获取单篇教案的详细信息（仅本人可见）。
- **请求头**：
  ```
  Authorization: Bearer <token>
  ```
- **请求参数**：无（`documentId` 在 URL 路径中）
- **成功响应参数**：
  ```json
  {
    "code": 0,
    "message": "获取成功",
    "data": {
      "id": 123,
      "title": "我的教案标题",
      "content": "<h1>已保存的HTML内容</h1>",
      "user_id": 42,
      "created_at": "2025-08-16T12:00:00Z",
      "updated_at": "2025-08-16T12:05:00Z"
    }
  }
  ```
- **失败响应参数举例**：
  ```json
  {
    "code": 401,
    "message": "未认证"
  }
  ```
  ```json
  {
    "code": 404,
    "message": "教案不存在或无权访问"
  }
  ```

---

#### 7.3. 更新教案
- **URL** `/documents/{documentId}`
- **请求方式**：PUT
- **描述**：根据教案ID更新教案的标题或内容。
- **请求头**：
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **请求参数**：
  ```json
  {
    "title": "新的教案标题",
    "content": "新的教案内容"
  }
  ```
  *推断：`title` 和 `content` 字段均可选，可部分更新。*
- **成功响应参数**：
  ```json
  {
    "code": 0,
    "message": "更新成功"
  }
  ```
- **失败响应参数举例**：
  ```json
  {
    "code": 400,
    "message": "未提供可更新字段"
  }
  ```
  ```json
  {
    "code": 401,
    "message": "未认证"
  }
  ```
  ```json
  {
    "code": 403,
    "message": "存在但非本人文档"
  }
  ```
  ```json
  {
    "code": 404,
    "message": "文档不存在"
  }
  ```

---

#### 7.4. 获取教案分页列表
- **URL** `/documents`
- **请求方式**：GET
- **描述**：获取当前用户的所有教案列表，支持分页。
- **请求头**：
  ```
  Authorization: Bearer <token>
  ```
- **请求参数**：
  - `page`: 页码 (可选，默认1)
  - `limit`: 每页数量 (可选，默认10)
  ```
  /documents?page=1&limit=10
  ```
- **成功响应参数**：
  ```json
  {
    "code": 0,
    "message": "获取成功",
    "data": {
      "list": [
        {
          "id": 123,
          "title": "教案A",
          "updated_at": "2025-08-16T12:05:00Z"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 10,
        "totalItems": 198
      }
    }
  }
  ```
- **失败响应参数举例**：
  ```json
  {
    "code": 401,
    "message": "未认证"
  }
  ```

---
#### 7.5. 删除教案
- **URL** `/documents/{documentId}`
- **请求方式**：DELETE
- **描述**：根据教案ID删除教案。
- **请求头**：
  ```
  Authorization: Bearer <token>
  ```
- **请求参数**：无（`documentId` 在 URL 路径中）
- **成功响应参数**：
  ```json
  {
    "code": 0,
    "message": "删除成功"
  }
  ```
- **失败响应参数举例**：
  ```json
  {
    "code": 401,
    "message": "未认证"
  }
  ```
  ```json
  {
    "code": 403,
    "message": "存在但非本人文档"
  }
  ```
  ```json
  {
    "code": 404,
    "message": "文档不存在"
  }
  ```

---