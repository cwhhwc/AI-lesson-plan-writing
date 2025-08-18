<template>
  <view class="toolbar">
    <button class="toolbar-button" @click="emitCommand('header', 'H1')">H1</button>
    <button class="toolbar-button" @click="emitCommand('header', 'H2')">H2</button>
    <button class="toolbar-button" @click="emitCommand('header', 'H3')">H3</button>
    <button class="toolbar-button" @click="emitCommand('bold')">加粗</button>
    <button class="toolbar-button" @click="emitCommand('list', 'bullet')">列表</button>
    <button class="toolbar-button" @click="emitCommand('clear')">正文</button>
  </view>
</template>

<script setup>
// 1. 定义本组件可以向父组件发出名为 'command' 的事件
const emit = defineEmits(['command']);

// 2. 当按钮被点击时，调用此函数
function emitCommand(name, value) {
  // 3. 通过 emit 发出事件，并附带一个包含指令名称和值的对象
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
  /* 新增：实现吸顶效果 */
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
</style>
