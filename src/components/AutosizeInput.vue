<!-- AutosizeInput.vue (with navigation logic) -->
<template>
  <!-- The wrapper's width is now controlled by our script -->
  <view class="autosize-wrapper" :style="{ width: finalWidth }">
    <input
      ref="inputRef" 
      class="autosize-input"
      :value="modelValue"
      :placeholder="placeholder"
      @input="onInput"
      @keydown="handleKeydown"
    />
  </view>
  <!-- Hidden sizer element for measurement, with a unique ID -->
  <view :id="sizerId" class="autosize-sizer">{{ modelValue || placeholder }}</view>
</template>

<script setup>
/*
 * =================================================================================
 * !! 重要兼容性警告 !!
 * =================================================================================
 * 当前组件的实现（特别是 handleKeydown 和 defineExpose 中的 focus 方法）是针对 H5 平台
 * 特别调试的。它强依赖于 uni-app 在 H5 端的特定 DOM 结构和 Web API (如 event.instance.$el,
 * querySelector, ref.$el 等)。
 *
 * 这段代码在非 H5 平台（如 App、各类小程序）上极有可能无法正常工作。
 *
 * 如果未来需要将此组件用于其他平台，必须使用 uni-app 的条件编译 (`#ifdef H5`, 
 * `#ifndef H5` 等) 为其他平台提供专门的实现逻辑。
 * =================================================================================
 */
import { ref, computed, onMounted, watch, getCurrentInstance, nextTick } from 'vue';

// --- Props & Emits for v-model compatibility ---
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue', 'focus-next', 'focus-prev']);

// --- Expose focus method for parent component ---
const inputRef = ref(null);
defineExpose({
  focus: () => {
    // 在 uni-app 中，模板中 <input> 上的 ref 引用得到的是一个组件实例 (Proxy)，而不是原生 DOM 元素。
    const inputProxy = inputRef.value;
    if (!inputProxy) {
      return;
    }

    // 这个组件实例的 $el 属性，指向的是 <uni-input> 这个自定义组件的根元素 (外层包装器)。
    // 这与我们在 keydown 事件中观察到的 event.instance.$el 行为一致。
    const wrapperElement = inputProxy.$el;
    if (!wrapperElement) {
      return;
    }

    // 因此，我们需要像之前一样，在包装器内部通过 querySelector 找到最终的、原生的 <input> 元素。
    const realInputElement = wrapperElement.querySelector('input');
    
    // 在这个真正的 <input> 元素上调用 focus() 方法，使其获得焦点。
    realInputElement?.focus();
  }
});

// --- Keydown Navigation Logic ---
const handleKeydown = (event) => {
  // 从事件对象中获取按键名称, e.g., "ArrowRight"
  const key = event.key;

  // `event.instance.$el` 是 uni-app 的 <uni-input> 自定义组件的根元素，
  // 它是一个包装器，而不是真正的 <input> 标签。
  const wrapperElement = event.instance?.$el;

  // 如果包装器元素不存在，则直接返回。
  if (!wrapperElement) {
    return;
  }

  // 使用 querySelector 在包装器内部查找真正的 <input> DOM 元素。
  // 这才是我们能从中获取光标位置的元素。
  const inputElement = wrapperElement.querySelector('input');

  // 安全校验：如果找不到真正的 <input> 元素，或它没有光标属性，则返回。
  if (!inputElement || typeof inputElement.selectionStart === 'undefined') {
    return;
  }

  // 从真实的 <input> 元素上获取光标位置。
  const { selectionStart, selectionEnd } = inputElement;
  
  // 从 props 获取 v-model 绑定的值的长度。
  const valueLength = props.modelValue.length;

  // 如果有文本被选中，则不导航。
  if (selectionStart !== selectionEnd) {
    return;
  }

  // 条件判断：右箭头 + 光标在末尾
  if (key === 'ArrowRight' && selectionStart === valueLength) {
    emit('focus-next');
  }

  // 条件判断：左箭头 + 光标在开头
  if (key === 'ArrowLeft' && selectionStart === 0) {
    emit('focus-prev');
  }
};

// --- Existing Logic for Autosizing (unchanged) ---
const instance = getCurrentInstance();
const sizerId = `autosize-sizer-${instance.uid}`;
const measuredWidth = ref(20); // Default to a small base width

const onInput = (event) => {
  emit('update:modelValue', event.detail.value);
  nextTick(calculateWidth);
};

const calculateWidth = () => {
  const query = uni.createSelectorQuery().in(instance);
  query.select(`#${sizerId}`).boundingClientRect(data => {
    if (data && data.width) {
      measuredWidth.value = data.width;
    }
  }).exec();
};

const finalWidth = computed(() => {
  const width = Math.max(20, measuredWidth.value);
  return `${width}px`;
});

onMounted(calculateWidth);
watch(() => [props.modelValue, props.placeholder], () => nextTick(calculateWidth));

</script>

<style scoped>
.autosize-wrapper {
  display: inline-block;
  vertical-align: baseline;
}

.autosize-input {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: none;
  outline: none;
  background: transparent;
  border-bottom: 1px solid #339af0;
  
  font-size: 28rpx;
  padding: 4rpx 8rpx;
  margin: 0;
  text-align: center;
}

.autosize-sizer {
  position: absolute;
  top: -9999px;
  left: -9999px;
  visibility: hidden;
  white-space: pre;

  font-size: 28rpx;
  padding: 4rpx 8rpx;
  margin: 0;
  text-align: center;
}
</style>
