<!-- src/components/ReusablePanel.vue -->
<!-- 通用列表面板组件 -->

<template>
  <view class="chat-history-panel">
    <view class="history-header">
      <view class="header-content">
        <view class="back-button" @click="handleBack">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </view>
        <text class="history-title">{{ title }}</text>
      </view>
    </view>
    <view class="history-list">
      <!-- 加载状态 -->
      <view v-if="isLoading" class="loading-state">
        <text>加载中...</text>
      </view>
      
      <!-- 空状态 -->
      <view v-else-if="!items || items.length === 0" class="empty-state">
        <text>暂无记录</text>
      </view>
      
      <!-- 列表内容由父组件通过插槽提供 -->
      <slot v-else></slot>

    </view>
  </view>
</template>

<script setup>
// 定义props
const props = defineProps({
  title: {
    type: String,
    default: '列表'
  },
  items: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

// 定义emit事件
const emit = defineEmits(['close']);

// 处理返回按钮点击
const handleBack = () => {
  emit('close');
};
</script>

<style scoped>
.chat-history-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.1);
  z-index: 99;
}

.history-header {
  padding: 32rpx 24rpx 24rpx 24rpx;
  border-bottom: 1px solid #f0f0f0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.back-button {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.back-button:hover {
  opacity: 0.7;
}

.history-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  /*让会话列表的标题居中*/
  text-align: center;
}

.history-list {
  flex: 1;
  padding: 24rpx;
  overflow-y: auto;
  max-height: calc(50vh - 120rpx); /* 减去header的高度 */
}

.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200rpx;
  color: #999;
  font-size: 28rpx;
}
</style>