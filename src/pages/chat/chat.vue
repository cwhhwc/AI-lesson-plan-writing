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
    <LessonPlanLoading />
  </view>
</template>

<script setup>
import { ref, nextTick, onMounted, provide } from 'vue';
import ChatMessageList from '@/components/ChatMessageList.vue';
import ChatHistoryPanel from '@/components/ChatHistoryPanel.vue';
import ScrollToBottom from '@/components/ScrollToBottom.vue';
import { useChatOptionsStore } from '@/stores/chatOptionsPanel.js';
import ChatInput from '@/components/ChatInput.vue';
import { setupBottomDetection, checkScrollPosition } from '@/utils/scrollDetection.js';
import { useChat } from '@/composables/useChat.js';
import LessonPlanLoading from '@/components/LessonPlanLoading.vue';

// 使用 Pinia Store
const chatOptionsStore = useChatOptionsStore();

// ChatInput 组件引用
const chatInputRef = ref(null);

// ChatMessageList 组件引用
const messageListRef = ref(null);

// 提供messageListRef给子组件使用
provide('messageListRef', messageListRef);

// 使用聊天 Composable
const {
  messages,
  sessionId,
  handleNewChat: handleNewChatCore,
  handleSelectChat: handleSelectChatCore,
  handleSendMessage: handleSendMessageCore,
  handleTokenInvalid
} = useChat({
  onTokenInvalid: () => {
    // Token失效时的额外处理（如果需要）
  },
  onScrollCheck: () => {
    checkScrollPosition(messageListRef);
  }
});

// 处理新建会话
const handleNewChat = () => {
  handleNewChatCore(chatInputRef.value);
};

// 处理会话选择
const handleSelectChat = (selectedSessionId) => {
  handleSelectChatCore(selectedSessionId);
};

// 处理发送消息
const handleSendMessage = (text) => {
  handleSendMessageCore(text, chatInputRef.value);
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

// 组件挂载后设置底部检测
onMounted(() => {
  nextTick(() => {
    setupBottomDetection(messageListRef);
    // 初始检查滚动位置
    checkScrollPosition(messageListRef);
    // 初始化导航栏标题
    chatOptionsStore.updateTitle();
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