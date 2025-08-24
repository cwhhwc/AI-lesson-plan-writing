<template>
  <!-- 使用 v-if 控制组件的渲染 -->
  <view v-if="props.show">
    <!-- 1. 添加一个遮罩层，点击它会关闭面板 -->
    <view class="floating-panel-mask" @click="closePanel"></view>

    <!-- 2. 面板本身，通过 style 绑定动态位置 -->
    <view class="floating-panel" :style="panelStyle">
      <!-- 3. 使用 slot 允许父组件传入任何自定义内容 -->
      <slot></slot>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// --- Props --- 
const props = defineProps({
  // 控制显示/隐藏
  show: {
    type: Boolean,
    default: false
  },
  // 位置属性，由父组件计算和传入
  top: { type: String, default: 'auto' },
  left: { type: String, default: 'auto' },
  right: { type: String, default: 'auto' },
  bottom: { type: String, default: 'auto' }
});

// --- Emits --- 
const emit = defineEmits(['update:show']);

// --- Computed --- 
// 动态计算面板的 style
const panelStyle = computed(() => ({
  top: props.top,
  left: props.left,
  right: props.right,
  bottom: props.bottom
}));

// --- 核心逻辑：点击遮罩层关闭 --- 
const closePanel = () => {
  emit('update:show', false);
};
</script>

<style scoped>
.floating-panel-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent; /* 背景透明，但仍能捕获点击 */
  z-index: 999; /* z-index 比面板低 */
}

.floating-panel {
  /* 核心定位 */
  position: absolute;
  z-index: 1000; /* z-index 比遮罩层高 */

  /* 外观样式 */
  background-color: #ffffff;
  border: 1px solid #e5e7eb; /* 添加一个细微的边框，以便在白色背景上可见 */
  border-radius: 8px; /* 圆角 */
  padding: 8px; /* 内部留白 */
  
  /* 其他 */
  box-sizing: border-box;
  min-width: 120px; /* 给一个最小宽度，避免内容过窄 */
}
</style>
