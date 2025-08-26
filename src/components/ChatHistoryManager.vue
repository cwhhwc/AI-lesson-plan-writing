<!-- src/components/ChatHistoryManager.vue -->
<template>
  <ReusablePanel
    title="会话列表"
    :items="chatHistoryStore.getChatList"
    :is-loading="chatHistoryStore.getIsLoading"
    @close="handleClose"
  >
    <!-- 使用默认插槽来渲染列表内容 -->
    <template #default>
      <ChatHistoryItem
        v-for="item in chatHistoryStore.getChatList"
        :key="item.id"
        :item="item"
        @select-item="handleSelectItem"
        @rename-item="handleRenameItem"
        @delete-item="handleDeleteItem"
      />
    </template>
  </ReusablePanel>
</template>

<script setup>
import { onMounted } from 'vue';
import { useChatHistoryStore } from '@/stores/chatHistory.js';
import ReusablePanel from '@/components/ReusablePanel.vue';
import ChatHistoryItem from '@/components/ChatHistoryItem.vue';

// 定义本组件要发出的事件
const emit = defineEmits(['select-chat', 'rename-chat', 'delete-chat', 'close']);

// 聊天历史store
const chatHistoryStore = useChatHistoryStore();

// 处理项目选择，将事件和数据向上抛出
const handleSelectItem = (item) => {
  emit('select-chat', item);
};

// 处理项目重命名，将事件和数据向上抛出
const handleRenameItem = (renameData) => {
  emit('rename-chat', renameData);
};

// 处理项目删除，将事件和数据向上抛出
const handleDeleteItem = (item) => {
  emit('delete-chat', item);
};

// 处理关闭事件
const handleClose = () => {
  emit('close');
};

// 组件挂载后初始化会话列表
onMounted(() => {
  chatHistoryStore.initializeChatList();
});
</script>