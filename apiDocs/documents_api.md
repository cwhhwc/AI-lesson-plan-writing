### 教案文档 API 文档（Documents API）

## 1. 概述

- 根路径: 所有接口均以 `/api` 为前缀。
- 数据格式: `application/json`。
- 认证方式: 需在请求头携带 `Authorization: Bearer <YOUR_JWT_TOKEN>`。

## 2. 统一错误返回

除特别说明外，错误返回均包含以下结构：

```json
{
  "code": 400,
  "message": "错误描述",
  "detail": "可选的错误细节"
}
```

## 3. 数据模型（简要）

文档对象字段：
- `id`: number
- `title`: string
- `content`: string | null（HTML 字符串）
- `user_id`: number
- `created_at`: string (ISO8601)
- `updated_at`: string (ISO8601)

---

## 4. 接口定义

### 4.1 新建教案

- Endpoint: `POST /api/documents`
- 描述: 创建一篇新的教案文档。
- 请求体：

```json
{
  "title": "AI生成的新教案标题",
  "content": "<h1>这是教案的初始HTML内容</h1>"
}
```

- 成功响应：`201 Created`

```json
{
  "id": 123,
  "title": "AI生成的新教案标题",
  "content": "<h1>这是教案的初始HTML内容</h1>",
  "user_id": 42,
  "created_at": "2025-08-16T12:00:00Z",
  "updated_at": "2025-08-16T12:00:00Z"
}
```

- 可能错误：
  - `400 Bad Request`: 缺少或非法的 `title`
  - `401 Unauthorized`: 未认证/Token 无效

- 示例（cURL）

```bash
curl -X POST "http://localhost:3000/api/documents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{"title":"AI生成的新教案标题","content":"<h1>这是教案的初始HTML内容</h1>"}'
```

---

### 4.2 获取单篇教案详情

- Endpoint: `GET /api/documents/:id`
- 描述: 根据唯一 ID 获取一篇教案的详细信息（仅本人可见）。
- 成功响应：`200 OK`

```json
{
  "id": 123,
  "title": "我的教案标题",
  "content": "<h1>已保存的HTML内容</h1>",
  "user_id": 42,
  "created_at": "2025-08-16T12:00:00Z",
  "updated_at": "2025-08-16T12:05:00Z"
}
```

- 可能错误：
  - `401 Unauthorized`: 未认证
  - `404 Not Found`: 不存在或无权访问（隐藏存在性）

---

### 4.3 更新教案

- Endpoint: `PUT /api/documents/:id`
- 描述: 更新一篇已存在的教案（仅本人）。请求体需包含 `title` 或 `content` 至少一个字段。
- 请求体：

```json
{
  "title": "修改后的标题",
  "content": "<h1>修改后的HTML内容</h1>"
}
```

- 成功响应：`200 OK`

```json
{
  "success": true,
  "message": "教案更新成功"
}
```

- 可能错误：
  - `400 Bad Request`: 未提供可更新字段
  - `401 Unauthorized`: 未认证
  - `403 Forbidden`: 存在但非本人文档
  - `404 Not Found`: 文档不存在

---

### 4.4 获取当前用户的全量教案列表（分页）

- Endpoint: `GET /api/documents`
- 描述: 获取当前登录用户的所有教案，支持分页。
- Query 参数：
  - `page`（可选，默认 1）
  - `limit`（可选，默认 20）

- 成功响应：`200 OK`

```json
{
  "data": [
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
```

- 可能错误：
  - `401 Unauthorized`: 未认证

- 示例（cURL）

```bash
curl -X GET "http://localhost:3000/api/documents?page=1&limit=20" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

### 4.5 删除教案

- Endpoint: `DELETE /api/documents/:id`
- 描述: 删除一篇指定的教案（仅本人）。
- 成功响应：`204 No Content`
- 可能错误：
  - `401 Unauthorized`: 未认证
  - `403 Forbidden`: 存在但非本人文档
  - `404 Not Found`: 文档不存在

- 示例（cURL）

```bash
curl -X DELETE "http://localhost:3000/api/documents/123" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" -i
```

---

## 5. 备注

- 所有接口均已受 JWT 鉴权保护（`/api` 前缀下除登录/注册外）。
- 4.2 为避免暴露资源存在性，未授权访问与不存在统一返回 `404 Not Found`；4.3/4.5 出于交互提示需要，仍区分 `403` 与 `404`。