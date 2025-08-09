import { request } from '@/utils/request.js';
import { API_CONFIG } from '@/config.js';

// src/api.js
export function loginApi({ username, password, rememberMe }) {
  return request({
    url: API_CONFIG.ENDPOINTS.LOGIN,
    data: { username, password, rememberMe },
    requireAuth: false
  });
}

export function registerApi({ username, password, confirmPwd }) {
  return request({
    url: API_CONFIG.ENDPOINTS.REGISTER,
    data: { username, password, confirmPwd },
    requireAuth: false
  });
}

export function chatApi({ message, session_id, onMessage }) {
  const payload = { message };
  if (session_id) payload.session_id = session_id;

  return request({
    url: API_CONFIG.ENDPOINTS.CHAT,
    data: payload,
    onMessage
  });
} 