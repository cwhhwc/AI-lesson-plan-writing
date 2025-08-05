<template>
  <view class="pinia-test">
    <view class="container">
      <h2>Pinia 功能测试页面</h2>
      <view class="explanation">
        <text class="explanation-text">
          这个页面演示了 Pinia 如何实现跨组件通信。组件 CounterDisplay 和 MessageList 都使用同一个 store，
          它们之间的状态是共享的，无论在哪个组件中修改状态，其他组件都会同步更新。
        </text>
      </view>
      
      <!-- 原始测试部分 -->
      <view class="test-section">
        <h3>主控制面板</h3>
        <view class="counter-display">
          <text>计数: {{ count }}</text>
          <text>双倍计数: {{ doubleCount }}</text>
        </view>
        <view class="button-group">
          <button @click="increment" class="btn">增加</button>
          <button @click="reset" class="btn">重置</button>
        </view>
      </view>
      
      <view class="test-section">
        <h3>消息管理</h3>
        <view class="message-input">
          <input v-model="newMessage" placeholder="输入消息" class="input" />
          <button @click="addMessage" class="btn">添加消息</button>
        </view>
        <view class="message-list">
          <view v-for="(message, index) in messages" :key="index" class="message-item">
            <text>{{ message }}</text>
          </view>
        </view>
        <button @click="clearMessages" class="btn">清空消息</button>
      </view>
      
      <!-- 新增的展示跨组件通信的组件 -->
      <CounterDisplay />
      
      <MessageList />
      
      <view class="status-section">
        <h3>状态信息</h3>
        <text>消息总数: {{ messageCount }}</text>
        <text>计数器值: {{ count }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTestStore } from '@/stores/test'
import CounterDisplay from '@/components/CounterDisplay.vue'
import MessageList from '@/components/MessageList.vue'

// 使用测试 store
const testStore = useTestStore()

// 使用 store 状态
const count = computed(() => testStore.count)
const messages = computed(() => testStore.messages)
const doubleCount = computed(() => testStore.doubleCount)
const messageCount = computed(() => testStore.messageCount)

// 本地状态
const newMessage = ref('')

// 方法
const increment = () => {
  testStore.increment()
}

const reset = () => {
  testStore.reset()
}

const addMessage = () => {
  if (newMessage.value.trim()) {
    testStore.addMessage(newMessage.value.trim())
    newMessage.value = ''
  }
}

const clearMessages = () => {
  testStore.clearMessages()
}
</script>

<style scoped>
.pinia-test {
  padding: 20rpx;
}

.container {
  max-width: 100%;
}

.explanation {
  background-color: #FFF8E1;
  border-left: 8rpx solid #FFC107;
  padding: 20rpx;
  margin-bottom: 30rpx;
  border-radius: 0 10rpx 10rpx 0;
}

.explanation-text {
  font-size: 28rpx;
  color: #5D4037;
  line-height: 1.5;
}

.test-section {
  margin-bottom: 40rpx;
  padding: 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 10rpx;
}

.counter-display {
  margin: 20rpx 0;
}

.counter-display text {
  display: block;
  margin: 10rpx 0;
  font-size: 32rpx;
}

.button-group {
  display: flex;
  gap: 20rpx;
}

.message-input {
  display: flex;
  margin-bottom: 20rpx;
  gap: 20rpx;
}

.input {
  flex: 1;
  border: 1rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 10rpx 20rpx;
}

.message-item {
  padding: 10rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.btn {
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 10rpx;
  padding: 10rpx 20rpx;
  cursor: pointer;
}

.btn:active {
  background-color: #0056b3;
}

.status-section text {
  display: block;
  margin: 10rpx 0;
}
</style>