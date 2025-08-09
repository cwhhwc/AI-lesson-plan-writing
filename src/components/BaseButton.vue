<template>
  <button 
    class="login-btn" 
    :class="{ 'login-btn--disabled': disabled || loading }"
    :disabled="disabled || loading"
    @tap="handleClick"
  >
    <view v-if="loading" class="loading-spinner"></view>
    <slot v-else />
  </button>
</template>

<script setup>
const props = defineProps({
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['click']);

function handleClick() {
  if (props.disabled || props.loading) return;
  emit('click');
}
</script>
<style scoped>
.login-btn {
  width: 100%;
  margin-top: 32rpx;
  padding: 24rpx 0;
  background: linear-gradient(90deg, #4f8cff 0%, #6fc3ff 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
  border: none;
  border-radius: 22rpx;
  box-shadow: 0 4px 16px 0 #b3d8ff44;
  letter-spacing: 2rpx;
  position: relative;
  transition: all 0.3s ease;
}

.login-btn--disabled {
  background: #ccc !important;
  cursor: not-allowed;
  box-shadow: none;
}

.loading-spinner {
  width: 20rpx;
  height: 20rpx;
  border: 2rpx solid transparent;
  border-top: 2rpx solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 