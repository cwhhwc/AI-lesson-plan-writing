<template>
  <!-- CTA部分 -->
  <view class="cta section-view">
    <view class="container">
      <text class="cta-h2">立即体验AI备课的便捷</text>
      <text class="cta-p">免费试用AI写教案功能，体验教学准备的革命性变化</text>
      <view class="btn" @click="handleStartExperience">开始免费试用</view>
    </view>
  </view>
</template>

<script setup>
const emit = defineEmits(['start-experience']);

function handleStartExperience() {
  emit('start-experience');
}
</script>

<style scoped>
/* 基础样式，确保组件独立性 */
.container {
  width: 100%;
  max-width: 2400rpx;
  margin: 0 auto;
  padding: 0 40rpx;
}

.section-view {
  padding: 200rpx 0;
}

.btn {
  display: inline-block;
  padding: 24rpx 60rpx;
  background-color: #3498db;
  color: white;
  border-radius: 60rpx;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}
.btn text {
  color: white;
}

.btn:hover {
  background-color: #2980b9;
  transform: translateY(-4rpx);
  box-shadow: 0 10rpx 30rpx rgba(52, 152, 219, 0.3);
}

/* CTA部分 */
.cta {
  text-align: center;
  background: linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%);
  padding: 160rpx 0;
}

.cta-h2 {
  display: block;
  font-size: 80rpx;
  margin-bottom: 40rpx;
  color: #2c3e50;
}

.cta-p {
  display: block;
  max-width: 1200rpx;
  margin: 0 auto 60rpx;
  color: #7f8c8d;
}
</style>
