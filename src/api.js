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
    onMessage: (chunk) => {
      onMessage(chunk);
    }
  });
} 

// 4.1 新建教案
export function createDocumentApi({ title, content }) {
  return request({
    url: API_CONFIG.ENDPOINTS.DOCUMENTS,
    data: { title, content },
  });
}

// 4.2 获取单篇教案详情
export function getDocumentByIdApi(documentId) {
  return request({
    url: `${API_CONFIG.ENDPOINTS.DOCUMENTS}/${documentId}`,
    method: 'GET',
  });
}

// 4.3 更新教案
export function updateDocumentApi(documentId, updateData) {
  return request({
    url: `${API_CONFIG.ENDPOINTS.DOCUMENTS}/${documentId}`,
    method: 'PUT',
    data: updateData, // updateData 是一个包含 title 和/或 content 的对象
  });
}

// 4.4 获取当前用户的教案分页列表
export function listDocumentsApi({ page, limit }) {
  // 使用 URLSearchParams 来优雅地处理查询参数
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  const queryString = params.toString();

  // 如果有查询参数，则拼接到URL后面
  const url = queryString
    ? `${API_CONFIG.ENDPOINTS.DOCUMENTS}?${queryString}`
    : API_CONFIG.ENDPOINTS.DOCUMENTS;

  return request({
    url: url,
    method: 'GET',
  });
}

// 4.5 删除教案
export function deleteDocumentApi(documentId) {
  return request({
    url: `${API_CONFIG.ENDPOINTS.DOCUMENTS}/${documentId}`,
    method: 'DELETE',
  });
}

// 导出教案为 DOCX
export function exportDocumentApi({ htmlId, title, content }) {
  return request({
    url: API_CONFIG.ENDPOINTS.EXPORT_DOCX,
    method: 'POST',
    data: { htmlId, title, content },
    isDownload: true, // 标记为下载请求
  });
}
