<template>
  <view class="toolbar">
    <!-- 格式按钮容器 -->
    <view class="format-button-container">
      <button class="toolbar-button format-trigger-button" @click="toggleFormatPanel">T</button>

      <!-- 浮动面板 -->
      <FloatingPanel v-model:show="isFormatPanelVisible" top="42px" left="0">
        <view class="menu-item" @click="selectFormat('header', 'H1')">一级标题</view>
        <view class="menu-item" @click="selectFormat('header', 'H2')">二级标题</view>
        <view class="menu-item" @click="selectFormat('header', 'H3')">三级标题</view>
        <view class="menu-item" @click="selectFormat('clear')">正文</view>
      </FloatingPanel>
    </view>

    <button class="toolbar-button" @click="emitCommand('bold')">加粗</button>
    <button class="toolbar-button" @click="emitCommand('italic')">斜体</button>
    <button class="toolbar-button" @click="emitCommand('underline')">下划线</button>
    <button class="toolbar-button" @click="emitCommand('strikethrough')">删除线</button>
    <button class="toolbar-button" @click="emitCommand('list', 'bullet')">项目符号</button>
    <button class="toolbar-button" @click="emitCommand('save')">保存</button>
    <button class="toolbar-button" @click="emitCommand('export')">导出</button>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import FloatingPanel from './FloatingPanel.vue';

// --- 状态管理 ---
const isFormatPanelVisible = ref(false);

// --- 事件定义 ---
const emit = defineEmits(['command']);

// --- 方法 ---
const toggleFormatPanel = () => {
  isFormatPanelVisible.value = !isFormatPanelVisible.value;
};

const selectFormat = (name, value = null) => {
  emitCommand(name, value);
  isFormatPanelVisible.value = false; // 选择后关闭面板
};

function emitCommand(name, value) {
  emit('command', { name, value });
}
</script>

<style scoped>
/* 胶囊形工具栏 */
.toolbar {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap; /* 窄屏自动换行，容纳所有按钮 */
  padding: 4px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03);
  /* 实现吸顶效果 */
  position: sticky;
  top: 10px; /* 距离顶部10px */
  z-index: 99;
  /* 避免被父容器拉伸，保持就地尺寸 */
  align-self: center;
  margin: 0 auto;
  width: auto;
  max-width: 100%;
  flex: 0 0 auto;
}

/* 紧凑按钮，无间距 */
.toolbar-button {
  margin: 0;
  border: none;
  background: transparent;
  height: 32px;
  padding: 0 12px;
  border-radius: 9999px;
  font-size: 13px;
  line-height: 32px;
  color: #374151;
}

.toolbar-button:focus {
  outline: none;
}

.toolbar-button:hover {
  background-color: #f3f4f6;
}

.format-button-container {
  position: relative; /* 作为浮动面板的定位锚点 */
}

.format-trigger-button {
  font-weight: bold;
}

.menu-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap; /* 防止文字换行 */
}

.menu-item:hover {
  background-color: #f3f4f6;
}
</style>
