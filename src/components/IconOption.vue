<script setup>
defineProps({
  text: {
    type: String,
    default: '文字说明',
  }
});
</script>

<template>
  <view class="icon-option">
    <view class="icon-container">
      <slot name="icon">
        <view class="icon">图标</view>
      </slot>
    </view>
    <view class="text">{{ text }}</view>
  </view>
</template>

<style scoped>
.icon-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  width: 160rpx;
}

.icon-container {
  width: 120rpx;
  height: 120rpx;
  border-radius: 32rpx;
  border: 4rpx solid #6060608c;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10rpx;
  background-color: #fff;
}

.icon-option:active .icon-container {
  background-color: #e6f7ff; /* 点击时的淡蓝色背景反馈 */
}

.icon {
  font-size: 32rpx;
}

.text {
  font-size: 28rpx;
  text-align: center;
  color: #333;
}
</style>