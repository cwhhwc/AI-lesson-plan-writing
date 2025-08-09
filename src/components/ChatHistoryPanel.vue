<!-- src/components/ChatHistoryPanel.vue -->
<!-- 聊天记录面板组件 -->

<template>
  <view class="chat-history-panel">
    <view class="history-header">
      <view class="header-content">
        <view class="back-button" @click="handleBack">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </view>
        <text class="history-title">会话列表</text>
      </view>
    </view>
    <view class="history-list">
      <!-- 加载状态 -->
      <view v-if="chatHistoryStore.getIsLoading" class="loading-state">
        <text>加载中...</text>
      </view>
      
      <!-- 空状态 -->
      <view v-else-if="!chatHistoryStore.hasChats" class="empty-state">
        <text>暂无会话记录</text>
      </view>
      
      <!-- 会话列表 -->
      <ChatHistoryItem 
        v-else
        v-for="chat in chatHistoryStore.getChatList" 
        :key="chat.id"
        :title="chat.name"
        :session-id="chat.id"
        @select-chat="handleSelectChat"
        @chat-renamed="handleChatRenamed"
        @chat-deleted="handleChatDeleted"
      />
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue';
import ChatHistoryItem from '@/components/ChatHistoryItem.vue';
import { useChatHistoryStore } from '@/stores/chatHistory.js';

// 使用聊天历史store
const chatHistoryStore = useChatHistoryStore();

// 定义emit事件
const emit = defineEmits(['select-chat', 'close']);

// 处理返回按钮点击
const handleBack = () => {
  emit('close');
};

// 处理会话选择
const handleSelectChat = (sessionId) => {
  chatHistoryStore.selectChat(sessionId);
  emit('select-chat', sessionId);
};

// 处理会话重命名
const handleChatRenamed = (renameData) => {
  // 更新store中的会话列表
  const chatList = chatHistoryStore.getChatList;
  const chatIndex = chatList.findIndex(chat => chat.id === renameData.sessionId);
  if (chatIndex !== -1) {
    const updatedChatList = [...chatList];
    updatedChatList[chatIndex].name = renameData.newName;
    chatHistoryStore.setChatList(updatedChatList);
  }
};

// 处理会话删除
const handleChatDeleted = (deleteData) => {
  // 从store中的会话列表移除被删除的会话
  const chatList = chatHistoryStore.getChatList;
  const updatedChatList = chatList.filter(chat => chat.id !== deleteData.sessionId);
  chatHistoryStore.setChatList(updatedChatList);
};

// 组件挂载时初始化会话列表
onMounted(() => {
  chatHistoryStore.initializeChatList();
});
</script>

<style scoped>
.chat-history-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.1);
  z-index: 99;
}

.history-header {
  padding: 32rpx 24rpx 24rpx 24rpx;
  border-bottom: 1px solid #f0f0f0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.back-button {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.back-button:hover {
  opacity: 0.7;
}

.history-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  /*让会话列表的标题居中*/
  text-align: center;
}

.history-list {
  flex: 1;
  padding: 24rpx;
  overflow-y: auto;
  max-height: calc(50vh - 120rpx); /* 减去header的高度 */
}

.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200rpx;
  color: #999;
  font-size: 28rpx;
}
</style> 