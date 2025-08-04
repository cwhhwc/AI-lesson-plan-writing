<template>
  <view class="glass-card">
    <slot />
  </view>
</template>
<style scoped>
.glass-card {
  width: 96vw;
  max-width: 625rpx;
  min-width: 320rpx;
  min-height: 700rpx;
  background: rgba(255,255,255,0.25);
  box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18);
  border-radius: 32rpx;
  border: 1.5rpx solid rgba(255,255,255,0.25);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0 60rpx 0;
}
</style> 