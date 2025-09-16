<template>
  <view class="send-btn" :class="{ 'send-btn--disabled': disabled }" @tap="handleClick">
    <view class="send-arrow"></view>
  </view>
</template>

<script setup>
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

const handleClick = () => {
  if (!props.disabled) {
    emit('click');
  }
};
</script>

<style scoped>
.send-btn {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  background: #e3f2fd;
  margin-left: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
  cursor: pointer;
  position: relative;
}
.send-btn--disabled {
  pointer-events: none;
  cursor: not-allowed;
}
.send-btn--disabled::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(180, 180, 180, 0.45);
  border-radius: 50%;
  z-index: 1;
}

.send-arrow {
  width: 50rpx;
  height: 50rpx;
  background: url('data:image/svg+xml;utf8,<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="14" fill="none"/><path d="M8 14h12M16 10l4 4-4 4" stroke="%23339af0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>') no-repeat center/contain;
}
</style>
