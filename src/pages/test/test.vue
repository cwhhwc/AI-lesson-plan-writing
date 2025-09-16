<template>
  <view class="minimal-test-page">
    <!-- 这是用户看到的输入框容器 -->
    <view class="input-wrapper" :style="{ width: inputWidth }">
      <input 
        class="basic-input" 
        placeholder="自适应宽度的输入框" 
        :value="inputValue"
        @input="handleInput"
      />
    </view>

    <!-- 这是隐藏的测量元素，通过 uni-app 的 API 来获取其尺寸 -->
    <view id="sizer-node" class="sizer-style">{{ inputValue || '自适应宽度的输入框' }}</view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'

const inputValue = ref('')
const textWidth = ref(200) // 初始宽度设为最小宽度

// 获取当前组件实例，供 selectorQuery 使用
const instance = getCurrentInstance()

const handleInput = (e) => {
  inputValue.value = e.detail.value
  calculateTextWidth()
}

// 使用 uni.createSelectorQuery 计算文本宽度，这是跨平台的正确方式
const calculateTextWidth = () => {
  const query = uni.createSelectorQuery().in(instance)
  query.select('#sizer-node').boundingClientRect(data => {
    if (data && data.width) {
      // 获取测量节点的宽度，并加上一些额外空间
      textWidth.value = data.width + 40 // 40rpx 为额外空间
    }
  }).exec()
}

// 计算最终的输入框宽度，并施加最大最小限制
const inputWidth = computed(() => {
  const width = Math.max(200, Math.min(textWidth.value, 600)) // 最小200，最大600
  return width + 'px'
})

// 组件挂载后，计算一次初始宽度
onMounted(() => {
  calculateTextWidth()
})
</script>

<style>
.minimal-test-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 40rpx;
  box-sizing: border-box;
}

.input-wrapper {
  display: inline-block;
  transition: width 0.3s ease; /* 让宽度变化有动画效果 */
}

.basic-input {
  border: 1px solid #ccc;
  padding: 20rpx;
  font-size: 32rpx;
  text-align: center;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

/* 测量节点的样式 */
.sizer-style {
  /* 将其移出屏幕，并设为不可见 */
  position: absolute;
  top: -9999px;
  left: -9999px;
  visibility: hidden;
  
  /* 关键：字体、padding等样式必须和输入框完全一致，才能保证测量准确 */
  white-space: pre; /* 保留空格 */
  font-size: 32rpx;
  padding: 20rpx;
}
</style>
