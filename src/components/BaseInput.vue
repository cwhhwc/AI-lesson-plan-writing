<template>
  <view class="input-group">
    <view class="input-icon-wrap">
      <slot name="icon" class="icon-common"></slot>
      <input
        class="input-field"
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        @input="onInput"
        :style="iconSlotUsed ? `padding-left: ${paddingLeft};` : ''"
      />
      <view class="input-label-float">{{ label }}</view>
    </view>
    <view v-if="error" class="input-error">{{ error }}</view>
  </view>
</template>
<script setup>
import { computed, useSlots } from 'vue';
const props = defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  type: { type: String, default: 'text' },
  error: String,
  labelMarginTop: { type: String, default: '20rpx' }
});
const emit = defineEmits(['update:modelValue']);
function onInput(e) {
  emit('update:modelValue', e.detail.value);
}
const slots = useSlots();
const iconSlotUsed = computed(() => !!slots.icon);
const paddingLeft = '80rpx';
</script>
<style scoped>
.input-group {
  display: flex; flex-direction: column;
  /*设置输入框的上边距*/
  margin-top: 100rpx;
}
.input-icon-wrap {
  position: relative; width: 100%;
}
.input-label-float {
  /* 设置最小宽度 */
  min-width: 100rpx;
  position: absolute;
  top: -50rpx;
  z-index: 2;
  background: #fff;
  color: #4f8cff;
  font-size: 28rpx;
  font-weight: 600;
  border-radius: 18rpx 18rpx 0 0;
  padding: 0 18rpx;
  height: 65rpx;
  line-height: 44rpx;
  box-shadow: 0 2px 8px 0 rgba(79,140,255,0.04);
  pointer-events: none;
  text-align: center;
}

.input-field { padding: 24rpx 24rpx; border: 1.5rpx solid #e0e0e0; border-radius: 18rpx; font-size: 28rpx; background: rgba(255,255,255); box-shadow: 0 1px 4px 0 rgba(79,140,255,0.04); margin-top: 0; width: 82%; }
.input-error {
  color: #f44336;
  font-size: 24rpx;
  white-space: nowrap;
  pointer-events: none;
  position: static;
  display: block;
  margin-top: 8rpx;
}


</style> 