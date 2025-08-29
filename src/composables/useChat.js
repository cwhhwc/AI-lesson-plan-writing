import { ref, nextTick, watch } from 'vue';
import { chatApi, createDocumentApi } from '@/api.js';
import { renderMarkdown } from '@/utils/renderMarkdown.js';
import chatStorageAPI from '@/utils/chatStorageService.js';
import { removeToken } from '@/utils/token.js';
import { useChatHistoryStore } from '@/stores/chatHistory.js';
import { useLessonPlanStore } from '@/stores/lessonPlan.js';
import { generateTemporaryId } from '@/utils/idUtils.js';

/**
 * 聊天功能 Composable
 * @param {Object} options - 配置选项
 * @param {Function} options.onTokenInvalid - Token失效回调
 * @param {Function} options.onScrollCheck - 滚动位置检查回调
 * @param {Boolean} options.isWriteMode - 是否是写教案模式
 * @returns {Object} 聊天相关的状态和方法
 */
export function useChat(options = {}) {
  const { onTokenInvalid, onScrollCheck, isWriteMode } = options;
  
  const messages = ref([]);
  const sessionId = ref('');
  
  const chatHistoryStore = useChatHistoryStore();
  const lessonPlanStore = useLessonPlanStore();
  
  /**
   * 处理新建会话
   * @param {Object} chatInputRef - 聊天输入组件引用
   */
  const handleNewChat = (chatInputRef) => {
    sessionId.value = '';
    messages.value = [];
    if (chatInputRef) {
      chatInputRef.setInputValue('');
    }
    chatHistoryStore.clearCurrentSession();
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
    chatHistoryStore.setSelectedSessionId(selectedSessionId);
    chatHistoryStore.setCurrentSessionId(selectedSessionId);
    
    const userId = chatStorageAPI._getUserIdFromToken();
    if (!userId) {
      console.warn('用户未登录');
      return;
    }
    
    const chatData = chatStorageAPI.loadChatById(userId, selectedSessionId);
    if (chatData) {
      const convertedMessages = convertStorageToRenderFormat(chatData.messages);
      messages.value = convertedMessages;
      nextTick(() => {
        if (onScrollCheck) onScrollCheck();
      });
    } else {
      messages.value = [];
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
      if (message.user) {
        convertedMessages.push({ role: 'user', content: message.user });
      }
      const hasAiText = typeof message.ai === 'string' && message.ai !== '';
      const hasCard = message.card !== null && message.card !== undefined;
      if (hasAiText || hasCard) {
        const aiMsg = { role: 'ai', content: hasAiText ? message.ai : '' };
        if (hasCard) {
          aiMsg.card = message.card;
        }
        convertedMessages.push(aiMsg);
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
    messages.value.push({ role: 'user', content: text });
    receiveAIMessage(text, chatInputRef);
  };

  /**
   * 接收AI消息 - 主入口函数
   * @param {string} userText - 用户消息
   * @param {Object} chatInputRef - 聊天输入组件引用
   */
  const receiveAIMessage = async (userText, chatInputRef) => {
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
    // 1. 创建一个复合消息对象，用于承载“开头语”和“教案卡片”
    const aiMsgIndex = _prepareAIMessage('lesson');
    let resolveCardGate;
    const cardGate = new Promise((resolve) => { resolveCardGate = resolve; });

    // 2. 定义流式回调，它只会更新复合消息的 content 部分
    const chatCallback = (plainTextChunk) => {
      if (plainTextChunk) {
        messages.value[aiMsgIndex].content += plainTextChunk;
      }
    };
    lessonPlanStore.setMode('lesson', chatCallback);
    lessonPlanStore.startGeneration();
    
    // 3. 监听isStart状态，一旦教案开始，立刻创建“加载中”的卡片
    const stopWatch = watch(() => lessonPlanStore.isStart, (started) => {
      if (started) {
        messages.value[aiMsgIndex].card = {
          type: 'lesson_plan_card',
          status: 'loading',
          temporaryId: generateTemporaryId(chatHistoryStore),
          permanentId: null,
          title: '教案生成中...',
          summary: 'AI正在思考，请稍候'
        };
        if (resolveCardGate) resolveCardGate({ hasCard: true });
        stopWatch(); // 创建后立刻停止监听，避免重复创建
      }
    });

    const streamHandler = (chunk) => {
      _parseStreamChunk(chunk, (data) => {
        if (data.reply) {
          const normalized = data.reply.replace(/\n/g, '\n');
          lessonPlanStore.processStreamData(normalized);
        }
      });
    };
    
    await _executeApiCall(userText, chatInputRef, streamHandler, async () => {
      lessonPlanStore.endGeneration();
      stopWatch(); // 确保在流程结束时也停止监听
      
      if (!messages.value[aiMsgIndex].card && lessonPlanStore.isStart) {
        messages.value[aiMsgIndex].card = {
          type: 'lesson_plan_card',
          status: 'loading',
          temporaryId: generateTemporaryId(chatHistoryStore),
          permanentId: null,
          title: '教案生成中...',
          summary: 'AI正在思考，请稍候'
        };
      }

      if (!messages.value[aiMsgIndex].card) {
        if (resolveCardGate) resolveCardGate({ hasCard: false });
      } else {
        if (resolveCardGate) resolveCardGate({ hasCard: true });
      }

      await cardGate;

      const finalMarkdown = lessonPlanStore.lessonPlanContent;
      if (!finalMarkdown || !messages.value[aiMsgIndex].card) {
        await saveChatToStorage(userText, messages.value[aiMsgIndex]);
        return;
      }

      try {
        const finalHtml = renderMarkdown(finalMarkdown);
        const docTitle = `教案：${userText.substring(0, 20)}...`;

        const newDocument = await createDocumentApi({ title: docTitle, content: finalHtml });

        if (newDocument && newDocument.id) {
          // 4. 成功后，用后端返回的永久ID和数据，更新卡片
          messages.value[aiMsgIndex].card.status = 'completed';
          messages.value[aiMsgIndex].card.permanentId = newDocument.id;
          messages.value[aiMsgIndex].card.title = newDocument.title;
          messages.value[aiMsgIndex].card.summary = '教案已生成，点击可进入详情页编辑与查看。';
          await saveChatToStorage(userText, messages.value[aiMsgIndex]);
        } else {
          throw new Error('后端创建文档失败，未返回有效ID。');
        }

      } catch (error) {
        console.error('创建教案文档失败:', error);
        if (messages.value[aiMsgIndex].card) messages.value[aiMsgIndex].card.status = 'error';
      }
    }, (error) => {
      lessonPlanStore.endGeneration();
      stopWatch();
      if (messages.value[aiMsgIndex].card) messages.value[aiMsgIndex].card.status = 'error';
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
      // 改造：传入完整的AI消息对象
      await saveChatToStorage(userText, messages.value[aiMsgIndex]);
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
    _parseStreamChunk(chunk, (data) => {
      if (data.reply) {
        messages.value[msgIndex].content += data.reply;
      }
    });
  };
  
  /**
   * [通用] 解析流式JSON数据
   * @param {string} chunk - 原始数据块
   * @param {Function} onData - 数据处理回调
   */
  const _parseStreamChunk = (chunk, onData) => {
      // 添加计数器（可以放在函数外部或使用闭包）
  if (typeof window.streamDataCounter === 'undefined') {
    window.streamDataCounter = 0;
  }
    const lines = chunk.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        if (data.session_id) {
          sessionId.value = data.session_id;
          chatHistoryStore.setCurrentSessionId(data.session_id);
        }
        if (data.code === 401) {
          handleTokenInvalid();
          return;
        }
        if (data.code === 0) {
          onData(data);
        } else if (data.message) {
          console.error('Stream error message:', data.message);
        }
      } catch (e) {}
    }
  };

  /**
   * 保存聊天记录到长期缓存
   * @param {string} userText - 用户消息
   * @param {string|Object} aiMessage - AI回复
   */
  const saveChatToStorage = async (userText, aiResponse) => {
    const userId = chatStorageAPI._getUserIdFromToken();
    if (!userId) return;

    // 从完整的AI响应对象中提取文本和卡片信息
    const aiText = aiResponse.content;
    const card = aiResponse.card;

    if (sessionId.value) {
      const existingChat = chatStorageAPI.loadChatById(userId, sessionId.value);
      if (existingChat) {
        // 调用改造后的continueChat，传入card
        await chatStorageAPI.continueChat(userId, sessionId.value, userText, aiText, card);
      } else {
        // 调用改造后的createNewChat，传入card
        const result = await chatStorageAPI.createNewChat(userId, sessionId.value, userText.substring(0, 20), userText, aiText, card);
        if (result.success) {
          chatHistoryStore.refreshChatList();
        }
      }
    } else {
      console.log('保存失败: sessionId为空');
    }
  };

  /**
   * [通用] 准备AI消息位置
   * @param {string} [mode='chat'] - 模式，'chat' 或 'lesson'
   * @returns {number} 消息索引
   */
  const _prepareAIMessage = (mode = 'chat') => {
    let msg;
    if (mode === 'lesson') {
      msg = { role: 'ai', content: '', card: null };
    } else {
      msg = { role: 'ai', content: '' };
    }
    messages.value.push(msg);
    return messages.value.length - 1;
  };

  /**
   * [通用] 执行API调用的统一逻辑
   * @param {string} userText - 用户消息
   * @param {Object} chatInputRef - 聊天输入组件引用
   * @param {Function} streamHandler - 流处理器
   * @param {Function} onSuccess - 成功回调
   * @param {Function} onError - 错误回调
   */
  const _executeApiCall = async (userText, chatInputRef, streamHandler, onSuccess, onError) => {
    if (chatInputRef) chatInputRef.setIsSending(true);
    try {
      await chatApi({ message: userText, session_id: sessionId.value || undefined, onMessage: streamHandler });
      await onSuccess();
    } catch (e) {
      if (e.message === 'TOKEN_INVALID') {
        handleTokenInvalid();
        return;
      }
      console.error(e);
      onError(e);
    } finally {
      if (chatInputRef) chatInputRef.setIsSending(false);
    }
  };

  /**
   * token失效统一处理
   */
  const handleTokenInvalid = () => {
    removeToken();
    uni.showToast({ title: '登录已过期，请重新登录', icon: 'none', duration: 2000 });
    setTimeout(() => { uni.reLaunch({ url: '/pages/login/login' }); }, 2000);
    if (onTokenInvalid) onTokenInvalid();
  };

  return {
    messages, sessionId,
    handleNewChat, handleSelectChat, handleSendMessage, receiveAIMessage, handleTokenInvalid, convertStorageToRenderFormat
  };
}