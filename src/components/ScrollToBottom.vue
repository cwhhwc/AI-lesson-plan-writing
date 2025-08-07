<template>
  <view class="scroll-to-bottom" @tap="handleScrollToBottom" v-show="show">
    <view class="scroll-icon">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- 向下箭头 -->
        <path d="M7 9L13 15L19 9" stroke="currentColor" stroke-width="2" 
              stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    </view>
  </view>
</template>

<script setup>
import { computed, inject } from 'vue';
import { useChatOptionsStore } from '@/stores/chatOptionsPanel.js';
import { scrollToBottom } from '@/utils/scrollDetection.js';

// 使用Pinia store
const chatOptionsStore = useChatOptionsStore();

// 注入messageListRef
const messageListRef = inject('messageListRef');

// 计算属性：根据store状态控制显示
const show = computed(() => !chatOptionsStore.isAtBottom);

// 点击滚动到底部
const handleScrollToBottom = () => {
  if (messageListRef) {
    scrollToBottom(messageListRef);
  }
};
</script>

<style scoped>
.scroll-to-bottom {
  position: fixed;
  bottom: 40rpx;
  right: 40rpx;
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffffff 0%, rgb(229, 229, 229) 100%);
  backdrop-filter: blur(20rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    inset 2rpx 2rpx 6rpx rgba(0, 0, 0, 0.08),
    inset -1rpx -1rpx 3rpx rgba(255, 255, 255, 0.9),
    0 12rpx 32rpx rgba(0, 0, 0, 0.2),
    0 8rpx 16rpx rgba(0, 0, 0, 0.15);
  z-index: 98;
}

.scroll-to-bottom:hover {
  transform: translateY(-2rpx);
  background: linear-gradient(135deg, #ffffff 0%, rgb(229, 229, 229) 100%);
  box-shadow: 
    inset 2rpx 2rpx 6rpx rgba(0, 0, 0, 0.08),
    inset -1rpx -1rpx 3rpx rgba(255, 255, 255, 0.9),
    0 12rpx 32rpx rgba(0, 0, 0, 0.2),
    0 8rpx 16rpx rgba(0, 0, 0, 0.15);
}

.scroll-to-bottom:active {
  transform: translateY(0);
  background: linear-gradient(135deg, #f0f0f0 0%, #d0d0d0 100%);
  box-shadow: 
    inset 6rpx 6rpx 12rpx rgba(0, 0, 0, 0.15),
    inset -3rpx -3rpx 6rpx rgba(255, 255, 255, 0.6),
    0 4rpx 16rpx rgba(0, 0, 0, 0.15),
    0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.scroll-icon {
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scroll-icon svg {
  filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.2));
}

/* 响应式设计 */
@media (max-width: 768px) {
  .scroll-to-bottom {
    bottom: 30rpx;
    right: 30rpx;
    width: 120rpx;
    height: 120rpx;
  }
}
</style> 