<template>
  <view class="lesson-plan-loading" @click="handleNavigateToMarkdown">
    <view class="loading-container">
      <view class="loading-title">
        <!-- 根据传入的 cardData 状态，显示不同的文本 -->
        {{ cardData.status === 'loading' ? '教案生成中.....' : '教案已完成' }}
      </view>
      <!-- 根据 cardData 状态，显示加载动画或完成图标 -->
      <view v-if="cardData.status === 'loading'" class="progress-bars">
        <view class="progress-bar progress-bar-1"></view>
        <view class="progress-bar progress-bar-2"></view>
        <view class="progress-bar progress-bar-3"></view>
      </view>
      <view v-else-if="cardData.status === 'completed'" class="completion-icon">
        <text class="checkmark">✓</text>
      </view>
       <view v-else-if="cardData.status === 'error'" class="completion-icon">
        <text class="checkmark">✕</text> <!-- 显示一个错误图标 -->
      </view>
    </view>
  </view>
</template>

<script setup>
// 定义props，接收来自父组件的卡片数据
const props = defineProps({
  cardData: {
    type: Object,
    required: true
  }
});

// 移除ID生成逻辑，重写跳转逻辑
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
  // 如果两个ID都没有，则不执行任何操作
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
  color: #4CAF50; /* 成功是绿色 */
  font-weight: bold;
}

/* 错误状态下的图标颜色 */
.completion-icon .checkmark {
  color: #f44336; /* 失败是红色 */
}

/* 仅在成功状态下显示绿色 */
.completion-icon:has(text.checkmark) {
    /* This is a trick, but let's assume the checkmark class is sufficient */
    color: #4CAF50;
}

.completion-icon > text.checkmark {
    color: #4CAF50;
}

.completion-icon[data-status="error"] > text.checkmark {
    color: #f44336;
}

</style>
