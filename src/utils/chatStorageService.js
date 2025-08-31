// src/utils/chatStorageAPI.js
// 聊天存储API - 队列化异步存储服务

import { setStorage, getStorage } from './localStorage.js';
import { 
  createChatTemplate, 
  createMessageTemplate, 
  createChatDataTemplate,
  STORAGE_KEYS
} from './chatStorage.js';
// 引入user信息store获取用户信息
import { useAuthStore } from '@/stores/auth.js';

// ==================== 队列化异步存储（确保消息不丢失）====================
class ChatStorageQueue {
  constructor() {
    this.queue = [];
    this.running = false;
  }

  async addToQueue(operation) {
    return new Promise((resolve, reject) => {
      // 将操作添加到队列
      this.queue.push({
        operation,
        resolve,
        reject
      });
      
      // 尝试执行队列
      this.processQueue();
    });
  }

  async processQueue() {
    // 防重入：如果已在执行，直接返回
    if (this.running || this.queue.length === 0) {
      return;
    }

    this.running = true;

    // 顺序执行队列中的所有操作
    while (this.queue.length > 0) {
      const { operation, resolve, reject } = this.queue.shift();
      
      try {
        console.log(`执行存储操作，剩余队列: ${this.queue.length}`);
        const result = await operation();
        resolve(result);
      } catch (error) {
        console.error('存储操作失败:', error);
        reject(error);
      }
    }

    this.running = false;
  }

  // 获取队列状态（调试用）
  getStatus() {
    return {
      running: this.running,
      queueLength: this.queue.length
    };
  }
}

// ==================== 聊天存储服务类 ====================

export class ChatStorageService {
  constructor() {
    this.queue = new ChatStorageQueue();
  }



  /**
   * 从JWT token中获取用户ID
   * @returns {string|null} 用户ID，如果获取失败返回null
   * @private
   */
  _getUserIdFromToken() {
    try {
      const authStore = useAuthStore();
      const userId = authStore.user?.id;
      
      if (!userId) {
        console.warn('authStore未找到用户ID');
        return null;
      }
      
      return String(userId);
    } catch (error) {
      console.error('从 authStore 中获取ID失败:', error);
      return null;
    }
  }

  /**
   * 参数验证工具函数
   * @param {Object} params 参数对象
   * @param {string} params.userId 用户ID
   * @param {string} params.sessionId 会话ID（可选）
   * @param {string} params.chatName 会话名称（可选）
   * @param {string} params.userMessage 用户消息（可选）
   * @param {string} params.aiMessage AI回复（可选）
   * @param {string} params.newName 新名称（可选）
   * @returns {{valid: boolean, error?: string}} 验证结果
   * @private
   */
  _validateParams(params) {
    const { userId, sessionId, chatName, userMessage, aiMessage, newName } = params;
    
    // 验证userId（必需）
    if (!userId || typeof userId !== 'string') {
      return { valid: false, error: 'userId不能为空且必须是字符串' };
    }
    
    // 验证sessionId（如果提供）
    if (sessionId !== undefined && (!sessionId || typeof sessionId !== 'string')) {
      return { valid: false, error: 'sessionId不能为空且必须是字符串' };
    }
    
    // 验证chatName（如果提供）
    if (chatName !== undefined && (!chatName || typeof chatName !== 'string')) {
      return { valid: false, error: 'chatName不能为空且必须是字符串' };
    }
    
    // 验证userMessage（如果提供）
    if (userMessage !== undefined && (!userMessage || typeof userMessage !== 'string')) {
      return { valid: false, error: 'userMessage不能为空且必须是字符串' };
    }
    
    // 验证aiMessage（如果提供）
    if (aiMessage !== undefined && (!aiMessage || typeof aiMessage !== 'string')) {
      return { valid: false, error: 'aiMessage不能为空且必须是字符串' };
    }
    
    // 验证newName（如果提供）
    if (newName !== undefined && (!newName || typeof newName !== 'string')) {
      return { valid: false, error: 'newName不能为空且必须是字符串' };
    }
    
    return { valid: true };
  }

  /**
   * 获取字典式存储数据
   * @param {string} userId 用户ID
   * @returns {Object} 字典式存储结构
   * @private
   */
  _getChatData(userId) {
    // 参数验证
    const validation = this._validateParams({ userId });
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // 生成用户特定的存储键
    const storageKey = STORAGE_KEYS.getChatDataKey(userId);
    
    let chatData = getStorage(storageKey, null);
    
    if (chatData && chatData.chats && chatData.order && chatData.meta) {
      return chatData;
    }
    
    // 创建新的空字典结构
    chatData = createChatDataTemplate();
    setStorage(storageKey, chatData);
    
    return chatData;
  }

  /**
   * 保存字典式存储数据
   * @param {Object} chatData 字典式存储结构
   * @param {string} userId 用户ID
   * @private
   */
  _saveChatData(chatData, userId) {
    // 参数验证
    const validation = this._validateParams({ userId });
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // 生成用户特定的存储键
    const storageKey = STORAGE_KEYS.getChatDataKey(userId);
      
    // 更新元数据
    chatData.meta.lastUpdated = Date.now();
    chatData.meta.totalCount = chatData.order.length;
    

    
    // 保存数据
    setStorage(storageKey, chatData);
  }

  /**
   * 创建新会话
   * @param {string} userId 用户ID
   * @param {string} sessionId 后端返回的session_id
   * @param {string} chatName 会话名称
   * @param {string} userMessage 用户消息
   * @param {string} aiMessage AI回复
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async createNewChat(userId, sessionId, chatName, userMessage, aiMessage, card = null) {
    // 参数验证
    const validation = this._validateParams({ userId, sessionId, userMessage, aiMessage });
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      const newChat = await this.queue.addToQueue(() => {
        // 1. 获取字典存储数据
        const chatData = this._getChatData(userId);
        
        // 2. 检查会话是否已存在 - O(1)查找
        if (chatData.chats[sessionId]) {
          console.warn('会话已存在，返回现有会话:', sessionId);
          return chatData.chats[sessionId];
        }
        
        // 3. 创建新会话数据结构
        const chat = createChatTemplate(sessionId, chatName || '新对话');
        
        // 4. 创建首条消息
        const firstMessage = createMessageTemplate(userMessage, aiMessage, card);
        chat.messages.push(firstMessage);
        
        // 5. 添加到字典存储 - O(1)插入
        chatData.chats[sessionId] = chat;
        chatData.order.unshift(sessionId); // 新会话放在最前面
        
        // 6. 保存更新后的数据
        this._saveChatData(chatData, userId);
        
        console.log('新会话创建成功:', sessionId);
        return chat;
      });
      
      return { success: true, data: newChat };
      
    } catch (error) {
      console.error('创建会话失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 继续现有会话（添加新消息）
   * @param {string} userId 用户ID
   * @param {string} sessionId 会话ID
   * @param {string} userMessage 用户消息
   * @param {string} aiMessage AI回复
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async continueChat(userId, sessionId, userMessage, aiMessage, card = null) {
    // 参数验证
    const validation = this._validateParams({ userId, sessionId, userMessage, aiMessage });
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      const result = await this.queue.addToQueue(() => {
        // 1. 获取字典存储数据
        const chatData = this._getChatData(userId);
        
        // 2. 直接查找目标会话 - O(1)查找
        const targetChat = chatData.chats[sessionId];
        
        if (!targetChat) {
          throw new Error(`未找到会话: ${sessionId}`);
        }
        
        // 3. 创建新消息
        const newMessage = createMessageTemplate(userMessage, aiMessage, card);
        
        // 4. 添加到会话的消息列表中
        targetChat.messages.push(newMessage);
        
        // 5. 更新会话在order中的位置（移到最前面，表示最近使用）
        const orderIndex = chatData.order.indexOf(sessionId);
        if (orderIndex > 0) {
          chatData.order.splice(orderIndex, 1);
          chatData.order.unshift(sessionId);
        }
        
        // 6. 保存更新后的数据
        this._saveChatData(chatData, userId);
        
        console.log('消息添加成功:', sessionId, '消息数:', targetChat.messages.length);
        return targetChat;
      });
      
      return { success: true, data: result };
      
    } catch (error) {
      console.error('继续对话失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 删除会话
   * @param {string} userId 用户ID
   * @param {string} sessionId 会话ID
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async deleteChat(userId, sessionId) {
    // 参数验证
    const validation = this._validateParams({ userId, sessionId });
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      const result = await this.queue.addToQueue(() => {
        // 1. 获取字典存储数据
        const chatData = this._getChatData(userId);
        
        // 2. 检查会话是否存在 - O(1)查找
        if (!chatData.chats[sessionId]) {
          throw new Error(`未找到要删除的会话: ${sessionId}`);
        }
        
        // 3. 从字典中删除 - O(1)删除
        delete chatData.chats[sessionId];
        
        // 4. 从order数组中移除
        const orderIndex = chatData.order.indexOf(sessionId);
        if (orderIndex !== -1) {
          chatData.order.splice(orderIndex, 1);
        }
        
        // 5. 保存更新后的数据
        this._saveChatData(chatData, userId);
        
        console.log('会话删除成功:', sessionId);
        
        return {
          deleted: true,
          sessionId: sessionId,
          remainingCount: chatData.order.length
        };
      });
      
      return { success: true, data: result };
      
    } catch (error) {
      console.error('删除会话失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 读取所有会话（按order顺序返回）
   * @param {string} userId 用户ID
   * @returns {Array} 会话列表
   */
  loadAllChats(userId) {
    // 参数验证
    const validation = this._validateParams({ userId });
    if (!validation.valid) {
      console.warn(validation.error);
      return [];
    }
    
    try {
      // 1. 获取字典存储数据
      const chatData = this._getChatData(userId);
      
      // 2. 按order顺序构建会话列表
      const allChats = chatData.order
        .map(sessionId => chatData.chats[sessionId])
        .filter(chat => chat !== undefined);
      
      return allChats;
    } catch (error) {
      console.error('加载会话列表失败:', error);
      return [];
    }
  }

  /**
   * 根据ID读取特定会话
   * @param {string} userId 用户ID
   * @param {string} sessionId 会话ID
   * @returns {Object|null} 会话对象，未找到返回null
   */
  loadChatById(userId, sessionId) {
    // 参数验证
    const validation = this._validateParams({ userId, sessionId });
    if (!validation.valid) {
      console.warn(validation.error);
      return null;
    }

    try {
      // 1. 获取字典存储数据
      const chatData = this._getChatData(userId);
      
      // 2. 直接从字典查找 - O(1)查找
      const targetChat = chatData.chats[sessionId];
      
      if (targetChat) {
        console.log(`找到会话: ${targetChat.name}, 消息数: ${targetChat.messages.length}`);
        return targetChat;
      } else {
        // 在新建会话的场景下，这是正常情况，不需要警告
        console.log('会话不存在，将创建新会话:', sessionId);
        return null;
      }
    } catch (error) {
      console.error('加载特定会话失败:', error);
      return null;
    }
  }

  /**
   * 更新会话名称
   * @param {string} userId 用户ID
   * @param {string} sessionId 会话ID
   * @param {string} newName 新的会话名称
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async updateChatName(userId, sessionId, newName) {
    // 参数验证
    const validation = this._validateParams({ userId, sessionId, newName });
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      const result = await this.queue.addToQueue(() => {
        // 1. 获取字典存储数据
        const chatData = this._getChatData(userId);
        
        // 2. 直接查找目标会话 - O(1)查找
        const targetChat = chatData.chats[sessionId];
        
        if (!targetChat) {
          throw new Error(`未找到会话: ${sessionId}`);
        }
        
        // 3. 更新会话名称
        targetChat.name = newName;
        
        // 4. 保存更新后的数据
        this._saveChatData(chatData, userId);
        
        console.log('会话名称更新成功:', sessionId, '->', newName);
        return targetChat;
      });
      
      return { success: true, data: result };
      
    } catch (error) {
      console.error('更新会话名称失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取队列状态（调试用）
   * @returns {Object} 队列状态信息
   */
  getQueueStatus() {
    return this.queue.getStatus();
  }

  /**
   * 清空所有会话（谨慎使用）
   * @param {string} userId 用户ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async clearAllChats(userId) {
    // 参数验证
    const validation = this._validateParams({ userId });
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    try {
      const result = await this.queue.addToQueue(() => {
        // 创建空的字典存储结构
        const emptyChatData = createChatDataTemplate();
        
        // 生成用户特定的存储键
        const storageKey = STORAGE_KEYS.getChatDataKey(userId);
        
        // 保存空数据
        setStorage(storageKey, emptyChatData);
        
        console.log('所有会话已清空');
        return { cleared: true };
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('清空会话失败:', error);
      return { success: false, error: error.message };
    }
  }
}

// ==================== 默认导出单例服务实例 ====================

// 创建全局单例服务实例
const chatStorageAPI = new ChatStorageService();

// 默认导出单例实例
export default chatStorageAPI;

// ==================== 使用示例和API文档 ====================

/**
 * 聊天存储API使用指南
 * 
 * 🎯 核心功能：
 * - 队列化异步存储，确保数据一致性
 * - 防止并发冲突，消息不丢失
 * - 统一的错误处理和返回格式
 * - 支持高并发场景
 * 
 * 📖 使用方式：
 * 
 * 导入默认单例实例：
 *    import chatStorageAPI from '@/utils/chatStorageService.js'
 *    const result = await chatStorageAPI.createNewChat(userId, sessionId, name, userMsg, aiMsg)
 * 
 * 🔄 典型的聊天流程：
 * 
 * ```javascript
 * // 在 chat.vue 中
 * import chatStorageAPI from '@/utils/chatStorageService.js'
 * 
 * // 获取当前用户ID（从JWT token中）
 * const userId = chatStorageAPI._getUserIdFromToken()
 * 
 * // 用户发送消息，AI回复成功后
 * async handleAIResponse(userMessage, aiResponse) {
 *   if (aiResponse.session_id && userId) {
 *     if (this.currentSessionId) {
 *       // 继续现有会话
 *       const result = await chatStorageAPI.continueChat(
 *         userId,
 *         this.currentSessionId, 
 *         userMessage, 
 *         aiResponse.message
 *       )
 *       if (result.success) {
 *         console.log('消息已保存')
 *       }
 *     } else {
 *       // 创建新会话
 *       const result = await chatStorageAPI.createNewChat(
 *         userId,
 *         aiResponse.session_id,
 *         '新对话',
 *         userMessage,
 *         aiResponse.message
 *       )
 *       if (result.success) {
 *         this.currentSessionId = aiResponse.session_id
 *         console.log('新会话已创建')
 *       }
 *     }
 *   }
 * }
 * 
 * // 页面加载时读取历史会话
 * mounted() {
 *   const userId = chatStorageAPI._getUserIdFromToken()
 *   if (userId) {
 *     this.chatList = chatStorageAPI.loadAllChats(userId)
 *   }
 * }
 * 
 * // 点击历史会话
 * loadHistoryChat(sessionId) {
 *   const userId = chatStorageAPI._getUserIdFromToken()
 *   if (userId) {
 *     const chat = chatStorageAPI.loadChatById(userId, sessionId)
 *     if (chat) {
 *       this.currentChat = chat
 *       this.messages = chat.messages
 *       this.currentSessionId = sessionId
 *     }
 *   }
 * }
 * ```
 * 
 * ⚠️ 注意事项：
 * - 所有写操作（创建、更新、删除）都是异步的，需要 await
 * - 读取操作是同步的，可以直接调用
 * - 返回格式统一为 {success: boolean, data?: Object, error?: string}
 * - sessionId 必须是后端返回的有效字符串
 * - userId 是必需的参数，用于数据隔离
 * - 可以使用 _getUserIdFromToken() 方法从JWT token中获取用户ID
 */