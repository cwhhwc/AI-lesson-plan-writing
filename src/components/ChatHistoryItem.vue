<!-- src/components/ChatHistoryItem.vue -->
<!-- 会话选项组件 -->

<template>
  <view class="chat-history-item" @tap="handleItemClick">
    <!-- 正常模式 -->
    <view v-if="!isDeleting" class="chat-item-content">
      <!-- 正常模式：显示标题 -->
      <text v-if="!isRenaming" class="chat-item-title">{{ title }}</text>
      <!-- 重命名模式：显示输入框 -->
      <input 
        v-else 
        v-model="editingTitle" 
        class="chat-item-input"
        @blur="handleInputBlur"
        @keyup.enter="handleConfirmRename"
        :focus="isRenaming"
        :auto-focus="true"
      />
    </view>
    <view v-if="!isDeleting" class="chat-item-actions">
      <!-- 正常模式：重命名和删除按钮 -->
      <view v-if="!isRenaming" class="action-icon rename-icon" @tap.stop="handleRename">
        <view class="icon-inner"></view>
      </view>
      <view v-if="!isRenaming" class="action-icon delete-icon" @tap.stop="handleDelete">
        <view class="icon-inner"></view>
      </view>
      
      <!-- 重命名模式：确认和取消按钮 -->
      <view v-if="isRenaming" class="action-icon confirm-icon" @tap.stop="handleConfirmRename">
        <view class="icon-inner"></view>
      </view>
      <view v-if="isRenaming" class="action-icon cancel-icon" @tap.stop="handleCancelRename">
        <view class="icon-inner"></view>
      </view>
    </view>
    
    <!-- 删除模式 -->
    <view v-if="isDeleting" class="delete-mode-container">
      <view class="delete-confirm" @tap.stop="handleConfirmDelete">
        <text class="delete-text">确认删除</text>
      </view>
      <view class="delete-cancel" @tap.stop="handleCancelDelete">
        <text class="cancel-text">取消</text>
      </view>
    </view>
    
    <!-- 删除模式遮罩层 -->
    <view v-if="isDeleting" class="delete-overlay" @tap.stop="handleCancelDelete"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import chatStorageAPI from '@/utils/chatStorageService.js';

// 定义props
const props = defineProps({
  title: {
    type: String,
    default: '会话标题'
  },
  sessionId: {
    type: String,
    default: ''
  }
});

// 定义emit事件
const emit = defineEmits(['select-chat', 'chat-renamed', 'chat-deleted']);

// 状态管理
const isRenaming = ref(false);
const editingTitle = ref('');
const isDeleting = ref(false);

const handleItemClick = () => {
  // 如果正在重命名或删除，不触发选择事件
  if (isRenaming.value || isDeleting.value) return;
  
  // 向父组件传递session_id
  emit('select-chat', props.sessionId);
};

const handleRename = () => {
  isRenaming.value = true;
  editingTitle.value = props.title;
};

const handleConfirmRename = async () => {
  // 验证输入
  if (!editingTitle.value.trim()) {
    uni.showToast({
      title: '会话名称不能为空',
      icon: 'none'
    });
    return;
  }

  // 如果名称没有变化，直接退出重命名模式
  if (editingTitle.value.trim() === props.title) {
    isRenaming.value = false;
    editingTitle.value = '';
    return;
  }

  try {
    // 获取当前用户ID
    const userId = chatStorageAPI._getUserIdFromToken();
    if (!userId) {
      uni.showToast({
        title: '用户未登录',
        icon: 'none'
      });
      return;
    }

    // 保存新名称，避免在清空editingTitle后丢失
    const newName = editingTitle.value.trim();
    
    // 调用API更新数据库中的会话名称
    const result = await chatStorageAPI.updateChatName(userId, props.sessionId, newName);
    
    if (result.success) {
      // 更新成功，退出重命名模式
      isRenaming.value = false;
      editingTitle.value = '';
      
      // 触发重命名事件，通知父组件更新UI
      emit('chat-renamed', {
        sessionId: props.sessionId,
        newName: newName,
        oldName: props.title
      });
      
      uni.showToast({
        title: '重命名成功',
        icon: 'success'
      });
      
    } else {
      // 更新失败
      uni.showToast({
        title: result.error || '重命名失败',
        icon: 'none'
      });
      console.error('重命名失败:', result.error);
    }
  } catch (error) {
    console.error('重命名异常:', error);
    uni.showToast({
      title: '重命名失败',
      icon: 'none'
    });
  }
};

const handleCancelRename = () => {
  isRenaming.value = false;
  editingTitle.value = '';
};
const handleInputBlur = () => {
  // 添加小延迟，避免与点击事件冲突
  setTimeout(() => {
    // 如果已经退出重命名模式，不再处理
    if (!isRenaming.value) return;
    
    const trimmedValue = editingTitle.value.trim();
    
    if (trimmedValue && trimmedValue !== props.title) {
      // 有输入内容且与原名不同，确认重命名
      handleConfirmRename();
    } else {
      // 没有输入内容或名称相同，取消重命名
      handleCancelRename();
    }
  }, 100);
};

const handleDelete = () => {
  isDeleting.value = true;
};

const handleConfirmDelete = async () => {
  try {
    // 获取当前用户ID
    const userId = chatStorageAPI._getUserIdFromToken();
    if (!userId) {
      uni.showToast({
        title: '用户未登录',
        icon: 'none'
      });
      return;
    }

    // 调用API删除会话
    const result = await chatStorageAPI.deleteChat(userId, props.sessionId);
    
    if (result.success) {
      // 删除成功，退出删除模式
      isDeleting.value = false;
      
      // 触发删除事件，通知父组件更新UI
      emit('chat-deleted', {
        sessionId: props.sessionId,
        title: props.title
      });
      
      uni.showToast({
        title: '删除成功',
        icon: 'success',
        duration: 2000
      });
      
      console.log('删除会话成功:', props.sessionId);
    } else {
      // 删除失败
      uni.showToast({
        title: result.error || '删除失败',
        icon: 'none',
        duration: 2000
      });
      console.error('删除会话失败:', result.error);
      isDeleting.value = false;
    }
  } catch (error) {
    console.error('删除会话异常:', error);
    uni.showToast({
      title: '删除失败',
      icon: 'none',
      duration: 2000
    });
    isDeleting.value = false;
  }
};

const handleCancelDelete = () => {
  isDeleting.value = false;
  console.log('取消删除');
};
</script>

<style scoped>
.chat-history-item {
  height: 5vh; /* 屏幕高度的十分之一 */
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s ease;
  cursor: pointer;
  position: relative;
}

.chat-history-item:active {
  background: #f8f9fa;
}

.chat-item-content {
  flex: 1;
}

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

.chat-item-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
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
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 12rpx;
  overflow: hidden;
  z-index: 999;
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

.delete-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}

.cancel-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}

/* 删除模式遮罩层 */
.delete-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 997;
}
</style> 