<!-- TestAutosizeInput.vue -->
<!-- A brand new, robust, JS-based autosize input component -->
<template>
  <div class="test-autosize-wrapper">
    <!-- 1. The actual input element the user sees and interacts with -->
    <input
      ref="inputRef"
      :value="modelValue"
      :placeholder="placeholder"
      @input="onInput"
      class="test-input"
    />
    <!-- 2. A hidden span, used only for measuring the text width -->
    <span ref="sizerRef" class="test-sizer">{{ modelValue || placeholder }}</span>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';

// --- Props & Emits --- 
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue']);

// --- Template Refs --- 
const inputRef = ref(null);
const sizerRef = ref(null);

// --- Core Logic --- 

// Function to resize the input
const resize = () => {
  // Wait for the DOM to be updated (e.g., for the sizer span to have the new text)
  nextTick(() => {
    if (!inputRef.value || !sizerRef.value) return;

    // Measure the sizer's width. If it's empty, give it a minimal width of 10px.
    const sizerWidth = sizerRef.value.scrollWidth;
    const newWidth = (props.modelValue === '' && props.placeholder === '') ? 10 : sizerWidth;

    // Apply the width to the actual input
    inputRef.value.style.width = `${newWidth}px`;
  });
};

// When the user types, update the v-model and trigger a resize
const onInput = (event) => {
  emit('update:modelValue', event.target.value);
  resize();
};

// --- Lifecycle & Watchers --- 

// Watch for programmatic changes to modelValue or placeholder
watch(() => [props.modelValue, props.placeholder], resize);

// Set the initial size when the component is mounted
onMounted(resize);

</script>

<style scoped>
.test-autosize-wrapper {
  display: inline-block;
  vertical-align: baseline;
}

.test-input {
  /* Basic styling for the input line */
  border: none;
  outline: none;
  background: transparent;
  border-bottom: 1px solid #339af0;

  /* Font must match the sizer exactly */
  font-size: 28rpx;
  text-align: center;
  padding: 4rpx 2rpx; /* Minimal horizontal padding */
  margin: 0;
}

.test-sizer {
  /* This element is never shown, only used for measurement */
  position: absolute;
  top: -9999px;
  left: -9999px;
  visibility: hidden;
  white-space: pre; /* Respect spaces for accurate measurement */

  /* Font must match the input exactly */
  font-size: 28rpx;
  text-align: center;
  padding: 4rpx 2rpx;
}
</style>
