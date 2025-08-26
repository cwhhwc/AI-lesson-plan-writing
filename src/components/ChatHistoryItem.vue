<!-- src/components/ChatHistoryItem.vue -->
<!-- 封装了会话列表项所有交互逻辑的特定组件 -->
<template>
  <view class="chat-history-item-wrapper">
    <ReusableItem :item="item" @select-item="$emit('select-item', item)">
      <!-- 定义内容区域的具体实现 -->
      <template #content>
        <!-- 重命名模式：显示输入框 -->
        <input 
          v-if="isRenaming" 
          v-model="editingTitle" 
          class="chat-item-input"
          @blur="handleInputBlur"
          @keyup.enter="handleConfirmRename"
          :focus="isRenaming"
          :auto-focus="true"
          @tap.stop
        />
        <!-- 正常模式：显示标题 -->
        <text v-else class="chat-item-title">{{ item.name }}</text>
      </template>

      <!-- 定义操作区域的具体实现 -->
      <template #actions>
        <!-- 重命名模式：确认和取消按钮 -->
        <template v-if="isRenaming">
          <view class="action-icon confirm-icon" @tap.stop="handleConfirmRename">
            <view class="icon-inner"></view>
          </view>
          <view class="action-icon cancel-icon" @tap.stop="handleCancelRename">
            <view class="icon-inner"></view>
          </view>
        </template>
        <!-- 正常模式：重命名和删除按钮 -->
        <template v-else>
          <view class="action-icon rename-icon" @tap.stop="handleRename">
            <view class="icon-inner"></view>
          </view>
          <view class="action-icon delete-icon" @tap.stop="handleDelete">
            <view class="icon-inner"></view>
          </view>
        </template>
      </template>
    </ReusableItem>
    
    <!-- 删除确认UI，现在相对于wrapper绝对定位 -->
    <view v-if="isDeleting" class="delete-mode-container" @tap.stop>
        <view class="delete-confirm" @tap.stop="handleConfirmDelete">
          <text class="delete-text">确认删除</text>
        </view>
        <view class="delete-cancel" @tap.stop="handleCancelDelete">
          <text class="cancel-text">取消</text>
        </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import ReusableItem from './ReusableItem.vue';

// 定义props，接收来自父组件的item数据
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

// 定义emit事件，与旧版 ReusableItem 保持一致
const emit = defineEmits(['select-item', 'rename-item', 'delete-item']);

// 状态管理：所有交互状态都封装在本组件内
const isRenaming = ref(false);
const editingTitle = ref('');
const isDeleting = ref(false);

const handleRename = () => {
  isRenaming.value = true;
  editingTitle.value = props.item.name;
};

const handleConfirmRename = () => {
  if (!editingTitle.value.trim()) {
    uni.showToast({ title: '名称不能为空', icon: 'none' });
    return;
  }
  if (editingTitle.value.trim() === props.item.name) {
    isRenaming.value = false;
    editingTitle.value = '';
    return;
  }
  emit('rename-item', { item: props.item, newName: editingTitle.value.trim() });
  isRenaming.value = false;
  editingTitle.value = '';
};

const handleCancelRename = () => {
  isRenaming.value = false;
  editingTitle.value = '';
};

const handleInputBlur = () => {
  setTimeout(() => {
    if (!isRenaming.value) return;
    const trimmedValue = editingTitle.value.trim();
    if (trimmedValue && trimmedValue !== props.item.name) {
      handleConfirmRename();
    } else {
      handleCancelRename();
    }
  }, 100);
};

const handleDelete = () => {
  isDeleting.value = true;
};

const handleConfirmDelete = () => {
  emit('delete-item', props.item);
  isDeleting.value = false;
};

const handleCancelDelete = () => {
  isDeleting.value = false;
  console.log('取消删除');
};
</script>

<style scoped>
.chat-history-item-wrapper {
  position: relative;
}

/* 这里包含了所有旧版 ReusableItem 的样式，保证外观不变 */
.chat-item-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  line-height: 5vh;
}

.chat-item-input {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  line-height: 5vh;
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  padding: 0;
  margin: 0;
}

.action-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 20rpx;
}

.rename-icon {
  background: #f5f5f5;
  transition: background-color 0.2s ease;
}

.rename-icon:active {
  background: #e0e0e0;
}

.delete-icon {
  background: #fff5f5;
  transition: background-color 0.2s ease;
}

.delete-icon:active {
  background: #ffe0e0;
}

.confirm-icon {
  background: #f0fff0;
  transition: background-color 0.2s ease;
}

.confirm-icon:active {
  background: #e0ffe0;
}

.cancel-icon {
  background: #fff5f5;
  transition: background-color 0.2s ease;
}

.cancel-icon:active {
  background: #ffe0e0;
}

.icon-inner {
  width: 35rpx;
  height: 35rpx;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.rename-icon .icon-inner {
  background: url('data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 6l4 4-14 14H8v-4L22 6z" stroke="%23666" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 10l4 4" stroke="%23666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 28h19" stroke="%23666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>') no-repeat center/contain;
}

.delete-icon .icon-inner {
  background: url('data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 8v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M6 8h20M12 4h8a2 2 0 0 1 2 2v2H10V6a2 2 0 0 1 2-2z" stroke="%23ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 9v15M19 9v15" stroke="%23ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>') no-repeat center/contain;
}

.confirm-icon .icon-inner {
  background: url('data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 16l6 6 12-12" stroke="%2322c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>') no-repeat center/contain;
}

.cancel-icon .icon-inner {
  background: url('data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="%23ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>') no-repeat center/contain;
}

/* 删除模式样式 */
.delete-mode-container {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12rpx; /* 匹配 ReusableItem 的圆角 */
  overflow: hidden;
  z-index: 2; /* 确保覆盖在 ReusableItem 内容之上 */
}

.delete-confirm {
  flex: 1;
  background: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.delete-confirm:active {
  background: #dc2626;
}

.delete-cancel {
  flex: 1;
  background: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.delete-cancel:active {
  background: #16a34a;
}

.delete-text, .cancel-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}
</style>