<template>
  <view class="lesson-plan-loading" @click="handleNavigateToMarkdown">
    <view class="loading-container">
      <view class="loading-title">
        <!-- UI文本保持不变，但数据来源已变为props -->
        {{ cardData.status === 'loading' ? '教案生成中.....' : '教案已完成' }}
      </view>
      <!-- 根据props中的status来决定显示加载动画还是完成图标 -->
      <view v-if="cardData.status === 'loading'" class="progress-bars">
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
// 1. 移除所有不再需要的import
import { computed } from 'vue';

// 2. 定义props，接收来自父组件的卡片数据
const props = defineProps({
  cardData: {
    type: Object,
    required: true
  }
});

// 3. 移除ID生成逻辑，重写跳转逻辑
const handleNavigateToMarkdown = () => {
  // 如果教案已经保存并获得了永久ID，则使用永久ID跳转
  if (props.cardData.permanentId) {
    uni.navigateTo({
      url: `/pages/markdown/markdown?id=${props.cardData.permanentId}`
    });
  } 
  // 否则（仍在生成中），使用临时ID跳转，进入实时观看模式
  else if (props.cardData.temporaryId) {
    uni.navigateTo({
      url: `/pages/markdown/markdown?tempId=${props.cardData.temporaryId}`
    });
  }
};
</script>

<style scoped>
.lesson-plan-loading {
  position: relative;
  width: 100%;
  margin-top: 20rpx;
  pointer-events: auto;
  cursor: pointer;
}

.loading-container {
  width: 100%;
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
  border: 2rpx solid #e0e0e0;
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