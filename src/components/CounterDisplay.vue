<template>
  <view class="counter-display">
    <text class="counter-title">跨组件计数器显示</text>
    <view class="counter-values">
      <text>计数: {{ count }}</text>
      <text>双倍计数: {{ doubleCount }}</text>
    </view>
    <button @click="increment" class="btn increment-btn">增加 (来自CounterDisplay)</button>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useTestStore } from '@/stores/test'

const testStore = useTestStore()

// 从 store 中获取状态
const count = computed(() => testStore.count)
const doubleCount = computed(() => testStore.doubleCount)

// 操作 store 状态的方法
const increment = () => {
  testStore.increment()
}
</script>

<style scoped>
.counter-display {
  padding: 20rpx;
  margin: 20rpx 0;
  border: 2rpx solid #4CAF50;
  border-radius: 10rpx;
  background-color: #f8fff8;
}

.counter-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2E7D32;
  display: block;
  margin-bottom: 20rpx;
}

.counter-values {
  margin: 20rpx 0;
}

.counter-values text {
  display: block;
  font-size: 32rpx;
  margin: 10rpx 0;
}

.btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 10rpx;
  padding: 10rpx 20rpx;
  cursor: pointer;
  margin: 10rpx 0;
}

.btn:active {
  background-color: #388E3C;
}
</style>