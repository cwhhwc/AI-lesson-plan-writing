<template>
  <view class="chat-bubble">
    <slot />
  </view>
</template>

<script setup>
// 仅负责展示消息内容，内容通过 slot 传入
</script>

<style scoped>
.chat-bubble {
  display: inline-block;
  background: #e3f2fd;
  color: #222;
  border-radius: 24rpx;
  padding: 20rpx 32rpx;
  font-size: 30rpx;
  max-width: 80vw;
  word-break: break-all;
  box-sizing: border-box;
  margin: 12rpx 0;
  /* 启用文本选择 */
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  /* 确保文本可以被选中 */
  cursor: text;
}
</style> 