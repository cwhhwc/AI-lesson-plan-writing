<template>
  <view class="chat-bubble">
    <slot />
    <!-- 教案加载组件 -->
    <LessonPlanLoading 
      v-if="shouldShowLessonPlan"
    />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useLessonPlanStore } from '@/stores/lessonPlan.js';
import LessonPlanLoading from '@/components/LessonPlanLoading.vue';

// 定义props
const props = defineProps({
  isAiMessage: {
    type: Boolean,
    required: true
  }
});

// 引入教案store
const lessonPlanStore = useLessonPlanStore();

// 本地状态：是否已经显示过教案组件
const hasShownLessonPlan = ref(false);

// 判断当前消息是否应该显示教案加载组件
const shouldShowLessonPlan = computed(() => {
  // 如果是AI消息且（教案已经开始传输 或 之前已经显示过教案组件）
  if (props.isAiMessage && lessonPlanStore.isStart && !hasShownLessonPlan.value) {
    // 第一次检测到教案开始，设置标记
    hasShownLessonPlan.value = true;
  }
  
  return props.isAiMessage && hasShownLessonPlan.value;
});
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