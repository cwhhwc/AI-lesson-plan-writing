import { ref, nextTick, watch } from 'vue';
import { chatApi } from '@/api.js';
import chatStorageAPI from '@/utils/chatStorageService.js';
import { removeToken } from '@/utils/token.js';
import { useChatHistoryStore } from '@/stores/chatHistory.js';
import { useLessonPlanStore } from '@/stores/lessonPlan.js';
import { useChatOptionsStore } from '@/stores/chatOptionsPanel.js';


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
  const lessonPlanStore = useLessonPlanStore();
  const chatOptionsStore = useChatOptionsStore();
  
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
    
    // 清空当前活跃的会话
    chatHistoryStore.clearCurrentSession();
    
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
    
    // 设置当前选中的会话ID（用于会话列表状态）
    chatHistoryStore.setSelectedSessionId(selectedSessionId);
    // 设置当前活跃的会话ID（用于跟踪当前会话）
    chatHistoryStore.setCurrentSessionId(selectedSessionId);
    
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
   * 接收AI消息 - 主入口函数
   * @param {string} userText - 用户消息
   * @param {Object} chatInputRef - 聊天输入组件引用
   */
  const receiveAIMessage = async (userText, chatInputRef) => {
    const isWriteMode = chatOptionsStore.isWriteMode;
      
    if (isWriteMode) {
      await _handleLessonModeFlow(userText, chatInputRef);
    } else {
      await _handleChatModeFlow(userText, chatInputRef);
    }
  };

  /**
   * [教案模式] 处理写教案模式的流式数据
   * @param {string} userText - 用户消息
   * @param {Object} chatInputRef - 聊天输入组件引用
   */
  const _handleLessonModeFlow = async (userText, chatInputRef) => {
    // 准备AI消息位置（用于标记前内容）
    const aiMsgIndex = _prepareAIMessage();
    
    // 设置lessonPlan store
    const chatCallback = (plainTextChunk) => {
      if (plainTextChunk) {
        aiContent.value += plainTextChunk;
        messages.value[aiMsgIndex].content = aiContent.value;
      }
    };
    lessonPlanStore.setMode('lesson', chatCallback);
    lessonPlanStore.startGeneration();
    
    // 写教案模式的流处理器
    const streamHandler = (chunk) => {
      _parseStreamChunk(
        chunk,
        (data) => {
          if (data.reply) {
            // 标准化换行符，保证"\\n"被转为真正的换行
            const normalized = data.reply.replace(/\\n/g, '\n');
            lessonPlanStore.processStreamData(normalized);
          }
        },
        (errorMessage) => {
          messages.value[aiMsgIndex].content = errorMessage;
        }
      );
    };
    
    // 执行API调用
    await _executeApiCall(userText, chatInputRef, streamHandler, async () => {
      lessonPlanStore.endGeneration();
      const aiMessage = messages.value[aiMsgIndex].content;
      if (aiMessage.trim()) {
        await saveChatToStorage(userText, aiMessage);
      }
    }, (error) => {
      lessonPlanStore.endGeneration();
      if (messages.value[aiMsgIndex]) {
        messages.value[aiMsgIndex].content = '教案生成异常';
      }
      uni.showToast({
        title: '教案生成失败',
        icon: 'none',
        duration: 2000
      });
    });
  };

  
  /**
   * [聊天模式] 处理普通聊天模式的完整流程
   * @param {string} userText - 用户消息
   * @param {Object} chatInputRef - 聊天输入组件引用
   */
  const _handleChatModeFlow = async (userText, chatInputRef) => {
    const aiMsgIndex = _prepareAIMessage();
    
    const streamHandler = (chunk) => _handleChatModeStream(chunk, aiMsgIndex);
    
    await _executeApiCall(userText, chatInputRef, streamHandler, async () => {
      const aiMessage = messages.value[aiMsgIndex].content;
      await saveChatToStorage(userText, aiMessage);
    }, () => {
      messages.value[aiMsgIndex].content = 'AI服务异常';
    });
  };

    /**
   * [聊天模式] 处理AI消息流式响应
   * @param {string} chunk - 流式数据块
   * @param {number} msgIndex - 消息索引
   */
  const _handleChatModeStream = (chunk, msgIndex) => {
  _parseStreamChunk(
      chunk,
      (data) => {
        if (data.reply) {
          aiContent.value += data.reply;
          messages.value[msgIndex].content = aiContent.value;
        }
      },
      (errorMessage) => {
        messages.value[msgIndex].content = errorMessage;
      }
    );
  };
  
  /**
   * [通用] 解析流式JSON数据
   * @param {string} chunk - 原始数据块
   * @param {Function} onData - 数据处理回调 (data, isSessionUpdate) => void
   * @param {Function} onError - 错误处理回调 (errorMessage) => void
   */
  const _parseStreamChunk = (chunk, onData, onError) => {
    const lines = chunk.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        
        // 处理session_id更新
        if (data.session_id) {
          sessionId.value = data.session_id;
          // 设置当前活跃的会话ID
          chatHistoryStore.setCurrentSessionId(data.session_id);
        }
        
        // 检查401错误
        if (data.code === 401 && data.message && (data.message.includes('token无效') || data.message.includes('已过期'))) {
          handleTokenInvalid();
          return;
        }
        
        // 处理成功响应
        if (data.code === 0) {
          onData(data, false);
        } else if (data.message) {
          onError(data.message);
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
        // 不存在，创建新对话（这是正常情况，不需要警告）
        console.log('创建新会话:', sessionId.value);
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
   * [通用] 准备AI消息位置
   * @returns {number} 消息索引
   */
  const _prepareAIMessage = () => {
    messages.value.push({ role: 'ai', content: '' });
    aiContent.value = '';
    return messages.value.length - 1;
  };

  /**
   * [教案模式] 设置markdown页面导航监听
   * @returns {Function} 停止监听的函数
   *
  const _setupMarkdownNavigation = () => {
    let hasNavigated = false;
    return watch(
      () => lessonPlanStore.isStart,
      (started) => {
        if (started && !hasNavigated) {
          hasNavigated = true;
          uni.navigateTo({ url: '/pages/markdown/markdown' });
        }
      }
    );
  };*/

  /**
   * [通用] 执行API调用的统一逻辑
   * @param {string} userText - 用户消息
   * @param {Object} chatInputRef - 聊天输入组件引用
   * @param {Function} streamHandler - 流处理器
   * @param {Function} onSuccess - 成功回调
   * @param {Function} onError - 错误回调
   */
  const _executeApiCall = async (userText, chatInputRef, streamHandler, onSuccess, onError) => {
    // 设置发送状态
    if (chatInputRef) {
      chatInputRef.setIsSending(true);
    }

    try {
      await chatApi({
        message: userText,
        session_id: sessionId.value || undefined,
        onMessage: streamHandler
      });
      await onSuccess();
    } catch (e) {
      if (e.message === 'TOKEN_INVALID') {
        handleTokenInvalid();
        return;
      }
      console.error(e);
      onError(e);
    } finally {
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
