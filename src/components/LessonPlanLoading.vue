<template>
  <view class="lesson-plan-loading" @click="handleNavigateToMarkdown">
    <view class="loading-container">
      <view class="loading-title">教案生成中.....</view>
      <view class="progress-bars">
        <view class="progress-bar progress-bar-1"></view>
        <view class="progress-bar progress-bar-2"></view>
        <view class="progress-bar progress-bar-3"></view>
      </view>
    </view>
  </view>
</template>

<script setup>
// 教案加载组件
const handleNavigateToMarkdown = () => {
  uni.navigateTo({
    url: '/pages/markdown/markdown'
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
</style>
