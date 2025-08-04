import { getToken } from '@/utils/token.js';

// src/api.js
function requestApi({ url, method = 'POST', data }) {
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method,
      header: { 'Content-Type': 'application/json' },
      data,
      success(res) {
        resolve(res.data);
      },
      fail(err) {
        reject(err);
      }
    });
  });
}
export function loginApi({ username, password, rememberMe }) {
  return requestApi({
    url: 'https://rgcwdfzvbeib.sealosbja.site/api/login',
    data: { username, password, rememberMe }
  });
}

export function registerApi({ username, password, confirmPwd }) {
  return requestApi({
    url: 'https://rgcwdfzvbeib.sealosbja.site/api/register',
    data: { username, password, confirmPwd }
  });
}

// 流式接收数据的通用处理函数
function handleStreamReceive({ response, onMessage }) {
  const reader = response.body.getReader();
  let decoder = new TextDecoder('utf-8');
  let done = false;
  return new Promise(async (resolve, reject) => {
    try {
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          if (onMessage) onMessage(chunk);
        }
      }
      resolve(); // 流式结束时 resolve
    } catch (e) {
      reject(e);
    }
  });
}

export function chatApi({ message, session_id, onMessage }) {
  const token = getToken();//获取token
  const url = 'https://rgcwdfzvbeib.sealosbja.site/api/chat';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token  //认证头
  };
  const payload = { message };
  if (session_id) payload.session_id = session_id;

  if (typeof window !== 'undefined' && window.fetch) {
    // H5端流式
    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    }).then(async res => {
      if (!res.body) throw new Error('无响应体');
      return handleStreamReceive({ response: res, onMessage });
    });
  } else {
    // 非H5端（如小程序、App等）
    return new Promise((resolve, reject) => {
      uni.request({
        url,
        method: 'POST',
        header: headers,
        data: payload,
        success(res) {
          if (onMessage) onMessage(JSON.stringify(res.data));
          resolve();
        },
        fail(err) {
          reject(err);
        }
      });
    });
  }
} 