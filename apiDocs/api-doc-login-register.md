# 登录与注册接口文档

## 1. 用户登录接口

- **接口地址**：`POST /api/login`
- **请求参数**：
  | 参数名     | 类型   | 必填 | 说明     |
  | ---------- | ------ | ---- | -------- |
  | username   | string | 是   | 用户账号 |
  | password   | string | 是   | 用户密码（明文或加密，需前后端约定） |
  | rememberMe | bool   | 否   | 是否记住我 |

- **请求示例**：
  ```json
  {
    "username": "testuser",
    "password": "123456",
    "rememberMe": true
  }
  ```

- **响应参数**：
  | 参数名   | 类型   | 说明         |
  | -------- | ------ | ------------ |
  | code     | int    | 状态码，0为成功 |
  | message  | string | 提示信息     |
  | token    | string | 登录成功返回的token（可选） |
  | userInfo | object | 用户信息（可选） |

- **响应示例**：
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

---

## 2. 用户注册接口

- **接口地址**：`POST /api/register`
- **请求参数**：
  | 参数名     | 类型   | 必填 | 说明     |
  | ---------- | ------ | ---- | -------- |
  | username   | string | 是   | 用户账号 |
  | password   | string | 是   | 用户密码 |
  | confirmPwd | string | 是   | 确认密码 |

- **请求示例**：
  ```json
  {
    "username": "newuser",
    "password": "123456",
    "confirmPwd": "123456"
  }
  ```

- **响应参数**：
  | 参数名   | 类型   | 说明         |
  | -------- | ------ | ------------ |
  | code     | int    | 状态码，0为成功 |
  | message  | string | 提示信息     |
  | userId   | int    | 注册成功返回的用户ID（可选） |

- **响应示例**：
  ```json
  {
    "code": 0,
    "message": "注册成功",
    "userId": 2
  }
  ```

---

## 3. AI 对话消息接口

- **接口地址**：`POST /api/chat`
- **请求参数**：
  | 参数名   | 类型   | 必填 | 说明         |
  | -------- | ------ | ---- | ------------ |
  | message  | string | 是   | 用户输入的消息内容 |

- **请求示例**：
  ```json
  {
    "message": "你好，AI！"
  }
  ```

- **响应参数**：
  | 参数名   | 类型   | 说明         |
  | -------- | ------ | ------------ |
  | code     | int    | 状态码，0为成功 |
  | message  | string | 提示信息     |
  | reply    | string | AI返回的回复内容 |

- **响应示例**：
  ```json
  {
    "code": 0,
    "message": "success",
    "reply": "你好，有什么可以帮您？"
  }
  ```

---

如需补充其他接口，请单独说明。 