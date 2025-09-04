<template>
  <view class="nav" :class="{ 'scrolled': isScrolled }">
    <view class="container nav-container">
      <view class="logo" @click="emit('navigateTo', 'hero')">
        <image class="logo-icon" src="/static/mylogo.svg" mode="aspectFit"></image>
        <text>折纸 AI</text>
      </view>
      <view class="nav-links">
        <view class="nav-item" @click="emit('navigateTo', 'advantages')"><text>产品优势</text></view>
        <view class="nav-item" @click="emit('navigateTo', 'features')"><text>核心功能</text></view>
        <view class="nav-item" @click="emit('navigateTo', 'workflow')"><text>三步上手</text></view>
        <view class="nav-item" @click="emit('navigateTo', 'contact')"><text>联系我们</text></view>
        <view class="nav-item btn btn-outline" @click="emit('start-experience')"><text>立即体验</text></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onPageScroll } from '@dcloudio/uni-app';

const emit = defineEmits(['navigateTo', 'start-experience']);

const isScrolled = ref(false);

onPageScroll((e) => {
  // 当页面滚动超过50px时，isScrolled为true
  isScrolled.value = e.scrollTop > 50;
});
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 2700rpx;
  margin: 0 auto;
  padding: 0 40rpx;
  box-sizing: border-box; /* 保证padding不会撑大宽度 */
}

/* 导航栏样式 */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 40rpx 0;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  z-index: 1000;
  transition: all 0.3s ease;
}

.nav.scrolled {
  padding: 30rpx 0;
  background-color: rgba(255, 255, 255, 0.98);
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 60rpx;
  font-weight: 700;
  color: #3498db;
  cursor: pointer;
}

.logo-icon {
  width: 80rpx;
  height: 80rpx;
  margin-right: 24rpx;
}

.nav-links {
  display: flex;
  align-items: center;
}

.nav-item {
  margin-left: 60rpx;
  font-weight: 500;
  color: #555;
  transition: color 0.3s;
  cursor: pointer;
}
.nav-item:hover {
  color: #3498db;
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

.btn-outline {
  background: transparent;
  border: 4rpx solid #3498db;
  color: #3498db;
}
.btn-outline text {
  color: #3498db;
}

.btn-outline:hover {
  background: #3498db;
  color: white;
}
.btn-outline:hover text {
  color: white;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .nav-links {
    display: none; /* 在小屏幕上可以先隐藏，后续可改为汉堡菜单 */
  }
}
</style>