/**
 * 聊天历史管理工具
 * 提供会话列表的状态管理和操作功能
 */

import { defineStore } from 'pinia';
import chatStorageAPI from '@/utils/chatStorageService.js';

/**
 * Pinia Store - 聊天历史状态管理
 */
export const useChatHistoryStore = defineStore('chatHistory', {
  state: () => ({
    // 会话列表
    chatList: [],
    // 刷新时间戳
    refreshTimestamp: 0,
    // 加载状态
    isLoading: false,
    // 当前选中的会话ID（用户从会话列表中手动选择的）
    selectedSessionId: '',
    // 当前活跃的会话ID（正在进行的会话，可能是选中的或新创建的）
    currentSessionId: ''
  }),
  
  getters: {
    // 获取会话列表
    getChatList: (state) => state.chatList,
    
    // 获取刷新时间戳
    getRefreshTimestamp: (state) => state.refreshTimestamp,
    
    // 获取加载状态
    getIsLoading: (state) => state.isLoading,
    
    // 获取当前选中的会话ID（用户从会话列表中手动选择的）
    getSelectedSessionId: (state) => state.selectedSessionId,
    
    // 获取当前活跃的会话ID（正在进行的会话）
    getCurrentSessionId: (state) => state.currentSessionId,
    
    // 检查是否有会话
    hasChats: (state) => state.chatList.length > 0
  },
  
  actions: {
    // 设置会话列表
    setChatList(chatList) {
      this.chatList = chatList;
    },
    
    // 设置刷新时间戳
    setRefreshTimestamp(timestamp) {
      this.refreshTimestamp = timestamp;
    },
    
    // 设置加载状态
    setIsLoading(isLoading) {
      this.isLoading = isLoading;
    },
    
    // 设置当前选中的会话ID
    setSelectedSessionId(sessionId) {
      this.selectedSessionId = sessionId;
    },
    
    // 设置当前活跃的会话ID
    setCurrentSessionId(sessionId) {
      this.currentSessionId = sessionId;
    },
    
    // 刷新会话列表
    async refreshChatList() {
      this.setIsLoading(true);
      try {
        // 获取当前用户ID
        const userId = chatStorageAPI._getUserIdFromToken();
        if (!userId) {
          console.warn('用户未登录，无法加载会话列表');
          this.setChatList([]);
          return;
        }
        
        const chatList = await chatStorageAPI.loadAllChats(userId);
        this.setChatList(chatList);
        this.setRefreshTimestamp(Date.now());
      } catch (error) {
        console.error('刷新会话列表失败:', error);
      } finally {
        this.setIsLoading(false);
      }
    },
    
    // 选择会话
    selectChat(sessionId) {
      this.setSelectedSessionId(sessionId);
      this.setCurrentSessionId(sessionId);
    },
    
    // 清空选中的会话
    clearSelectedChat() {
      this.selectedSessionId = '';
    },
    
    // 清空当前活跃的会话
    clearCurrentSession() {
      this.currentSessionId = '';
    },
    
    // 初始化会话列表
    async initializeChatList() {
      await this.refreshChatList();
    },
    
    // 触发刷新（供外部调用）
    async triggerRefresh() {
      await this.refreshChatList();
    }
  }
});
