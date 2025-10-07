<!-- 教案模式专属输入组件 -->
<template>
  <view class="chat-input-wrapper">
    <!-- 输入区域 -->
    <view class="chat-input-bar">
      <view class="input-container lesson-plan-container">
        <!-- 教案模板 -->
        <view class="lesson-plan-template">
          请按照标准格式生成一个面向
          <AutosizeInput :ref="el => inputRefs[0] = el" v-model="targetAudience" placeholder="例如:初中生" @focus-next="navigate(0)" @focus-prev="navigate(0, 'prev')" />
          的
          <AutosizeInput :ref="el => inputRefs[1] = el" v-model="subject" placeholder="例如:语文" @focus-next="navigate(1)" @focus-prev="navigate(1, 'prev')" />
          教案，课题是
          <AutosizeInput :ref="el => inputRefs[2] = el" v-model="topic" placeholder="例如:《出师表》" @focus-next="navigate(2)" @focus-prev="navigate(2, 'prev')" />
          ，教学重点是
          <AutosizeInput :ref="el => inputRefs[3] = el" v-model="keyFocus" placeholder="例如:理解主旨" @focus-next="navigate(3)" @focus-prev="navigate(3, 'prev')" />
          ，教学难点是
          <AutosizeInput :ref="el => inputRefs[4] = el" v-model="learningObjective" placeholder="例如:修辞手法" @focus-next="navigate(4)" @focus-prev="navigate(4, 'prev')" />
          ，学生基础
          <AutosizeInput :ref="el => inputRefs[5] = el" v-model="studentLevel" placeholder="较好/较差" @focus-next="navigate(5)" @focus-prev="navigate(5, 'prev')" />
          ，需要补充的基础内容或者拓展点
          <AutosizeInput :ref="el => inputRefs[6] = el" v-model="extraContent" placeholder="选填" @focus-next="navigate(6)" @focus-prev="navigate(6, 'prev')" />
          。还需要的额外要求是
          <AutosizeInput :ref="el => inputRefs[7] = el" v-model="additionalRequirements" placeholder="选填" @focus-next="navigate(7)" @focus-prev="navigate(7, 'prev')" />
          。
        </view>
        <!-- 加号按钮 -->
        <view class="plus-btn" @tap.stop="toggleOptionsPanel">
          <view class="plus-icon"></view>
        </view>
      </view>
      <!-- 发送按钮 -->
      <SendButton :disabled="isSending || isInputEmpty" @click="handleSend" />
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import SendButton from './SendButton.vue';
import AutosizeInput from './AutosizeInput.vue'; // 引入新组件

// --- Navigation Logic ---
const inputRefs = ref([]);
const navigate = (currentIndex, direction = 'next') => {
  const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
  if (targetIndex >= 0 && targetIndex < inputRefs.value.length) {
    inputRefs.value[targetIndex]?.focus();
  }
};

// 定义props
const props = defineProps({
  isSending: {
    type: Boolean,
    default: false
  }
});

// 定义emit事件
const emit = defineEmits(['send-message', 'toggle-options-panel']);

// 本地状态
const targetAudience = ref('');
const subject = ref('');
const topic = ref('');
const keyFocus = ref('');
const learningObjective = ref('');
const studentLevel = ref('');
const extraContent = ref('');
const additionalRequirements = ref(''); // 新增：额外要求

// 计算是否所有核心输入框都为空，用于禁用发送按钮
const isInputEmpty = computed(() => {
  return (
    !targetAudience.value.trim() &&
    !subject.value.trim() &&
    !topic.value.trim() &&
    !keyFocus.value.trim() &&
    !learningObjective.value.trim() &&
    !studentLevel.value.trim()
  );
});

// 打开选项面板的请求
const toggleOptionsPanel = () => {
  emit('toggle-options-panel');
};

// 清空所有输入框
const clearInput = () => {
  targetAudience.value = '';
  subject.value = '';
  topic.value = '';
  keyFocus.value = '';
  learningObjective.value = '';
  studentLevel.value = '';
  extraContent.value = '';
  additionalRequirements.value = ''; // 新增：额外要求
};

// 处理发送消息
const handleSend = () => {
  if (isInputEmpty.value || props.isSending) return;

  // 拼接最终发送的字符串
  const message = `请按照标准格式生成一个面向${targetAudience.value.trim() || '学生'}的${subject.value.trim() || '科目'}教案，课题是${topic.value.trim() || '未指定'}，教学重点是${keyFocus.value.trim() || '未指定'}，教学难点是${learningObjective.value.trim() || '未指定'}，学生基础${studentLevel.value.trim() || '中等'}，需要补充的基础内容或者拓展点${extraContent.value.trim() || '无'}。还需要的额外要求是${additionalRequirements.value.trim() || '无'}。`;
  
  emit('send-message', message);

  // 清空输入
  clearInput();
};

// 暴露方法给父组件
defineExpose({
  setInputValue: (value) => {
    // 兼容useChat中的清空逻辑
    if (value === '') {
      clearInput();
    }
  }
});
</script>

<style scoped>
/* 复用 ChatInput 的大部分样式 */
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
  border: 1px solid #e0e0e0;
  border-radius: 24rpx;
  padding: 18rpx 60rpx 18rpx 24rpx; /* 右侧留出空间给加号按钮 */
  background: #f7fafd;
  min-height: 60rpx;
}

.lesson-plan-template {
  width: 100%;
  font-size: 28rpx; /* 调整字体大小以适应移动端 */
  line-height: 2.2; /* 增加行高以容纳输入框 */
  color: #333;
  white-space: normal; /* 允许换行 */
  word-break: break-word;
}

/* .template-input 样式已移至 AutosizeInput.vue */

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