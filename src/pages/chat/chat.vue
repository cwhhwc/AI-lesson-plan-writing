<!-- 聊天页面 -->
<template>
  <view class="chat-container" @click="handlePageClick">
    <!-- 消息列表区域 -->
    <ChatMessageList 
      :messages="messages"
      @new-chat="handleNewChat"
      class="messages-area"
      ref="messageListRef"
    />
    
    <!-- 底部输入栏 -->
    <ChatInput 
      ref="chatInputRef"
      @send-message="handleSendMessage"
      class="input-area"
    />
    
    <!-- 会话列表面板 -->
    <ChatHistoryPanel 
      :refresh-key="refreshTimestamp"
      v-show="chatOptionsStore.showHistoryPanel"
      @click="(e) => e.stopPropagation()"
      @select-chat="handleSelectChat"
      @close="handleHistoryPanelClose"
    />
    
    <!-- 回到底部按钮 -->
    <ScrollToBottom
      v-show="!chatOptionsStore.isAtBottom"
      class="scroll-to-bottom"
    />
    

  </view>
</template>

<script setup>
import { ref, nextTick, onMounted, provide } from 'vue';
import ChatMessageList from '@/components/ChatMessageList.vue';
import ChatHistoryPanel from '@/components/ChatHistoryPanel.vue';
import ScrollToBottom from '@/components/ScrollToBottom.vue';
import { chatApi } from '@/api.js';
import { useChatOptionsStore } from '@/stores/chatOptionsPanel.js';
import { createNewChat, continueChat, loadChatById } from '@/utils/chatStorageService.js';
import { removeToken } from '@/utils/token.js';
import ChatInput from '@/components/ChatInput.vue';
import { setupBottomDetection, checkScrollPosition } from '@/utils/scrollDetection.js';

const messages = ref([]);

//session_id 状态
const sessionId = ref('');

// 使用 Pinia Store
const chatOptionsStore = useChatOptionsStore();

// ChatInput 组件引用
const chatInputRef = ref(null);

// ChatMessageList 组件引用
const messageListRef = ref(null);

// 提供messageListRef给子组件使用
provide('messageListRef', messageListRef);

// 会话列表面板引用
const refreshTimestamp = ref(0);

// 处理新建会话
const handleNewChat = () => {
  // 清空 session_id
  sessionId.value = '';
  // 清空消息列表
  messages.value = [];
  // 清空输入框
  if (chatInputRef.value) {
    chatInputRef.value.setInputValue('');
  }
  
  // 新建会话后检查滚动位置
  nextTick(() => {
    checkScrollPosition(messageListRef);
  });
};

// 处理会话选择
const handleSelectChat = (selectedSessionId) => {
  sessionId.value = selectedSessionId;
  
  // 根据session_id搜索对应的聊天信息
  const chatData = loadChatById(selectedSessionId);
  if (chatData) {
    // 将存储格式的消息转换为界面渲染格式
    const convertedMessages = [];
    chatData.messages.forEach(message => {
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
    
    // 更新界面消息列表
    messages.value = convertedMessages;
    
    // 消息加载完成后，检查滚动位置
    nextTick(() => {
      checkScrollPosition(messageListRef);
    });
  } else {
    // 清空当前消息列表
    messages.value = [];
    
    // 清空消息后也检查滚动位置
    nextTick(() => {
      checkScrollPosition(messageListRef);
    });
  }
};

// 处理发送消息
const handleSendMessage = (text) => {
  // 添加用户消息到列表
  messages.value.push({ role: 'user', content: text });
  // 调用AI接口
  receiveAIMessage(text);
};

// 处理历史面板关闭
const handleHistoryPanelClose = () => {
  chatOptionsStore.closeHistoryPanel();
  chatOptionsStore.toggleOptionsPanel(); // 关闭历史面板时显示选项面板
};

// 使用通用页面点击处理器，统一管理所有面板
const handlePageClick = (e) => {
  chatOptionsStore.handlePageClick(e);
};



// 流式消息内容累积变量
let aiContent = '';

//渲染AI消息
function handleAIMessage(chunk, msgIndex) {
  const lines = chunk.split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    try {
      const data = JSON.parse(line);
      if (data.code === 0) {
        if (data.session_id) sessionId.value = data.session_id;
        if (data.reply) {
          aiContent += data.reply;
          // 直接更新数组中的对象，Vue会自动检测变化
          messages.value[msgIndex].content = aiContent;
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
}

// 保存聊天记录到长期缓存
async function saveChatToStorage(userText, aiMessage) {
  if (sessionId.value) {
    // 检查session_id是否已存在于缓存中
    const existingChat = loadChatById(sessionId.value);
    if (existingChat) {
      // 存在，继续对话
      await continueChat(sessionId.value, userText, aiMessage);
    } else {
      // 不存在，创建新对话
      const result = await createNewChat(sessionId.value, userText.substring(0, 20), userText, aiMessage);
      // 只有在创建成功时才刷新会话列表
      if (result.success) {

        refreshTimestamp.value = Date.now();
      } else {
        console.error('新会话创建失败:', result.error);
      }
    }
  } else {
    console.log('保存失败');
  }
}

//接收AI消息
async function receiveAIMessage(userText) {
  // 直接向messages数组中添加AI消息，并记录索引
  const aiMsgIndex = messages.value.length;
  messages.value.push({ role: 'ai', content: '' });
  aiContent = '';
  
  // 设置发送状态
  if (chatInputRef.value) {
    chatInputRef.value.setIsSending(true);
  }
  
  try {
    await chatApi({
      message: userText,
      session_id: sessionId.value || undefined,
      onMessage: (chunk) => handleAIMessage(chunk, aiMsgIndex)
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
    
    // 其他错误处理
    messages.value[aiMsgIndex].content = 'AI服务异常';
  } finally {
    // 结束，启用发送按钮
    if (chatInputRef.value) {
      chatInputRef.value.setIsSending(false);
    }
  }
}

// token失效统一处理
function handleTokenInvalid() {
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
}

// 组件挂载后设置底部检测
onMounted(() => {
  nextTick(() => {
    setupBottomDetection(messageListRef);
    // 初始检查滚动位置
    checkScrollPosition(messageListRef);
  });
});


</script>

<style scoped>
.chat-container {
  min-height: 85vh;
  max-height: 95vh;
  max-width: 100vw;
  background: #e8e8e8;
  display: flex;
  flex-direction: column;
  position: relative;
}

.messages-area {
  flex: 1;
  min-height: 81vh;
  padding-bottom: 180rpx;
}

.input-area {
  flex-shrink: 0;
}

.scroll-to-bottom {
  position: fixed;
  bottom: 190rpx;
}
</style> 