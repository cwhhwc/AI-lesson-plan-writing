<template>
  <picker :range="displayOptions" :value="modelValueIndex" @change="onChange">
    <view class="base-select">
      <text class="selected-text">{{ displayLabel }}</text>
      <view class="arrow-icon"></view>
    </view>
  </picker>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  modelValue: [String, Number],
  options: {
    type: Array,
    default: () => [] // [{label, value}] 或字符串数组
  },
  placeholder: {
    type: String,
    default: '请选择'
  }
});
const emit = defineEmits(['update:modelValue']);

const displayOptions = computed(() => {
  // 支持字符串数组和对象数组
  if (props.options.length && typeof props.options[0] === 'object') {
    return props.options.map(item => item.label);
  } else {
    return props.options;
  }
});
const modelValueIndex = computed(() => {
  if (props.options.length && typeof props.options[0] === 'object') {
    return props.options.findIndex(opt => opt.value === props.modelValue);
  } else {
    return props.options.findIndex(opt => opt === props.modelValue);
  }
});
const displayLabel = computed(() => {
  const idx = modelValueIndex.value;
  if (idx >= 0) return displayOptions.value[idx];
  return props.placeholder;
});
function onChange(e) {
  const idx = e.detail.value;
  if (props.options.length && typeof props.options[0] === 'object') {
    emit('update:modelValue', props.options[idx].value);
  } else {
    emit('update:modelValue', props.options[idx]);
  }
}
</script>

<style scoped>
.base-select {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  background: #fff;
  min-width: 200rpx;
  position: relative;
  cursor: pointer;
  width: 92%;
  padding: 16rpx 24rpx;
}
.selected-text {
  flex: 1;
  color: #222;
  font-size: 28rpx;
}
.arrow-icon {
  width: 32rpx;
  height: 32rpx;
  margin-left: 12rpx;
  background: url('data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 8l5 5 5-5" stroke="%23888" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>') no-repeat center/contain;
  display: inline-block;
}
</style> 