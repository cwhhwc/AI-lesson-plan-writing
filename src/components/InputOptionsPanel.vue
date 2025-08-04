<!-- 输入选项面板 -->
<script setup>
import { ref } from 'vue';
import IconOption from './IconOption.vue';
import { useChatOptionsStore } from '@/utils/chatOptionsPanel.js';

// 使用 Pinia Store
const chatOptionsStore = useChatOptionsStore();

// 内部管理选项配置
const options = ref([
  {
    text: '聊天记录',
    iconClass: 'history-icon'
  },
  {
    text: '写教案',
    iconClass: 'write-icon'
  }
  // 可以在这里轻松添加更多选项
  // {
  //   text: '笔记本',
  //   iconClass: 'note-icon'
  // },
  // {
  //   text: '设置',
  //   iconClass: 'settings-icon'
  // }
]);

const emit = defineEmits(['option-click']);

const handleOptionClick = (option, index) => {
  // 可以在这里添加内部逻辑处理
  console.log('面板内部处理:', option, index);
  
  // 使用 Store 处理选项
  chatOptionsStore.handleOption(option, index);
  
  // 向外发射事件（保持向后兼容）
  emit('option-click', option, index);
};
</script>

<template>
  <view class="input-options-panel" @click="$emit('click', $event)">
    <view class="options-container" >
      <IconOption
        v-for="(option, index) in options" 
        :key="index"
        :text="option.text"
        @click="handleOptionClick(option, index)"
      >
        <template #icon>
          <view class="svg-icon" :class="option.iconClass"></view>
        </template>
      </IconOption>
    </view>
  </view>
</template>

<style scoped>
.input-options-panel {
  position: absolute;
  left: 0;
  bottom: 100%; /* 相对于父容器定位，始终在输入栏上方 */
  width: 100%;
  min-height: auto; /* 高度自适应 */
  background-color: #fff;
  border-top: 1rpx solid #e0e0e0;
  display: flex;
  flex-direction: column;
  padding: 40rpx 24rpx;
  box-sizing: border-box;
  z-index: 100; /* 确保在其他元素之上 */
}

.options-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 最多4列 */
  gap: 40rpx;
  justify-items: center;
}

.svg-icon {
  width: 60rpx;
  height: 60rpx;
}

/* 可扩展的图标样式 */
.history-icon {
  background: url('data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 12c0-2.5 2-4.5 4.5-4.5h11c2.5 0 4.5 2 4.5 4.5v6c0 2.5-2 4.5-4.5 4.5H12l-6 3v-3z" stroke="%23666" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>') no-repeat center/contain;
}

.write-icon {
  background: url('data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 6l4 4-14 14H8v-4L22 6z" stroke="%23666" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 10l4 4" stroke="%23666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>') no-repeat center/contain;
}

.note-icon {
  background: url('data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 4h16v24l-4-3-4 3-4-3-4 3V4z" stroke="%23666" stroke-width="2" fill="none"/><path d="M12 12h8M12 16h8M12 20h4" stroke="%23666" stroke-width="2" stroke-linecap="round"/></svg>') no-repeat center/contain;
}

.settings-icon {
  background: url('data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 20c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="%23666" stroke-width="2" fill="none"/><path d="M26.83 14.83a2 2 0 0 0 0-2.83l-1.41-1.41a2 2 0 0 1-.59-1.41V8a2 2 0 0 0-2-2h-2.17a2 2 0 0 1-1.41-.59L17.83 4a2 2 0 0 0-2.83 0L13.59 5.41A2 2 0 0 1 12.17 6H10a2 2 0 0 0-2 2v1.17a2 2 0 0 1-.59 1.41L6 12a2 2 0 0 0 0 2.83l1.41 1.41A2 2 0 0 1 8 17.66V19a2 2 0 0 0 2 2h1.17a2 2 0 0 1 1.41.59L14 23a2 2 0 0 0 2.83 0l1.41-1.41A2 2 0 0 1 19.66 21H21a2 2 0 0 0 2-2v-1.17a2 2 0 0 1 .59-1.41L25 15.41z" stroke="%23666" stroke-width="2" fill="none"/></svg>') no-repeat center/contain;
}
</style>