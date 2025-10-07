import { useAuthStore } from '@/stores/auth';
import { API_CONFIG, getApiUrl } from '@/config.js';

// --- 刷新 Token 状态管理 ---
let isRefreshing = false; // 是否正在刷新token
let requestQueue = []; // 因token失效而挂起的请求队列

/**
 * 处理请求队列
 * @param {Error|null} error - 刷新token时发生的错误
 */
const processQueue = (error) => {
  requestQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  requestQueue = [];
};

/**
 * 尝试刷新 Token 的核心函数
 * @returns {Promise<void>}
 */
const tryRefreshToken = async () => {
  try {
    const refreshUrl = getApiUrl(API_CONFIG.ENDPOINTS.REFRESH); // 从 config.js 获取刷新URL
    
    const res = await fetch(refreshUrl, {
      method: 'POST',
      credentials: 'include', // 确保携带cookie
    });

    const data = await res.json(); // 解析 JSON 响应

    if (!res.ok || !data.accessToken) { // 检查 res.ok for HTTP errors
      throw new Error(data.message || 'Failed to refresh token');
    }
    return data;
  } catch (error) {
    const authStore = useAuthStore();
    authStore.logout(); // 刷新失败，清空状态

    // 定义一个公共页面路径的白名单
    const publicPages = [
      'pages/login/login',
      'pages/register/register',
      'pages/forgot-password/ForgotPassword',
      'pages/reset-password/ResetPassword'
    ];

    const pages = getCurrentPages();
    // 检查当前页面是否在白名单中
    const currentPageIsPublic = pages.length > 0 && publicPages.includes(pages[pages.length - 1].route);

    // 如果当前页面不在公共页面白名单内，才跳转到登录页
    if (!currentPageIsPublic) {
      uni.reLaunch({
        url: '/pages/login/login'
      });
    }
    
    // 只在控制台打印深层错误，不再向上抛出，避免干扰UI
    console.error("Token refresh failed:", error);
    // 注意：这里不再 return Promise.reject(error)，切断了错误冒泡
    // 返回一个被拒绝的Promise，但没有值，这样队列中的请求会失败，但不会有未捕获的错误弹窗
    return Promise.reject();
  }
};

/**
 * 流式接收数据的通用处理函数 (从原 request.js 复制)
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
      resolve({ streamingComplete: true });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * 处理H5环境的请求 (fetch API) - 移除 401 处理
 */
async function handleH5Request(fullUrl, method, headers, data, onMessage, isDownload, credentials = 'omit') {
  const res = await fetch(fullUrl, {
    method,
    headers,
    credentials,
    body: data ? JSON.stringify(data) : null,
  });

  // 401 错误由外部拦截器处理，这里只处理其他状态码
  if (res.status === 401) {
    // 抛出错误，让外部拦截器捕获
    const errorData = await res.json();
    throw { statusCode: 401, data: errorData, message: errorData.message || 'Unauthorized' };
  }

  // 通用错误处理
  if (!res.ok) {
    let errorPayload = null;
    try{
      errorPayload = await res.json();
    }catch(e){
      errorPayload = { message: res.statusText || 'Request failed' };
    }

    throw { statusCode: res.status, data: errorPayload, message: errorPayload.message || 'Request failed' };
  }
  if (res.status === 204){
    return {success: true, staths: 204};
  }
  // 如果是下载请求
  if (isDownload) {
    return res.blob().then(blob => ({
      data: blob,
      headers: res.headers// 返回headers以便获取文件名
    }));
  }
  
  // 如果是流式响应且有回调
  if (onMessage && res.body) {
    return handleStreamReceive({ response: res, onMessage });
  }
  
  return res.json();
}

/**
 * 处理uni-app环境的请求 (uni.request) - 移除 401 处理
 *
async function handleUniRequest(fullUrl, method, headers, data, onMessage, isDownload) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      url: fullUrl,
      method,
      header: headers,
      data,
      success(res) {
        // 401 错误由外部拦截器处理，这里只处理其他状态码
        if (res.statusCode === 401) {
          reject({ statusCode: 401, data: res.data, message: res.data.message || 'Unauthorized' });
          return;
        }
        
        if (isDownload) {
          resolve({
            data: res.data,
            headers: res.header
          });
        } else if (onMessage) {
          onMessage(JSON.stringify(res.data));
          resolve(res.data);
        } else {
          resolve(res.data);
        }
      },
      fail(err) {
        reject(err);
      }
    };

    // 处理下载请求
    if (isDownload) {
      requestOptions.responseType = 'arraybuffer';
    }

    uni.request(requestOptions);
  });
}*/


/**
 * 核心请求执行器，包含 Token 刷新逻辑
 * @param {Object} options - 请求选项
 * @returns {Promise<any>}
 */
async function authenticatedRequest(options, isRetry = false) {
  const authStore = useAuthStore();
  const { url, method = 'POST', data, onMessage, isDownload, authType = 'token' } = options;

  // 根据认证状态和类型设置请求头
  const headers = { ...API_CONFIG.HEADERS };
  if (authType === 'token' && authStore.isAuthenticated && authStore.accessToken) {
    headers['Authorization'] = `Bearer ${authStore.accessToken}`;
  }

  // 根据认证类型设置 credentials
  const credentials = authType === 'cookie' ? 'include' : 'omit';
  
  const fullUrl = getApiUrl(url);

  try {
    // 尝试发送请求
    let response;
    if (typeof window !== 'undefined' && window.fetch) {
      response = await handleH5Request(fullUrl, method, headers, data, onMessage, isDownload, credentials);
    }
    /* 
    else {
      response = await handleUniRequest(fullUrl, method, headers, data, onMessage, isDownload);
    }*/
    return response;

  } catch (error) {
    // 捕获 401 错误
    if (error.statusCode === 401) {
      // 如果是重试请求仍然 401，则直接登出，避免死循环
      if (isRetry) {
        const authStore = useAuthStore();
        authStore.logout();
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        tryRefreshToken()
          .then(() => {
            processQueue(null);
          })
          .catch(err => {
            processQueue(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      // 将当前请求加入队列，等待 token 刷新
      return new Promise((resolve, reject) => {
        requestQueue.push({
          resolve: () => {
            // Token 刷新成功后，重新发送原始请求，并标记为重试
            resolve(authenticatedRequest(options, true));
          },
          reject: (err) => {
            reject(err);
          },
        });
      });
    }
    
    // 抛出其他非 401 错误
    return Promise.reject(error);
  }
}


/**
 * 导出的、供业务使用的请求函数
 * @param {Object} options - 业务请求选项
 * @param {string} options.url - API端点 (如 /chat)
 * @param {string} [options.method='POST'] - 请求方法
 * @param {Object} [options.data] - 请求数据
 * @param {boolean} [options.requireAuth=true] - 是否需要认证
 * @param {Function} [options.onMessage] - 流式响应的回调函数
 * @param {boolean} [options.isDownload] - 是否为文件下载请求
 * @returns {Promise<Object>} - 返回接口的 data 部分
 */
export async function request(options) {
  // 现在可以根据authType决定是否携带token或cookie
  const response = await authenticatedRequest(options);
  
  // 这里可以添加更多响应处理逻辑，例如根据 code 抛出业务异常
  // if (response.data && response.data.code !== 0) {
  //   throw new Error(response.data.message || 'Business Error');
  // }
  console.log('请求响应:（request）', response);
  return response.data || response; // 返回数据部分，或整个响应（如下载）
}

//单独导出刷新token函数，供外部调用
export { tryRefreshToken };