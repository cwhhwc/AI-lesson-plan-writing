<template>
  <view class="chat-bubble">
    <!-- 第一部分：渲染消息的文本内容 -->
    <!-- AI消息：使用v-html渲染，支持Markdown格式 -->
    <view v-if="message.role === 'ai'" class="ai-message" v-html="renderMarkdown(message.content || '')"></view>
    <!-- 用户消息：直接渲染文本，防止XSS -->
    <view v-else class="user-message">{{ message.content }}</view>

    <!-- 第二部分：如果消息对象中存在card属性，则渲染教案卡片组件 -->
    <LessonPlanLoading v-if="message.card" :card-data="message.card" />

  </view>
</template>

<script setup>
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
</script>

<style scoped>
.chat-bubble {
  display: inline-block;
  background: #e3f2fd;
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

.user-message {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.5;
}

.ai-message {
  line-height: 1.5;
}
</style>
