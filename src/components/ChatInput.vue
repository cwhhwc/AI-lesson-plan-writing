<template>
  <view class="chat-input-wrapper">
    <!-- 输入框 -->
    <view class="chat-input-bar">
      <view class="input-container">
        <textarea 
          class="chat-input" 
          v-model="inputValue" 
          placeholder="请输入消息..." 
          :auto-height="true"
          :show-confirm-bar="false"
          :cursor-spacing="20"
          :adjust-position="true"
          :hold-keyboard="true"
          :maxlength="1000"
         />
        <!-- 加号按钮 -->
        <view class="plus-btn" @tap.stop="toggleOptionsPanel">
          <view class="plus-icon"></view>
        </view>
      </view>
      <!-- 发送按钮 -->
      <SendButton :disabled="isSending" @click="handleSend" />
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import SendButton from './SendButton.vue';


const props = defineProps({
  isSending: {
    type: Boolean,
    default: false
  }
});


const emit = defineEmits(['send-message', 'toggle-options-panel']);

// 本地状态
const inputValue = ref('');

// 打开选项面板的请求
const toggleOptionsPanel = () => {
  emit('toggle-options-panel');
};

// 处理发送消息
const handleSend = () => {
  const text = inputValue.value.trim();
  if (!text || props.isSending) return;
  
  emit('send-message', text);
  inputValue.value = '';
};

// 暴露方法给父组件
defineExpose({
  setInputValue: (value) => {
    inputValue.value = value;
  }
});
</script>

<style scoped>
.chat-input-wrapper {
  background: #fff;
}

.chat-input-bar {
  display: flex;
  align-items: center;
  padding: 24rpx 24rpx 32rpx 24rpx;
  background: #fff;
  box-sizing: border-box;
}

.input-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.chat-input {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 24rpx;
  padding: 18rpx 60rpx 18rpx 24rpx; /* 右侧留出空间给加号按钮 */
  font-size: 30rpx;
  outline: none;
  background: #f7fafd;
  min-height: 60rpx;
  max-height: 300rpx; /* 约5行的高度 */
  resize: none;
  overflow-y: auto;
  line-height: 1.5;
  word-wrap: break-word;
}

.plus-btn {
  position: absolute;
  right: 8rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
}

.plus-icon {
  width: 28rpx;
  height: 28rpx;
  background: url('data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 4v12M4 10h12" stroke="%23666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>') no-repeat center/contain;
}
</style>
