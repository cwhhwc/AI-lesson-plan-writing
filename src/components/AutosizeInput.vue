<!-- AutosizeInput.vue (Final, Uni-App Native Solution) -->
<template>
  <!-- The wrapper's width is now controlled by our script -->
  <view class="autosize-wrapper" :style="{ width: finalWidth }">
    <input
      class="autosize-input"
      :value="modelValue"
      :placeholder="placeholder"
      @input="onInput"
    />
  </view>
  <!-- Hidden sizer element for measurement, with a unique ID -->
  <view :id="sizerId" class="autosize-sizer">{{ modelValue || placeholder }}</view>
</template>

<script setup>
import { ref, computed, onMounted, watch, getCurrentInstance, nextTick } from 'vue';

// --- Props & Emits for v-model compatibility ---
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue']);

// --- Unique ID for Sizer to prevent conflicts ---
const instance = getCurrentInstance();
const sizerId = `autosize-sizer-${instance.uid}`;

// --- Reactive State for Width Calculation ---
const measuredWidth = ref(20); // Default to a small base width

// --- Core Logic using uni.createSelectorQuery ---
const onInput = (event) => {
  // uni-app's input event provides value in `e.detail.value`
  emit('update:modelValue', event.detail.value);
  // Use nextTick to ensure the sizer's content has updated before measuring
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

// --- Computed property for the final width ---
const finalWidth = computed(() => {
  // Use the measured width, but ensure a minimum of 20px for an empty input
  const width = Math.max(20, measuredWidth.value);
  return `${width}px`;
});

// --- Lifecycle Hooks ---
// Calculate initial width on mount
onMounted(calculateWidth);
// Watch for programmatic changes to the v-model from the parent
watch(() => [props.modelValue, props.placeholder], () => nextTick(calculateWidth));

</script>

<style scoped>
.autosize-wrapper {
  display: inline-block;
  vertical-align: baseline;
  /* Add a subtle transition for smoother width changes */
  transition: width 0.2s ease-in-out;
}

.autosize-input {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: none;
  outline: none;
  background: transparent;
  border-bottom: 1px solid #339af0;
  
  /* Font styles must match the sizer */
  font-size: 28rpx;
  padding: 4rpx 8rpx;
  margin: 0;
  /* Center text for aesthetics, but it won't overflow hidden */
  text-align: center;
}

.autosize-sizer {
  position: absolute;
  top: -9999px;
  left: -9999px;
  visibility: hidden;
  white-space: pre;

  /* Font styles must match the input */
  font-size: 28rpx;
  padding: 4rpx 8rpx;
  margin: 0;
  text-align: center;
}
</style>
