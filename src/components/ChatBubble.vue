<template>
  <view class="chat-bubble">
    <!-- 改造后：组件自己决定渲染内容 -->

    <!-- 情况一：如果消息是教案卡片 -->
    <template v-if="message.type === 'lesson_plan_card'">
      <LessonPlanLoading :card-data="message.content" />
    </template>

    <!-- 情况二：如果是普通消息 -->
    <template v-else>
      <!-- AI消息：使用v-html渲染，支持Markdown格式 -->
      <view v-if="message.role === 'ai'" class="ai-message" v-html="renderMarkdown(message.content || '')"></view>
      <!-- 用户消息：直接渲染文本，防止XSS -->
      <view v-else class="user-message">{{ message.content }}</view>
    </template>

  </view>
</template>

<script setup>
import { computed } from 'vue';
import LessonPlanLoading from '@/components/LessonPlanLoading.vue';
import { renderMarkdown } from '@/utils/renderMarkdown.js';

// 1. props改为接收完整的message对象
const props = defineProps({
  message: {
    type: Object,
    required: true
  }
});

// 2. 不再需要监听全局状态，逻辑已移入template中

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

/* 将原本在ChatMessageList中的样式迁移过来 */
.user-message {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.5;
}

.ai-message {
  line-height: 1.5;
}
</style>