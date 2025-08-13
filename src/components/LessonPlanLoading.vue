<template>
  <view class="lesson-plan-loading" @click="handleNavigateToMarkdown">
    <view class="loading-container">
      <view class="loading-title">
        {{ lessonPlanMode.isStreaming ? '教案生成中.....' : '教案已完成' }}
      </view>
      <view v-if="lessonPlanMode.isStreaming" class="progress-bars">
        <view class="progress-bar progress-bar-1"></view>
        <view class="progress-bar progress-bar-2"></view>
        <view class="progress-bar progress-bar-3"></view>
      </view>
      <view v-else class="completion-icon">
        <text class="checkmark">✓</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useLessonPlanStore } from '@/stores/lessonPlan.js';
import { useChatHistoryStore } from '@/stores/chatHistory.js';

const lessonPlanMode = useLessonPlanStore();
const chatHistoryStore = useChatHistoryStore();

// 生成唯一页面ID
const generateUniquePageId = () => {
  // 获取当前活跃的会话ID
  const currentSessionId = chatHistoryStore.getCurrentSessionId;
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  
  // 如果没有当前活跃会话，使用时间戳作为基础
  const baseId = currentSessionId || `new_${timestamp}`;
  
  return `${baseId}_${timestamp}_${randomId}`;
};

// 教案加载组件
const handleNavigateToMarkdown = () => {
  // 生成唯一页面ID
  const uniquePageId = generateUniquePageId();
  
  // 跳转到markdown页面，携带唯一ID参数
  uni.navigateTo({
    url: `/pages/markdown/markdown?id=${uniquePageId}`
  });
};
</script>

<style scoped>
.lesson-plan-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  cursor: pointer;
}

.loading-container {
  width: 80vw;
  height: 35vh;
  background-color: #ffffff;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40rpx;
  box-sizing: border-box;
  transition: transform 0.10s ease;
}

.loading-container:active {
  transform: scale(0.95);
}

.loading-title {
  font-size: 48rpx;
  color: #000000;
  font-weight: bold;
  margin-bottom: 60rpx;
  text-align: center;
  font-family: 'Microsoft YaHei', sans-serif;
}

.progress-bars {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  width: 100%;
  align-items: flex-start;
}

.progress-bar {
  height: 20rpx;
  background-color: #e0e0e0;
  border-radius: 10rpx;
}

.progress-bar-1 {
  width: 30%;
}

.progress-bar-2 {
  width: 50%;
}

.progress-bar-3 {
  width: 70%;
}

.completion-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20rpx;
}

.checkmark {
  font-size: 80rpx;
  color: #4CAF50;
  font-weight: bold;
}
</style>
