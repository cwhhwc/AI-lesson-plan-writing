import { watch } from 'vue';
import { createDocumentApi } from '@/api.js';
import { renderMarkdown } from '@/utils/renderMarkdown.js';
import { generateTemporaryId } from '@/utils/idUtils.js';

/**
   * [教案模式] 处理写教案模式的流式数据
   * @param {string} userText - 用户消息
   * @param {Object} chatInputRef - 聊天输入组件引用
   */
  const handleLessonModeFlow = async (userText, chatInputRef) => {
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

export default handleLessonModeFlow;