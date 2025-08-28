<!-- src/components/FileManager.vue -->
<template>
  <ReusablePanel
    title="文件列表"
    :items="fileStore.files"
    :is-loading="fileStore.isLoading"
    @close="handleClose"
  >
    <template #default>
      <FileItem
        v-for="item in fileStore.files"
        :key="item.id"
        :item="item"
        @share-item="handleShareItem"
      />
    </template>
  </ReusablePanel>
</template>

<script setup>
import { onMounted } from 'vue';
import { useFileStore } from '@/stores/fileStore.js';
import ReusablePanel from '@/components/ReusablePanel.vue';
import FileItem from '@/components/FileItem.vue';

// 定义本组件要发出的事件
const emit = defineEmits(['share-file', 'close']);

const fileStore = useFileStore();

// --- 事件处理 ---
// 将子组件的事件冒泡向上传递

const handleShareItem = (item) => {
  emit('share-file', item);
};

const handleClose = () => {
  emit('close');
};

// --- 生命周期钩子 ---
onMounted(() => {
  // 组件挂载时获取文件列表
  fileStore.fetchFiles();
});
</script>

<style scoped>
/* 管理器组件通常不需要自己的样式 */
</style>