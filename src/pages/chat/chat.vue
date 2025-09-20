<!-- 聊天页面 -->
<template>
  <view class="chat-container" @click="handlePageClick">
    <!-- 消息列表区域 -->
    <ChatMessageList 
      ref="messageListRef"
      :messages="messages"
      @new-chat="handleNewChat"
      v-model:isAtBottom="chatListIsAtBottom"
      class="messages-area"
    />
    
    <!-- 底部输入区域的容器 -->
    <view class="input-section-wrapper">
      <!-- 选项面板 -->
      <InputOptionsPanel
        v-if="activePanel === 'options'"
        :is-write-mode="isWriteMode"
        @option-click="handleSelectOption"
        @click.stop
      />
      <!-- 底部输入栏 -->
      <ChatInput 
        v-if="!isWriteMode"
        ref="chatInputRef"
        @send-message="handleSendMessage"
        @toggle-options-panel="() => togglePanel('options')"
        @click.stop
      />
      <LessonPlanInput
        v-else
        ref="lessonPlanInputRef"
        @send-message="handleSendMessage"
        @toggle-options-panel="() => togglePanel('options')"
        @click.stop
      />
    </view>
    
    <!-- 会话列表面板 -->
    <ChatHistoryManager 
      v-if="activePanel === 'history'"
      @select-chat="handleSelectChat"
      @rename-chat="handleRenameItem"
      @delete-chat="handleDeleteItem"
      @close="handleHistoryPanelClose"
      @click.stop
    />

    <!-- 文件列表面板 -->
    <FileManager 
      v-if="activePanel === 'file'"
      @close="handleHistoryPanelClose"
      @click.stop
    />
    
    <!-- 回到底部按钮 -->
    <ScrollToBottom
      v-show="!chatListIsAtBottom"
      @request-scroll="handleScrollToBottom"
      class="scroll-to-bottom"
    />
  </view>
</template>

<script setup>
import { ref, nextTick, onMounted, provide, computed } from 'vue';
import ChatMessageList from '@/components/ChatMessageList.vue';
import ScrollToBottom from '@/components/ScrollToBottom.vue';
import ChatInput from '@/components/ChatInput.vue';
import LessonPlanInput from '@/components/LessonPlanInput.vue';
import InputOptionsPanel from '@/components/InputOptionsPanel.vue';
import ChatHistoryManager from '@/components/ChatHistoryManager.vue';
import FileManager from '@/components/FileManager.vue'; // 新增：引入文件管理器
import { useChat } from '@/composables/useChat.js';
import { updateNavigationTitle } from '@/utils/titleManager.js';
import { useChatHistoryStore } from '@/stores/chatHistory.js';
import { useAuthStore } from '@/stores/auth.js'; // 引入登出处理函数

// --- 状态管理 ---
// 面板可见性状态
const activePanel = ref(null); // null: 无, 'options': 选项, 'history': 历史, 'file': 文件
const chatListIsAtBottom = ref(true); // 用于和子组件v-model绑定的滚动状态
const isWriteMode = ref(true); // 教案模式状态

//聊天历史store
const chatHistoryStore = useChatHistoryStore();

//认证store
const authStore = useAuthStore();

// --- 组件引用 ---
// ChatInput 组件引用
const chatInputRef = ref(null);
const lessonPlanInputRef = ref(null);
const activeInputRef = computed(() => isWriteMode.value ? lessonPlanInputRef.value : chatInputRef.value);
// ChatMessageList 组件引用
const messageListRef = ref(null);

// --- 依赖注入 ---
// 提供messageListRef给子组件使用 (此行可酌情保留或删除，取决于是否有其他子组件需要)
provide('messageListRef', messageListRef);

// --- 组合式函数 ---
// 使用聊天 Composable
const {
  messages,
  handleNewChat: handleNewChatCore,
  handleSelectChat: handleSelectChatCore,
  handleSendMessage: handleSendMessageCore,
} = useChat({
  isWriteMode: isWriteMode // 将isWriteMode状态传入useChat
});

// --- 辅助函数 ---
// 更新导航栏标题 
const updatePageTitle = () => {
  const modeConfig = { isWriteMode: '写教案模式' };
  const currentState = { isWriteMode: isWriteMode.value };
  updateNavigationTitle(modeConfig, currentState);
};

// 设置模式 
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
  handleNewChatCore(activeInputRef.value);
};

// 处理发送消息
const handleSendMessage = (text) => {
  handleSendMessageCore(text, activeInputRef.value);
};

// 切换面板的可见性
const togglePanel = (panelName) => {
  activePanel.value = activePanel.value === panelName ? null : panelName;
};

// 处理来自选项面板的点击
const handleSelectOption = (option) => {
  switch (option.id) {
    case 'history':
      activePanel.value = 'history';
      break;
    case 'toggle-write-mode':
      activePanel.value = null; // 点击切换模式时，关闭所有面板
      setMode('isWriteMode', !isWriteMode.value);
      console.log('切换写教案模式:', isWriteMode.value);
      break;
    case 'files':
      activePanel.value = 'file';
      break;
    case 'balance':
      uni.navigateTo({ url: '/pages/recharge/recharge' });
      activePanel.value = null; // 点击后关闭面板
      break;
    case 'logout':
      hadleLogout();
      break;
  }
};

// 处理登出
const hadleLogout = async () => {
  uni.showModal({
    title: '确认登出',
    content: '您确定要登出吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await authStore.logout();
          uni.reLaunch({ url: '/pages/login/login' });
        } catch (error) {
          console.error('登出失败:', error);
          uni.showToast({
            title: '登出失败，请稍后重试',
            icon: 'none'
          });
        }
      }
      // 如果取消则不做任何操作
    }
  });
};
// --- 会话历史相关处理 ---
// 处理会话选择（接收整个 item 对象）
const handleSelectChat = (item) => {
  const selectedSessionId = item?.id;
  if (!selectedSessionId) return;
  handleSelectChatCore(selectedSessionId);
  activePanel.value = null; // 选择后关闭面板
};

// 处理历史面板关闭
const handleHistoryPanelClose = () => {
  activePanel.value = null;
};

// 处理重命名会话（接收 { item, newName }）
const handleRenameItem = (renameData) => {
  const sessionId = renameData?.item?.id;
  const newName = renameData?.newName?.trim();
  if (!sessionId || !newName) return;
  chatHistoryStore.renameChat(sessionId, newName);
};

// 处理删除会话（接收整个 item 对象）
const handleDeleteItem = (item) => {
  const sessionId = item?.id;
  if (!sessionId) return;
  const wasCurrent = chatHistoryStore.getCurrentSessionId === sessionId;
  chatHistoryStore.deleteChat(sessionId);
  if (wasCurrent) {
    handleClearMessages();
  }
};

// 处理清空消息
const handleClearMessages = () => {
  handleNewChat();
};

// --- 其他处理 ---
// 处理滚动到底部的请求
const handleScrollToBottom = () => {
  // 直接调用子组件暴露出的API
  messageListRef.value?.scrollToBottom();
};

// 统一的页面点击处理器，用于关闭所有打开的面板
const handlePageClick = () => {
  activePanel.value = null;
};

// --- 生命周期钩子 ---
// 组件挂载后设置
onMounted(() => {
  // 初始化会话列表的逻辑已移至 ChatHistoryManager 组件
  // 滚动相关的监听已全部移入ChatMessageList组件，此处不再需要
  nextTick(() => {
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
