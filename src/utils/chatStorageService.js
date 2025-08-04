// src/utils/chatStorageAPI.js
// 聊天存储API - 队列化异步存储服务

import { setStorage, getStorage } from './localStorage.js';
import { 
  createChatTemplate, 
  createMessageTemplate, 
  createChatDataTemplate,
  STORAGE_KEYS 
} from './chatStorage.js';

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
   * 获取字典式存储数据
   * @returns {Object} 字典式存储结构
   * @private
   */
  _getChatData() {
    let chatData = getStorage(STORAGE_KEYS.CHAT_DATA, null);
    
    if (chatData && chatData.chats && chatData.order && chatData.meta) {
      return chatData;
    }
    
    // 创建新的空字典结构
    chatData = createChatDataTemplate();
    setStorage(STORAGE_KEYS.CHAT_DATA, chatData);
    
    return chatData;
  }

  /**
   * 保存字典式存储数据
   * @param {Object} chatData 字典式存储结构
   * @private
   */
  _saveChatData(chatData) {
    // 更新元数据
    chatData.meta.lastUpdated = Date.now();
    chatData.meta.totalCount = chatData.order.length;
    
    // 保存数据
    setStorage(STORAGE_KEYS.CHAT_DATA, chatData);
  }

  /**
   * 创建新会话
   * @param {string} sessionId 后端返回的session_id
   * @param {string} chatName 会话名称
   * @param {string} userMessage 用户消息
   * @param {string} aiMessage AI回复
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async createNewChat(sessionId, chatName, userMessage, aiMessage) {
    // 参数验证
    if (!sessionId || typeof sessionId !== 'string') {
      return { success: false, error: 'sessionId不能为空且必须是字符串' };
    }
    if (!userMessage || !aiMessage) {
      return { success: false, error: '用户消息和AI回复不能为空' };
    }

    try {
      const newChat = await this.queue.addToQueue(() => {
        // 1. 获取字典存储数据
        const chatData = this._getChatData();
        
        // 2. 检查会话是否已存在 - O(1)查找
        if (chatData.chats[sessionId]) {
          console.warn('会话已存在，返回现有会话:', sessionId);
          return chatData.chats[sessionId];
        }
        
        // 3. 创建新会话数据结构
        const chat = createChatTemplate(sessionId, chatName || '新对话');
        
        // 4. 创建首条消息
        const firstMessage = createMessageTemplate(userMessage, aiMessage);
        chat.messages.push(firstMessage);
        
        // 5. 添加到字典存储 - O(1)插入
        chatData.chats[sessionId] = chat;
        chatData.order.unshift(sessionId); // 新会话放在最前面
        
        // 6. 保存更新后的数据
        this._saveChatData(chatData);
        
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
   * @param {string} sessionId 会话ID
   * @param {string} userMessage 用户消息
   * @param {string} aiMessage AI回复
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async continueChat(sessionId, userMessage, aiMessage) {
    // 参数验证
    if (!sessionId || typeof sessionId !== 'string') {
      return { success: false, error: 'sessionId不能为空且必须是字符串' };
    }
    if (!userMessage || !aiMessage) {
      return { success: false, error: '用户消息和AI回复不能为空' };
    }

    try {
      const result = await this.queue.addToQueue(() => {
        // 1. 获取字典存储数据
        const chatData = this._getChatData();
        
        // 2. 直接查找目标会话 - O(1)查找
        const targetChat = chatData.chats[sessionId];
        
        if (!targetChat) {
          throw new Error(`未找到会话: ${sessionId}`);
        }
        
        // 3. 创建新消息
        const newMessage = createMessageTemplate(userMessage, aiMessage);
        
        // 4. 添加到会话的消息列表中
        targetChat.messages.push(newMessage);
        
        // 5. 更新会话在order中的位置（移到最前面，表示最近使用）
        const orderIndex = chatData.order.indexOf(sessionId);
        if (orderIndex > 0) {
          chatData.order.splice(orderIndex, 1);
          chatData.order.unshift(sessionId);
        }
        
        // 6. 保存更新后的数据
        this._saveChatData(chatData);
        
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
   * @param {string} sessionId 会话ID
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async deleteChat(sessionId) {
    // 参数验证
    if (!sessionId || typeof sessionId !== 'string') {
      return { success: false, error: 'sessionId不能为空且必须是字符串' };
    }

    try {
      const result = await this.queue.addToQueue(() => {
        // 1. 获取字典存储数据
        const chatData = this._getChatData();
        
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
        this._saveChatData(chatData);
        
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
   * @returns {Array} 会话列表
   */
  loadAllChats() {
    try {
      // 1. 获取字典存储数据
      const chatData = this._getChatData();
      
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
   * @param {string} sessionId 会话ID
   * @returns {Object|null} 会话对象，未找到返回null
   */
  loadChatById(sessionId) {
    // 参数验证
    if (!sessionId || typeof sessionId !== 'string') {
      console.warn('sessionId不能为空且必须是字符串');
      return null;
    }

    try {
      // 1. 获取字典存储数据
      const chatData = this._getChatData();
      
      // 2. 直接从字典查找 - O(1)查找
      const targetChat = chatData.chats[sessionId];
      
      if (targetChat) {
        console.log(`找到会话: ${targetChat.name}, 消息数: ${targetChat.messages.length}`);
        return targetChat;
      } else {
        console.warn('未找到对应的会话:', sessionId);
        return null;
      }
    } catch (error) {
      console.error('加载特定会话失败:', error);
      return null;
    }
  }

  /**
   * 更新会话名称
   * @param {string} sessionId 会话ID
   * @param {string} newName 新的会话名称
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async updateChatName(sessionId, newName) {
    // 参数验证
    if (!sessionId || typeof sessionId !== 'string') {
      return { success: false, error: 'sessionId不能为空且必须是字符串' };
    }
    if (!newName || typeof newName !== 'string') {
      return { success: false, error: '新名称不能为空且必须是字符串' };
    }

    try {
      const result = await this.queue.addToQueue(() => {
        // 1. 获取字典存储数据
        const chatData = this._getChatData();
        
        // 2. 直接查找目标会话 - O(1)查找
        const targetChat = chatData.chats[sessionId];
        
        if (!targetChat) {
          throw new Error(`未找到会话: ${sessionId}`);
        }
        
        // 3. 更新会话名称
        targetChat.name = newName;
        
        // 4. 保存更新后的数据
        this._saveChatData(chatData);
        
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
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async clearAllChats() {
    try {
      const result = await this.queue.addToQueue(() => {
        // 创建空的字典存储结构
        const emptyChatData = createChatDataTemplate();
        
        // 保存空数据
        setStorage(STORAGE_KEYS.CHAT_DATA, emptyChatData);
        
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

// ==================== 便利的单例服务实例 ====================

// 创建全局单例服务实例
export const chatStorageAPI = new ChatStorageService();

// ==================== 兼容性函数导出 ====================

/**
 * 创建新会话 - 便利函数
 * @param {string} sessionId 后端返回的session_id
 * @param {string} chatName 会话名称  
 * @param {string} userMessage 用户消息
 * @param {string} aiMessage AI回复
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function createNewChat(sessionId, chatName, userMessage, aiMessage) {
  return chatStorageAPI.createNewChat(sessionId, chatName, userMessage, aiMessage);
}

/**
 * 继续现有会话 - 便利函数
 * @param {string} sessionId 会话ID
 * @param {string} userMessage 用户消息
 * @param {string} aiMessage AI回复
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function continueChat(sessionId, userMessage, aiMessage) {
  return chatStorageAPI.continueChat(sessionId, userMessage, aiMessage);
}

/**
 * 删除会话 - 便利函数
 * @param {string} sessionId 会话ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function deleteChat(sessionId) {
  return chatStorageAPI.deleteChat(sessionId);
}

/**
 * 读取所有会话 - 便利函数
 * @returns {Array} 会话列表
 */
export function loadAllChats() {
  return chatStorageAPI.loadAllChats();
}

/**
 * 根据ID读取特定会话 - 便利函数
 * @param {string} sessionId 会话ID
 * @returns {Object|null} 会话对象
 */
export function loadChatById(sessionId) {
  return chatStorageAPI.loadChatById(sessionId);
}

/**
 * 更新会话名称 - 便利函数
 * @param {string} sessionId 会话ID
 * @param {string} newName 新的会话名称
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function updateChatName(sessionId, newName) {
  return chatStorageAPI.updateChatName(sessionId, newName);
}

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
 * 1. 方式一：使用服务类实例
 *    import { chatStorageAPI } from '@/utils/chatStorageAPI.js'
 *    const result = await chatStorageAPI.createNewChat(sessionId, name, userMsg, aiMsg)
 * 
 * 2. 方式二：使用便利函数
 *    import { createNewChat, continueChat } from '@/utils/chatStorageAPI.js'
 *    const result = await createNewChat(sessionId, name, userMsg, aiMsg)
 * 
 * 🔄 典型的聊天流程：
 * 
 * ```javascript
 * // 在 chat.vue 中
 * import { chatStorageAPI } from '@/utils/chatStorageAPI.js'
 * 
 * // 用户发送消息，AI回复成功后
 * async handleAIResponse(userMessage, aiResponse) {
 *   if (aiResponse.session_id) {
 *     if (this.currentSessionId) {
 *       // 继续现有会话
 *       const result = await chatStorageAPI.continueChat(
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
 *   this.chatList = chatStorageAPI.loadAllChats()
 * }
 * 
 * // 点击历史会话
 * loadHistoryChat(sessionId) {
 *   const chat = chatStorageAPI.loadChatById(sessionId)
 *   if (chat) {
 *     this.currentChat = chat
 *     this.messages = chat.messages
 *     this.currentSessionId = sessionId
 *   }
 * }
 * ```
 * 
 * ⚠️ 注意事项：
 * - 所有写操作（创建、更新、删除）都是异步的，需要 await
 * - 读取操作是同步的，可以直接调用
 * - 返回格式统一为 {success: boolean, data?: Object, error?: string}
 * - sessionId 必须是后端返回的有效字符串
 */