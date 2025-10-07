import { defineStore } from 'pinia';
// 1. 引入真正的API调用函数
import { loginApi, logoutApi } from '@/api.js'; 
import { triggerProactiveTokenRefresh } from '@/api.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    user: null, // 用于存储用户信息，例如 { id, email }
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    // 可以增加一个getter方便获取请求头
    authHeader: (state) => ({
      Authorization: `Bearer ${state.accessToken}`,
    }),
  },

  actions: {
    /**
     * 登录 Action
     * @param {object} credentials - { email, password }
     * @returns {Promise<void>}
     */
    async login(credentials) {
      try {
        // 2. 调用 loginApi
        const responseData = await loginApi(credentials);
        
        if (responseData && responseData.accessToken) {
          // 3. 从后端响应中获取 accessToken 和 userInfo
          const { accessToken, userInfo } = responseData;
          
          // 4. 将凭证和用户信息存入 state
          this.accessToken = accessToken;
          this.user = userInfo;
          
          // 登录成功，Promise 会被 resolve
          return Promise.resolve();
        } else {
          // 如果业务码不为0，或数据结构不正确，则抛出错误
          throw new Error(responseData.message || '登录失败，请检查邮箱和密码');
        }
      } catch (error) {
        // 5. 如果API调用失败，清空状态并向上抛出错误
        console.error("Login failed:", error);
        // 将错误信息传递给UI层
        return Promise.reject(error);
      }
    },

    /**
     * 登出 Action
     */
    async logout() {
      try {
        // 6. 调用后端的 /logout 接口，让后端的 refresh token 失效
        await logoutApi();
      } catch (error) {
        console.error("Logout API call failed, but clearing local state anyway.", error);
      } finally {
        // 7. 无论后端调用成功与否，都清空前端的登录状态
        this.accessToken = null;
        this.user = null;
        // 注意：页面跳转逻辑已从此移除，应由UI组件负责
      }
    },

    /**
     * 由请求拦截器在刷新token后调用
     * @param {object} data - 包含accessToken和userInfo
     */
    setAccessToken(data) {
      if(data && data.accessToken) {
        this.accessToken = data.accessToken;
        if(data.userInfo) {
          this.user = data.userInfo;
        }
      }
    },

    /**
     * 应用启动时主动刷新 Access Token
     * @returns {Promise<bool>} - 刷新成功返回 true，失败返回 false
     */
    async proactiveRefresh() {
      try {
        // 接收返回的用户信息，并更新accessToken
        const responseData = await triggerProactiveTokenRefresh();
        this.setAccessToken(responseData);
        return true;
      } catch (error) {
        console.error("Proactive token refresh failed:", error);
        this.accessToken = null;
        this.user = null;
        return false;
      }
      }
  },
});
