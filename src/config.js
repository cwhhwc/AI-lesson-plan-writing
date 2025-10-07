// src/config.js
export const API_CONFIG = {
  // API 基地址
  BASE_URL: 'https://rgcwdfzvbeib.sealosbja.site/api',
  
  // API 端点
  ENDPOINTS: {
    LOGIN: '/login',
    REGISTER: '/register',
    CHAT: '/chat',
    DOCUMENTS: '/documents', // 重构为通用名称
    EXPORT_DOCX: '/htmlToDocx', // 新增：导出为DOCX
    REFRESH: '/auth/refresh', // 新增：刷新 Access Token
    LOGOUT: '/auth/logout',   // 新增：用户登出
    SEND_VERIFICATION_CODE: '/verification/sendVerificationCode', // 新增：发送验证码（后端生成并存储，不发送邮件）
    VERIFY_VERIFICATION_CODE: '/verification/verifyVerificationCode', // 新增：验证验证码
    RESET_PASSWORD: '/resetPassword'//重置密码
  },
  
  // 请求头配置
  HEADERS: {
    'Content-Type': 'application/json'
  },
  
  // 错误消息
  ERROR_MESSAGES: {
    TOKEN_INVALID: 'token无效或已过期',
    TOKEN_MISSING: '未提供token，禁止访问'
  }
};

// 获取完整的API URL
export function getApiUrl(endpoint) {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}