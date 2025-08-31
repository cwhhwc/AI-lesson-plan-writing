## **认证接口 (Authentication API)**

### **1. 刷新 Access Token**

当客户端的 `accessToken` 过期时，调用此接口以获取一个新的 `accessToken`。

*   **URL** : `/api/auth/refresh`
*   **Method** : `POST`
*   **Headers** :
    *   `Content-Type: application/json`
    *   **注意**：`refreshToken` 通过 `HttpOnly` Cookie 自动发送，无需在请求头或请求体中手动添加。

*   **Request Body** :
    *   无。`refreshToken` 通过 `HttpOnly` Cookie 自动发送。

*   **Success Response (200 OK)**:
    ```json
    {
      "code": 0,
      "message": "Token刷新成功",
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiaWF0IjoxNj..."
      }
    }
    ```

*   **Error Responses** :

    *   **`401 Unauthorized`** - 未提供 Refresh Token (Cookie 中缺失)。
        ```json
        {
          "code": 1,
          "message": "Refresh Token不能为空"
        }
        ```
    *   **`403 Forbidden`** - Refresh Token 无效、已过期或已被吊销。**前端收到此错误时，必须清除本地所有 Token 和用户信息，并强制用户跳转到登录页。**
        ```json
        { 
          "code": 1,
          "message": "Refresh Token无效或已过期"
        }
        ```

---

### **2. 用户登出**

客户端主动登出时调用此接口，它会使当前会话的 `refreshToken` 在服务器端失效。

*   **URL** : `/api/auth/logout`
*   **Method** : `POST`
*   **Headers** :
    *   `Content-Type: application/json`
    *   **注意**：`refreshToken` 通过 `HttpOnly` Cookie 自动发送，无需在请求头或请求体中手动添加。

*   **Request Body** :
    *   无。`refreshToken` 通过 `HttpOnly` Cookie 自动发送。

*   **Success Response (200 OK)**:
    ```json
    {
      "code": 0,
      "message": "登出成功"
    }
    ```
*   **Error Responses** :
    *   **`400 Bad Request`** - 未提供 Refresh Token (Cookie 中缺失)。
        ```json
        {
          "code": 1,
          "message": "Refresh Token不能为空"
        }
        ```