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
      <!-- 会话列表将在这里渲染 -->
      <ChatHistoryItem 
        v-for="chat in chatList" 
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
import { ref, onMounted } from 'vue';
import ChatHistoryItem from '@/components/ChatHistoryItem.vue';
import { loadAllChats } from '@/utils/chatStorageService.js';

// 聊天记录面板组件
const chatList = ref([]);

// 加载所有会话
const loadChats = () => {
  try {
    const chats = loadAllChats();
    chatList.value = chats;
    console.log('加载会话列表成功:', chats.length, '个会话');
  } catch (error) {
    console.error('加载会话列表失败:', error);
    chatList.value = [];
  }
};

// 定义emit事件
const emit = defineEmits(['select-chat', 'close']);

// 处理返回按钮点击
const handleBack = () => {
  console.log('返回按钮被点击');
  emit('close');
};

// 处理会话选择
const handleSelectChat = (sessionId) => {
  console.log('ChatHistoryPanel 收到会话选择:', sessionId);
  emit('select-chat', sessionId);
};

// 处理会话重命名
const handleChatRenamed = (renameData) => {
  console.log('ChatHistoryPanel 收到会话重命名:', renameData);
  
  // 更新本地会话列表中的会话名称
  const chatIndex = chatList.value.findIndex(chat => chat.id === renameData.sessionId);
  if (chatIndex !== -1) {
    chatList.value[chatIndex].name = renameData.newName;
    console.log('会话列表已更新:', renameData.sessionId, '->', renameData.newName);
  }
};

// 处理会话删除
const handleChatDeleted = (deleteData) => {
  console.log('ChatHistoryPanel 收到会话删除:', deleteData);
  
  // 从本地会话列表中移除被删除的会话
  const chatIndex = chatList.value.findIndex(chat => chat.id === deleteData.sessionId);
  if (chatIndex !== -1) {
    chatList.value.splice(chatIndex, 1);
    console.log('会话已从列表中移除:', deleteData.sessionId);
  }
};

// 组件挂载时加载会话
onMounted(() => {
  loadChats();
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
  z-index: 30;
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
</style> 