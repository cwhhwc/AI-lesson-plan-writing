<template>
  <view class="message-list-container">
    <text class="title">跨组件消息列表</text>
    <view class="message-stats">
      <text>消息总数: {{ messageCount }}</text>
    </view>
    <view class="message-list">
      <view 
        v-for="(message, index) in messages" 
        :key="index" 
        class="message-item"
      >
        <text class="message-text">{{ index + 1 }}. {{ message }}</text>
      </view>
      <view v-if="messages.length === 0" class="no-messages">
        <text>暂无消息</text>
      </view>
    </view>
    <button @click="addRandomMessage" class="btn add-btn">添加随机消息</button>
    <button @click="clearMessages" class="btn clear-btn">清空消息 (来自MessageList)</button>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useTestStore } from '@/stores/test'

const testStore = useTestStore()

// 从 store 中获取状态
const messages = computed(() => testStore.messages)
const messageCount = computed(() => testStore.messageCount)

// 操作 store 状态的方法
const addRandomMessage = () => {
  const messages = [
    'Hello from MessageList!',
    'Pinia 跨组件通信真方便',
    '状态管理让组件更简洁',
    '这是来自另一个组件的消息',
    '组件间共享状态轻松实现'
  ]
  const randomMessage = messages[Math.floor(Math.random() * messages.length)]
  testStore.addMessage(randomMessage)
}

const clearMessages = () => {
  testStore.clearMessages()
}
</script>

<style scoped>
.message-list-container {
  padding: 20rpx;
  margin: 20rpx 0;
  border: 2rpx solid #2196F3;
  border-radius: 10rpx;
  background-color: #f5fbff;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #0D47A1;
  display: block;
  margin-bottom: 20rpx;
}

.message-stats {
  margin: 10rpx 0 20rpx 0;
}

.message-stats text {
  font-size: 28rpx;
  color: #1565C0;
}

.message-list {
  min-height: 100rpx;
  margin: 20rpx 0;
}

.message-item {
  padding: 15rpx;
  margin: 10rpx 0;
  background-color: white;
  border-radius: 8rpx;
  border: 1rpx solid #BBDEFB;
}

.message-text {
  font-size: 28rpx;
}

.no-messages {
  text-align: center;
  padding: 30rpx;
  color: #90A4AE;
}

.btn {
  border: none;
  border-radius: 10rpx;
  padding: 10rpx 20rpx;
  cursor: pointer;
  margin: 10rpx 10rpx 10rpx 0;
  font-size: 28rpx;
}

.add-btn {
  background-color: #2196F3;
  color: white;
}

.add-btn:active {
  background-color: #0D47A1;
}

.clear-btn {
  background-color: #F44336;
  color: white;
}

.clear-btn:active {
  background-color: #C62828;
}
</style>