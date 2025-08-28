# 导出 API 文档（Export API）

版本: 1.0  
日期: 2025-08-16

## 1. 概述

- 根路径: 所有接口均以 `/api` 为前缀。
- 数据格式: `application/json`。
- 认证方式: 需在请求头携带 `Authorization: Bearer <YOUR_JWT_TOKEN>`。
- 响应格式: 直接返回DOCX文件的二进制数据。

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

导出请求对象字段：
- `htmlId`: number - 要导出的教案ID（必填）
- `title`: string - 教案标题（可选，提供时会先保存）
- `content`: string - 教案HTML内容（可选，提供时会先保存）

---

## 4. 接口定义

### 4.1 导出教案为DOCX（Export Document）

- Endpoint: `POST /api/convert/html-to-docx`
- 描述: 导出教案为DOCX文件。若提供title或content，会先保存最新内容再导出。
- 请求体：

```json
{
  "htmlId": 123,
  "title": "最新标题（可选）",
  "content": "<h1>最新HTML内容（可选）</h1>"
}
```

- 成功响应：`200 OK`
  - Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - Content-Disposition: `attachment; filename="教案标题.docx"`
  - 直接返回DOCX文件的二进制数据

- 可能错误：
  - `400 Bad Request`: 缺少htmlId、无效的文档ID、教案没有内容
  - `401 Unauthorized`: 未认证/Token 无效
  - `404 Not Found`: 未找到对应的教案内容
  - `500 Internal Server Error`: 转换失败

- 示例（cURL）

```bash
curl -X POST "http://localhost:3000/api/convert/html-to-docx" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{"htmlId": 123, "content": "<h1>最新内容</h1>"}' \
  --output "教案.docx"
```

- 示例（JavaScript - Fetch）

```javascript
const exportDocument = async (htmlId, title, content) => {
  try {
    const response = await fetch('/api/convert/html-to-docx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ htmlId, title, content })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    // 浏览器自动下载文件
    // 文件名从响应头获取

  } catch (error) {
    console.error('导出失败:', error.message);
  }
};
```

---

## 5. 使用流程

1. 前端发送POST请求，包含教案ID和可选的最新内容
2. 后端先保存最新内容（如果提供）
3. 查询教案内容并转换为DOCX
4. 返回DOCX文件，浏览器自动下载

## 6. 注意事项

- **权限控制**: 用户只能导出自己的教案
- **自动保存**: 提供title或content时会先保存再导出
- **文件格式**: 输出为标准的.docx格式，兼容Microsoft Word
- **自动下载**: 浏览器会自动触发文件下载
- **文件名**: 使用教案标题作为下载文件名

## 7. 常见问题

**Q: 如何实现"保存并导出"？**
A: 在请求体中同时提供htmlId、title、content，后端会先保存再导出。

**Q: 只导出不保存怎么做？**
A: 请求体只包含htmlId，不传title和content。

**Q: 文件名是什么？**
A: 使用教案的title字段，如果没有则使用"教案.docx"。
