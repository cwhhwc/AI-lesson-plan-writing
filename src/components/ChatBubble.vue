<template>
  <view class="chat-bubble" :class="bubbleClass">
    <!-- "思考中" 状态：当是AI消息、且内容为空、且没有卡片时显示 -->
    <view v-if="message.role === 'ai' && !message.content && !message.card" class="thinking-indicator">
      <view class="dot-flashing"></view>
    </view>
    
    <!-- 正常消息内容 -->
    <template v-else>
      <!-- AI消息：使用v-html渲染，支持Markdown格式 -->
      <view v-if="message.role === 'ai'" class="ai-message" v-html="renderMarkdown(message.content || '')"></view>
      <!-- 用户消息：直接渲染文本，防止XSS -->
      <view v-else class="user-message">{{ message.content }}</view>
  
      <!-- 教案卡片组件 -->
      <LessonPlanLoading v-if="message.card" :card-data="message.card" />
    </template>

  </view>
</template>

<script setup>
import { computed } from 'vue';
// 引入渲染和子组件
import LessonPlanLoading from '@/components/LessonPlanLoading.vue';
import { renderMarkdown } from '@/utils/renderMarkdown.js';

// 定义props，接收完整的message对象
const props = defineProps({
  message: {
    type: Object,
    required: true
  }
});

const bubbleClass = computed(() => {
  return props.message.role === 'ai' ? 'ai-bubble' : 'user-bubble';
});
</script>

<style scoped>
.chat-bubble {
  display: inline-block;
  color: #222;
  border-radius: 24rpx;
  padding: 20rpx 32rpx;
  font-size: 30rpx;
  max-width: 80vw;
  word-break: break-all;
  box-sizing: border-box;
  margin: 12rpx 0;
  user-select: text;
  -webkit-user-select: text;
  cursor: text;
}

.user-bubble {
  background: #e3f2fd;
}

.ai-bubble {
  background: #ffffff;
}

.user-message {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.5;
}

.ai-message {
  line-height: 1.5;
}

/* 新增：思考中提示的样式 */
.thinking-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 45rpx; /* 与文本行高大致匹配 */
}

.dot-flashing {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #2196F3;
  color: #2196F3;
  animation: dot-flashing 1s infinite linear alternate;
  animation-delay: 0.5s;
}
.dot-flashing::before, .dot-flashing::after {
  content: "";
  display: inline-block;
  position: absolute;
  top: 0;
}
.dot-flashing::before {
  left: -15px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #2196F3;
  color: #2196F3;
  animation: dot-flashing 1s infinite alternate;
  animation-delay: 0s;
}
.dot-flashing::after {
  left: 15px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #2196F3;
  color: #2196F3;
  animation: dot-flashing 1s infinite alternate;
  animation-delay: 1s;
}

@keyframes dot-flashing {
  0% {
    background-color: #2196F3;
  }
  50%, 100% {
    background-color: #BBDEFB;
  }
}
</style>