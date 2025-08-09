import { getToken } from '@/utils/token.js';
import { API_CONFIG, getApiUrl } from '@/config.js';

/**
 * 统一的请求处理函数
 * @param {Object} options - 请求选项
 * @param {string} options.url - API端点
 * @param {string} options.method - 请求方法，默认为 'POST'
 * @param {Object} options.data - 请求数据
 * @param {boolean} options.requireAuth - 是否需要认证，默认为 true
 * @param {Function} options.onMessage - 流式响应的回调函数
 * @returns {Promise} 请求结果
 */
export function request(options) {
  const { url, method = 'POST', data, requireAuth = true, onMessage } = options;
  
  // 构建请求头
  const headers = { ...API_CONFIG.HEADERS };
  
  // 如果需要认证，添加token
  if (requireAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  // 获取完整的API URL
  const fullUrl = getApiUrl(url);
  
  // 检查是否为H5环境
  if (typeof window !== 'undefined' && window.fetch) {
    return handleH5Request(fullUrl, method, headers, data, onMessage);
  } else {
    return handleUniRequest(fullUrl, method, headers, data, onMessage);
  }
}

/**
 * 处理H5环境的请求
 */
function handleH5Request(url, method, headers, data, onMessage) {
  return fetch(url, {
    method,
    headers,
    body: JSON.stringify(data)
  }).then(async res => {
    // 先解析响应数据
    const responseData = await res.json();
    
    // 检查401错误
    if (res.status === 401) {
      if (responseData.message && (
        responseData.message === API_CONFIG.ERROR_MESSAGES.TOKEN_INVALID ||
        responseData.message === API_CONFIG.ERROR_MESSAGES.TOKEN_MISSING
      )) {
        throw new Error('TOKEN_INVALID');
      }
    }
    
    // 如果是流式响应且有回调函数
    if (onMessage && res.body) {
      return handleStreamReceive({ response: res, onMessage });
    }
    
    // 对于非200状态码，直接返回响应数据（包含错误信息）
    // 不抛出异常，让业务层处理
    return responseData;
  });
}

/**
 * 处理uni-app环境的请求
 */
function handleUniRequest(url, method, headers, data, onMessage) {
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method,
      header: headers,
      data,
      success(res) {
        // 检查401错误
        if (res.statusCode === 401) {
          const errorData = res.data;
          if (errorData && errorData.message && (
            errorData.message === API_CONFIG.ERROR_MESSAGES.TOKEN_INVALID ||
            errorData.message === API_CONFIG.ERROR_MESSAGES.TOKEN_MISSING
          )) {
            reject(new Error('TOKEN_INVALID'));
            return;
          }
        }
        
        if (onMessage) {
          onMessage(JSON.stringify(res.data));
        }
        
        // 无论状态码是什么，都返回响应数据
        // 让业务层根据返回的code字段判断成功失败
        resolve(res.data);
      },
      fail(err) {
        // 只有真正的网络错误才reject
        reject(err);
      }
    });
  });
}

/**
 * 流式接收数据的通用处理函数
 */
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
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}
