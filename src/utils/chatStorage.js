// src/utils/chatStorage.js
// 对话存储数据结构模板定义

// ==================== 存储键名常量 ====================
export const STORAGE_KEYS = {
  // 将静态键改为函数形式，支持动态用户ID
  getChatDataKey: (userId) => {
    if (!userId || typeof userId !== 'string') {
      throw new Error('userId不能为空且必须是字符串');
    }
    return `chat_data_v2_${userId}`;
  }
};

// ==================== 数据结构模板 ====================

/**
 * 会话对象结构模板
 * @param {string} sessionId 后端返回的session_id
 * @param {string} name 会话名称
 * @returns {Object} 会话对象模板
 */
export function createChatTemplate(sessionId, name = '新对话') {
  return {
    id: sessionId,              // 后端session_id
    name: name,                 // 会话名称
    messages: [],               // 消息列表
    createTime: Date.now()      // 创建时间戳
  };
}

/**
 * 消息对象结构模板
 * @param {string} user 用户消息内容
 * @param {string} ai AI回复内容
 * @returns {Object} 消息对象模板
 */
export function createMessageTemplate(user = '', ai = '', card = null) {
  return {
    user: user,                 // 用户消息
    ai: ai,                     // AI回复
    card: card,                 // 卡片
    timestamp: Date.now()       // 消息时间戳
  };
}

/**
 * 创建新的字典式存储结构模板
 * @returns {Object} 空的字典存储结构
 */
export function createChatDataTemplate() {
  return {
    chats: {},                  // 以sessionId为key的会话字典 - O(1)查找
    order: [],                  // 会话ID的有序列表 - 用于UI展示
    meta: {
      totalCount: 0,            // 会话总数
      lastUpdated: Date.now(),  // 最后更新时间
      version: '2.0'            // 存储结构版本
    }
  };
}



// ==================== 数据结构示例 ====================

/**
 * 字典存储结构示例（O(1)查找）
 */
export const CHAT_DATA_EXAMPLE = {
  chats: {
    "session_001": {
      id: "session_001",
      name: "讨论Vue问题",
      messages: [
        {
          user: "Vue3怎么使用？",
          ai: "Vue3可以通过...",
          card: null,
          timestamp: 1703123456789
        }
      ],
      createTime: 1703123456789
    }
  },
  order: ["session_001"],
  meta: {
    totalCount: 1,
    lastUpdated: 1703123456789,
    version: '2.0'
  }
};