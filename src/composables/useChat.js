import { ref, nextTick } from 'vue';
import { chatApi } from '@/api.js';
import chatStorageAPI from '@/utils/chatStorageService.js';
import { removeToken } from '@/utils/token.js';
import { useChatHistoryStore } from '@/stores/chatHistory.js';


/**
 * 聊天功能 Composable
 * @param {Object} options - 配置选项
 * @param {Function} options.onTokenInvalid - Token失效回调
 * @param {Function} options.onScrollCheck - 滚动位置检查回调
 * @returns {Object} 聊天相关的状态和方法
 */
export function useChat(options = {}) {
  const { onTokenInvalid, onScrollCheck } = options;
  
  // 响应式状态
  const messages = ref([]);
  const sessionId = ref('');
  const aiContent = ref('');
  
  // 使用 Pinia Store
  const chatHistoryStore = useChatHistoryStore();
  
  /**
   * 处理新建会话
   * @param {Object} chatInputRef - 聊天输入组件引用
   */
  const handleNewChat = (chatInputRef) => {
    // 清空 session_id
    sessionId.value = '';
    // 清空消息列表
    messages.value = [];
    // 清空输入框
    if (chatInputRef) {
      chatInputRef.setInputValue('');
    }
    
    // 清空选中的会话
    chatHistoryStore.clearSelectedChat();
    
    // 新建会话后检查滚动位置
    nextTick(() => {
      if (onScrollCheck) onScrollCheck();
    });
  };

  /**
   * 处理会话选择
   * @param {string} selectedSessionId - 选中的会话ID
   */
  const handleSelectChat = (selectedSessionId) => {
    sessionId.value = selectedSessionId;
    
    // 获取当前用户ID
    const userId = chatStorageAPI._getUserIdFromToken();
    if (!userId) {
      console.warn('用户未登录');
      return;
    }
    
    // 根据session_id搜索对应的聊天信息
    const chatData = chatStorageAPI.loadChatById(userId, selectedSessionId);
    if (chatData) {
      // 将存储格式的消息转换为界面渲染格式
      const convertedMessages = convertStorageToRenderFormat(chatData.messages);
      
      // 更新界面消息列表
      messages.value = convertedMessages;
      
      // 消息加载完成后，检查滚动位置
      nextTick(() => {
        if (onScrollCheck) onScrollCheck();
      });
    } else {
      // 清空当前消息列表
      messages.value = [];
      
      // 清空消息后也检查滚动位置
      nextTick(() => {
        if (onScrollCheck) onScrollCheck();
      });
    }
  };

  /**
   * 将存储格式的消息转换为渲染格式
   * @param {Array} storageMessages - 存储格式的消息数组
   * @returns {Array} 渲染格式的消息数组
   */
  const convertStorageToRenderFormat = (storageMessages) => {
    const convertedMessages = [];
    storageMessages.forEach(message => {
      // 添加用户消息
      if (message.user) {
        convertedMessages.push({
          role: 'user',
          content: message.user
        });
      }
      // 添加AI消息
      if (message.ai) {
        convertedMessages.push({
          role: 'ai',
          content: message.ai
        });
      }
    });
    return convertedMessages;
  };

  /**
   * 处理发送消息
   * @param {string} text - 用户输入的消息
   * @param {Object} chatInputRef - 聊天输入组件引用
   */
  const handleSendMessage = (text, chatInputRef) => {
    // 添加用户消息到列表
    messages.value.push({ role: 'user', content: text });
    // 调用AI接口
    receiveAIMessage(text, chatInputRef);
  };

  /**
   * 处理AI消息流式响应
   * @param {string} chunk - 流式数据块
   * @param {number} msgIndex - 消息索引
   */
  const handleAIMessage = (chunk, msgIndex) => {
    console.log('断点1.1：handleAIMessage', chunk, msgIndex);
    const lines = chunk.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        if (data.code === 0) {
          if (data.session_id) sessionId.value = data.session_id;
          if (data.reply) {
            aiContent.value += data.reply;
            // 直接更新数组中的对象，Vue会自动检测变化
            messages.value[msgIndex].content = aiContent.value;
          }
        } else if (data.message) {
          messages.value[msgIndex].content = data.message;
        }
        
        // 检查是否为401错误
        if (data.code === 401 && data.message && (data.message.includes('token无效') || data.message.includes('已过期'))) {
          handleTokenInvalid();
          return;
        }
      } catch (e) {
        // 不是JSON，忽略
      }
    }
  };

  /**
   * 保存聊天记录到长期缓存
   * @param {string} userText - 用户消息
   * @param {string} aiMessage - AI回复
   */
  const saveChatToStorage = async (userText, aiMessage) => {
    // 获取当前用户ID
    const userId = chatStorageAPI._getUserIdFromToken();
    if (!userId) {
      console.warn('用户未登录，无法保存聊天记录');
      return;
    }

    if (sessionId.value) {
      // 检查session_id是否已存在于缓存中
      const existingChat = chatStorageAPI.loadChatById(userId, sessionId.value);
      if (existingChat) {
        // 存在，继续对话
        await chatStorageAPI.continueChat(userId, sessionId.value, userText, aiMessage);
      } else {
        // 不存在，创建新对话
        const result = await chatStorageAPI.createNewChat(userId, sessionId.value, userText.substring(0, 20), userText, aiMessage);
        // 只有在创建成功时才刷新会话列表
        if (result.success) {
          chatHistoryStore.refreshChatList();
        } else {
          console.error('新会话创建失败:', result.error);
        }
      }
    } else {
      console.log('保存失败');
    }
  };

  /**
   * 接收AI消息
   * @param {string} userText - 用户消息
   * @param {Object} chatInputRef - 聊天输入组件引用
   */
  const receiveAIMessage = async (userText, chatInputRef) => {
    // 直接向messages数组中添加AI消息，并记录索引
    const aiMsgIndex = messages.value.length;
    messages.value.push({ role: 'ai', content: '' });
    aiContent.value = '';
    
    // 设置发送状态
    if (chatInputRef) {
      chatInputRef.setIsSending(true);
    }

    try {
      console.log('断点1.2：receiveAIMessage', userText, sessionId.value);
      await chatApi({
        message: userText,
        session_id: sessionId.value || undefined,
        onMessage: (chunk) => {
          console.log('断点1.3：onMessage', chunk);
          handleAIMessage(chunk, aiMsgIndex)
        }
      });
      // AI消息接收完成后，存入缓存
      const aiMessage = messages.value[aiMsgIndex].content;
      await saveChatToStorage(userText, aiMessage);
    } catch (e) {
      // 检查是否为token无效错误
      if (e.message === 'TOKEN_INVALID') {
        handleTokenInvalid();
        return;
      }
      console.error(e);
      // 其他错误处理
      messages.value[aiMsgIndex].content = 'AI服务异常';
    } finally {
      // 结束，启用发送按钮
      if (chatInputRef) {
        chatInputRef.setIsSending(false);
      }
    }
  };

  /**
   * token失效统一处理
   */
  const handleTokenInvalid = () => {
    removeToken();
    uni.showToast({
      title: '登录已过期，请重新登录',
      icon: 'none',
      duration: 2000
    });
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/login/login'
      });
    }, 2000);
    
    // 调用外部回调
    if (onTokenInvalid) {
      onTokenInvalid();
    }
  };

  return {
    // 状态
    messages,
    sessionId,
    
    // 方法
    handleNewChat,
    handleSelectChat,
    handleSendMessage,
    receiveAIMessage,
    handleTokenInvalid,
    convertStorageToRenderFormat
  };
}
