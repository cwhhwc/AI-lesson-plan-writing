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
    
    <!-- 底部输入区域的容器 -->
    <view class="input-section-wrapper">
      <!-- 选项面板 -->
      <InputOptionsPanel
        v-if="isOptionsPanelVisible"
        @option-click="handleSelectOption"
        @click.stop
      />
      <!-- 底部输入栏 -->
      <ChatInput 
        ref="chatInputRef"
        @send-message="handleSendMessage"
        @toggle-options-panel="handleToggleOptionsPanel"
        @click.stop
      />
    </view>
    
    <!-- 会话列表面板 -->
    <ChatHistoryPanel 
      v-if="isHistoryPanelVisible"
      @click.stop
      @select-chat="handleSelectChat"
      @close="handleHistoryPanelClose"
      @clear-messages="handleClearMessages"
    />
    
    <!-- 回到底部按钮 -->
    <ScrollToBottom
      v-show="!isAtBottom"
      class="scroll-to-bottom"
    />
  </view>
</template>

<script setup>
import { ref, nextTick, onMounted, provide } from 'vue';
import ChatMessageList from '@/components/ChatMessageList.vue';
import ChatHistoryPanel from '@/components/ChatHistoryPanel.vue';
import ScrollToBottom from '@/components/ScrollToBottom.vue';
import ChatInput from '@/components/ChatInput.vue';
import InputOptionsPanel from '@/components/InputOptionsPanel.vue';
import { setupBottomDetection, checkScrollPosition } from '@/utils/scrollDetection.js';
import { useChat } from '@/composables/useChat.js';
import { updateNavigationTitle } from '@/utils/titleManager.js';

// --- 状态管理 ---
// 面板可见性状态
const isOptionsPanelVisible = ref(false);
const isHistoryPanelVisible = ref(false);
const isAtBottom = ref(true); // 滚动状态
const isWriteMode = ref(false); // 教案模式状态

// --- 组件引用 ---
// ChatInput 组件引用
const chatInputRef = ref(null);
// ChatMessageList 组件引用
const messageListRef = ref(null);

// --- 依赖注入 ---
// 提供messageListRef给子组件使用
provide('messageListRef', messageListRef);

// --- 组合式函数 ---
// 使用聊天 Composable
const {
  messages,
  handleNewChat: handleNewChatCore,
  handleSelectChat: handleSelectChatCore,
  handleSendMessage: handleSendMessageCore,
} = useChat({
  onTokenInvalid: () => {},
  onScrollCheck: () => {
    isAtBottom.value = checkScrollPosition(messageListRef);
  },
  isWriteMode: isWriteMode // 将isWriteMode状态传入useChat
});

// --- 辅助函数 ---
// 更新导航栏标题 (从 store 的逻辑迁移而来)
const updatePageTitle = () => {
  const modeConfig = { isWriteMode: '写教案模式' };
  const currentState = { isWriteMode: isWriteMode.value };
  updateNavigationTitle(modeConfig, currentState);
};

// 设置模式 (从 store 的逻辑迁移而来)
const setMode = (modeName, value) => {
  if (modeName === 'isWriteMode') {
    isWriteMode.value = value;
  }
  // 如果未来有其他模式，也在这里处理
  updatePageTitle();
};

// --- 事件处理 ---
// 处理新建会话
const handleNewChat = () => {
  handleNewChatCore(chatInputRef.value);
};

// 处理会话选择
const handleSelectChat = (selectedSessionId) => {
  handleSelectChatCore(selectedSessionId);
  isHistoryPanelVisible.value = false; // 选择后关闭面板
};

// 处理发送消息
const handleSendMessage = (text) => {
  handleSendMessageCore(text, chatInputRef.value);
};

// 切换选项面板的可见性
const handleToggleOptionsPanel = () => {
  // 选项面板和历史面板互斥
  if (isHistoryPanelVisible.value) {
    isHistoryPanelVisible.value = false;
  }
  isOptionsPanelVisible.value = !isOptionsPanelVisible.value;
};

// 处理来自选项面板的点击
const handleSelectOption = (option) => {
  isOptionsPanelVisible.value = false; // 首先关闭面板
  switch (option.text) {
    case '聊天记录':
      isHistoryPanelVisible.value = true;
      break;
    case '写教案':
      setMode('isWriteMode', !isWriteMode.value);
      break;
    case '我的文件':
      uni.showToast({ title: '选择了“我的文件”', icon: 'none' });
      break;
  }
};

// 处理历史面板关闭
const handleHistoryPanelClose = () => {
  isHistoryPanelVisible.value = false;
};

// 处理清空消息
const handleClearMessages = () => {
  handleNewChat();
};

// 统一的页面点击处理器，用于关闭所有打开的面板
const handlePageClick = () => {
  if (isOptionsPanelVisible.value) {
    isOptionsPanelVisible.value = false;
  }
  if (isHistoryPanelVisible.value) {
    isHistoryPanelVisible.value = false;
  }
};

// --- 生命周期钩子 ---
// 组件挂载后设置
onMounted(() => {
  nextTick(() => {
    setupBottomDetection(messageListRef, (atBottom) => {
      isAtBottom.value = atBottom;
    });
    isAtBottom.value = checkScrollPosition(messageListRef);
    updatePageTitle(); // 初始化页面标题
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

.input-section-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.scroll-to-bottom {
  position: fixed;
  bottom: 190rpx;
}
</style>