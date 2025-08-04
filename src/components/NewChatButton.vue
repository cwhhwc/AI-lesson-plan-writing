<template>
  <view class="new-chat-button" @tap="$emit('click')">
    <view class="icon-container">
      <text class="plus-icon">+</text>
    </view>
    <text class="button-text">新建会话</text>
  </view>
</template>

<script setup>
// 定义事件
defineEmits(['click'])
</script>

<style scoped>
.new-chat-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  width: 30%;
  max-width: 400rpx;
  height: 80rpx;
  background: #ffffff;
  border-radius: 40rpx;
  box-shadow: 0 8rpx 24rpx 0 rgba(0, 0, 0, 0.12);
  border: 2rpx solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  cursor: pointer;
}

.new-chat-button:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx 0 rgba(0, 0, 0, 0.15);
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  background: linear-gradient(135deg, #4f8cff 0%, #6fc3ff 100%);
  border-radius: 50%;
}

.plus-icon {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  line-height: 1;
}

.button-text {
  color: #333333;
  font-size: 28rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}
</style> 