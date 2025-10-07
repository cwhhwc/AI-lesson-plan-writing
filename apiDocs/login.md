# API 接口文档

> 本项目前端依赖的后端 API 接口规范。  
> 适用于项目部署、协作开发与接口对接。  
> 🔐 所有接口示例使用 `https://api.example.com/v1` 为基准地址（请替换为实际服务地址）。
## 基本信息

- **Base URL**：
  ```
  https://api.example.com/v1
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
- **URL** `/api/login`
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
- **POST** `/api/register`
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
- **POST** `/api/chat`
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