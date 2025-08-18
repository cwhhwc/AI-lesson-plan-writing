import { ref, nextTick, watch } from 'vue';
import { chatApi, createDocumentApi } from '@/api.js';
import { renderMarkdown } from '@/utils/renderMarkdown.js';
import chatStorageAPI from '@/utils/chatStorageService.js';
import { removeToken } from '@/utils/token.js';
import { useChatHistoryStore } from '@/stores/chatHistory.js';
import { useLessonPlanStore } from '@/stores/lessonPlan.js';
import { useChatOptionsStore } from '@/stores/chatOptionsPanel.js';

/**
 * [内部辅助函数] 生成唯一的临时ID，用于在获取到永久ID前占位
 * @param {object} chatHistoryStore - a pinia store instance
 * @returns {string} 临时ID
 */
const _generateTemporaryId = (chatHistoryStore) => {
  const currentSessionId = chatHistoryStore.getCurrentSessionId;
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  const baseId = currentSessionId || `new_${timestamp}`;
  return `temp_${baseId}_${timestamp}_${randomId}`;
};


/**
 * 聊天功能 Composable
 * @param {Object} options - 配置选项
 * @param {Function} options.onTokenInvalid - Token失效回调
 * @param {Function} options.onScrollCheck - 滚动位置检查回调
 * @returns {Object} 聊天相关的状态和方法
 */
export function useChat(options = {}) {
  const { onTokenInvalid, onScrollCheck } = options;
  
  const messages = ref([]);
  const sessionId = ref('');
  const aiContent = ref('');
  
  const chatHistoryStore = useChatHistoryStore();
  const lessonPlanStore = useLessonPlanStore();
  const chatOptionsStore = useChatOptionsStore();
  
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

  const convertStorageToRenderFormat = (storageMessages) => {
    const convertedMessages = [];
    storageMessages.forEach(message => {
      if (message.user) {
        convertedMessages.push({ role: 'user', content: message.user });
      }
      if (message.ai) {
        if (typeof message.ai === 'string') {
          convertedMessages.push({ role: 'ai', content: message.ai });
        } else if (typeof message.ai === 'object' && message.ai.type === 'lesson_plan_card') {
          convertedMessages.push({
            role: 'system',
            type: 'lesson_plan_card',
            content: message.ai.content
          });
        }
      }
    });
    return convertedMessages;
  };

  const handleSendMessage = (text, chatInputRef) => {
    messages.value.push({ role: 'user', content: text });
    receiveAIMessage(text, chatInputRef);
  };

  const receiveAIMessage = async (userText, chatInputRef) => {
    if (chatOptionsStore.isWriteMode) {
      await _handleLessonModeFlow(userText, chatInputRef);
    } else {
      await _handleChatModeFlow(userText, chatInputRef);
    }
  };

  const _handleLessonModeFlow = async (userText, chatInputRef) => {
    const aiMsgIndex = _prepareAIMessage();
    
    // --- 两阶段ID改造核心 ---
    // 1. 在流程开始时，立刻生成临时ID，并创建“加载中”的卡片
    const tempId = _generateTemporaryId(chatHistoryStore);
    const initialCardMessage = {
      role: 'system',
      type: 'lesson_plan_card',
      content: {
        temporaryId: tempId,
        permanentId: null,
        status: 'loading',
        title: '教案生成中...',
        summary: 'AI正在思考，请稍候'
      }
    };
    // 将卡片作为一条新消息插入
    messages.value.push(initialCardMessage);

    const chatCallback = (plainTextChunk) => {
      if (plainTextChunk) {
        aiContent.value += plainTextChunk;
        messages.value[aiMsgIndex].content = aiContent.value;
      }
    };
    lessonPlanStore.setMode('lesson', chatCallback);
    lessonPlanStore.startGeneration();
    
    const streamHandler = (chunk) => {
      _parseStreamChunk(chunk, (data) => {
        if (data.reply) {
          const normalized = data.reply.replace(/\n/g, '\n');
          lessonPlanStore.processStreamData(normalized);
        }
      }, (errorMessage) => {
        messages.value[aiMsgIndex].content = errorMessage;
      });
    };
    
    await _executeApiCall(userText, chatInputRef, streamHandler, async () => {
      lessonPlanStore.endGeneration();
      const finalMarkdown = lessonPlanStore.lessonPlanContent;
      if (!finalMarkdown) {
        messages.value[aiMsgIndex].content = '教案生成内容为空，无法保存。';
        return;
      }

      try {
        const finalHtml = renderMarkdown(finalMarkdown);
        const docTitle = `教案：${userText.substring(0, 20)}...`;

        const newDocument = await createDocumentApi({ title: docTitle, content: finalHtml });

        if (newDocument && newDocument.id) {
          // 2. 获取到永久ID后，更新Pinia Store
          lessonPlanStore.setSavedDocument(newDocument);

          // 3. 根据临时ID找到之前创建的卡片，并用永久ID更新它
          const cardToUpdate = messages.value.find(m => m.content?.temporaryId === tempId);
          if (cardToUpdate) {
            cardToUpdate.content.status = 'completed';
            cardToUpdate.content.permanentId = newDocument.id;
            cardToUpdate.content.title = newDocument.title;
            cardToUpdate.content.summary = '教案已生成，点击可进入详情页编辑与查看。';
          }
          // 4. 保存包含完整信息的聊天记录
          const introMessage = messages.value[aiMsgIndex].content;
          await saveChatToStorage(userText, introMessage);
          await saveChatToStorage(null, cardToUpdate); // 将卡片作为独立的AI消息保存

        } else {
          throw new Error('后端创建文档失败，未返回有效ID。');
        }
      } catch (error) {
        console.error('创建教案文档失败:', error);
        const cardToUpdate = messages.value.find(m => m.content?.temporaryId === tempId);
        if(cardToUpdate) cardToUpdate.content.status = 'error';
        await saveChatToStorage(userText, `[教案云端保存失败]`);
      }

    }, (error) => {
      lessonPlanStore.endGeneration();
      const cardToUpdate = messages.value.find(m => m.content?.temporaryId === tempId);
      if(cardToUpdate) cardToUpdate.content.status = 'error';
    });
  };

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

  const _handleChatModeStream = (chunk, msgIndex) => {
    _parseStreamChunk(chunk, (data) => {
      if (data.reply) {
        aiContent.value += data.reply;
        messages.value[msgIndex].content = aiContent.value;
      }
    }, (errorMessage) => {
      messages.value[msgIndex].content = errorMessage;
    });
  };
  
  const _parseStreamChunk = (chunk, onData, onError) => {
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
          onData(data, false);
        } else if (data.message) {
          onError(data.message);
        }
      } catch (e) {}
    }
  };

  const saveChatToStorage = async (userText, aiMessage) => {
    const userId = chatStorageAPI._getUserIdFromToken();
    if (!userId) return;

    if (sessionId.value) {
      const existingChat = chatStorageAPI.loadChatById(userId, sessionId.value);
      if (existingChat) {
        await chatStorageAPI.continueChat(userId, sessionId.value, userText, aiMessage);
      } else {
        const result = await chatStorageAPI.createNewChat(userId, sessionId.value, userText.substring(0, 20), userText, aiMessage);
        if (result.success) {
          chatHistoryStore.refreshChatList();
        }
      }
    } else {
      console.log('保存失败');
    }
  };

  const _prepareAIMessage = () => {
    messages.value.push({ role: 'ai', content: '' });
    aiContent.value = '';
    return messages.value.length - 1;
  };

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