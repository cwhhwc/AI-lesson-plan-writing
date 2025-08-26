<!-- src/components/ReusableItem.vue -->
<!-- 通用列表项组件 -->

<template>
  <view class="reusable-item" @tap="$emit('select-item', item)">
    <!-- 内容区域插槽 -->
    <view class="item-content">
      <slot name="content" :item="item">
        <!-- 默认内容：仅显示标题 -->
        <text class="item-title">{{ item.name }}</text>
      </slot>
    </view>
    
    <!-- 操作区域插槽 -->
    <view class="item-actions">
      <slot name="actions" :item="item"></slot>
    </view>
  </view>
</template>

<script setup>
// 定义props
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

// 定义emit事件
defineEmits(['select-item']);
</script>

<style scoped>
.reusable-item {
  height: 5vh; /* 屏幕高度的十分之一 */
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s ease;
  cursor: pointer;
  position: relative;
}

.reusable-item:active {
  background: #f8f9fa;
}

.item-content {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  line-height: 5vh;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
</style> 
