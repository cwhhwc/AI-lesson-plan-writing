<template>
  <view class="chat-messages" ref="messagesContainer">
    <view class="messages-content">
      <!-- 消息列表 -->
      <view class="messages-list">
        <view v-for="(msg, idx) in messages" 
        :key="idx" 
        :class="['msg-row', msg.role === 'user' ? 'msg-user' : 'msg-ai']" 
        :id="'msg-' + idx"
        >
          <ChatBubble 
            :message="msg"
          />
        </view>
      </view>
      
      <!-- 占位符，在消息和按钮之间 -->
      <view class="spacer"></view>
      
      <!-- 新建会话按钮 -->
      <view class="new-chat-container">
        <NewChatButton @click="handleNewChat" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ChatBubble from '@/components/ChatBubble.vue';
import NewChatButton from '@/components/NewChatButton.vue';
import { renderMarkdown } from '@/utils/renderMarkdown.js';

// 定义props
const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
});

// 定义emits
const emit = defineEmits(['new-chat']);

// 处理新建会话
const handleNewChat = () => {
  emit('new-chat');
};

// 消息容器引用
const messagesContainer = ref(null);
</script>

<style scoped>
.chat-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 32rpx 24rpx 24rpx 24rpx;
}
.messages-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  max-height: calc(90vh - 100rpx);
  display: flex;
  flex-direction: column;

  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.spacer {
  flex: 1; /* 当内容不足时，占位符会撑开空间，推送按钮到底部 */
  min-height: 0; /* 当内容超出时，占位符会缩小到0 */
}

/* .messages-list 使用默认块级布局，消息正常堆叠 */

.messages-list {
  max-width: 100vw;
}

.msg-row {
  display: flex;
  margin-bottom: 12rpx;
}
.msg-user {
  justify-content: flex-end;
}
.msg-ai {
  justify-content: flex-start;
}
.new-chat-container {
  display: flex;
  justify-content: center;
  padding: 10rpx 24rpx 10rpx 24rpx;
  width: 100%;
  margin-top: 20rpx;
}

.user-message {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.5;
  /* 启用文本选择 */
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  cursor: text;
}

.ai-message {
  /* 启用文本选择 */
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  cursor: text;
  line-height: 1.5;
}
</style>