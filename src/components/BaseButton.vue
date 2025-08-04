<template>
  <button class="login-btn" @tap="$emit('click')"><slot /></button>
</template>
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
}
</style> 