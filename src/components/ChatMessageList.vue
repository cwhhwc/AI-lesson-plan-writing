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
          <image v-if="msg.role === 'ai'" src="/static/mylogo.svg" class="ai-avatar" />
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
import { ref, onMounted, watch, onUnmounted } from 'vue';
import ChatBubble from '@/components/ChatBubble.vue';
import NewChatButton from '@/components/NewChatButton.vue';

// 定义props
const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  scrollTrigger: {
    type: Number,
    default: 0
  }
});

// 定义emits
const emit = defineEmits(['new-chat', 'update:isAtBottom']);

// 监听滚动触发器
watch(() => props.scrollTrigger, () => {
  if (props.scrollTrigger > 0) {
    scrollToBottom();
  }
});

// --- 滚动相关逻辑 --- 

// 内部状态：管理是否在底部
const isAtBottom = ref(true);

// DOM 引用：获取组件根元素，用于后续查询
const messagesContainer = ref(null);
let scrollableElement = null; // 用于存储真正的滚动DOM节点，提升作用域以便onUnmounted能访问

// 内部方法：检查滚动位置
const checkScrollPosition = () => {
  const el = scrollableElement;
  if (el) {
    const isScrolledToBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 5;
    isAtBottom.value = isScrolledToBottom;
    return isScrolledToBottom;
  }
  return true;
};

// 公共API：滚动到底部
const scrollToBottom = () => {
  const el = scrollableElement;
  if (el) {
    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'smooth'
    });
  }
};

// 监听isAtBottom状态的变化，并通过emit通知父组件
watch(isAtBottom, (newValue) => {
  emit('update:isAtBottom', newValue);
});

// 组件挂载后，设置滚动监听器
onMounted(() => {
  // 使用被验证过的可靠方式获取滚动DOM节点
  if (messagesContainer.value && messagesContainer.value.$el) {
    scrollableElement = messagesContainer.value.$el.querySelector('.messages-content');
  }
  
  console.log('找到的滚动元素 scrollableElement:', scrollableElement);

  if (scrollableElement) {
    scrollableElement.addEventListener('scroll', checkScrollPosition);
    // 初始检查一次
    checkScrollPosition();
  } else {
    console.error('未能找到滚动容器 .messages-content');
  }
});

// 组件卸载前，清理事件监听器
onUnmounted(() => {
  if (scrollableElement) {
    // 在组件卸载时，移除事件监听器，防止内存泄漏
    scrollableElement.removeEventListener('scroll', checkScrollPosition);
  }
});

// scrollToBottom 已变为内部方法，由 scrollTrigger prop 触发，不再需要暴露给父组件
// defineExpose({
//   scrollToBottom
// });

// --- 其他业务逻辑 ---

// 处理新建会话
const handleNewChat = () => {
  emit('new-chat');
};

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
  align-items: flex-start; /* 让头像和气泡顶部对齐 */
}
.msg-user {
  justify-content: flex-end;
}
.msg-ai {
  justify-content: flex-start;
}
.ai-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin-right: 20rpx;
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