<!-- src/components/FileItem.vue -->
<!-- 封装了文件列表项所有交互逻辑的特定组件 -->
<template>
  <view class="file-item-wrapper">
    <ReusableItem :item="item" @select-item="handleItemClick">
      <!-- 内容区域：可以显示文件名和更新时间等 -->
      <template #content>
        <view class="file-item-content">
          <!-- 重命名模式：显示输入框 -->
          <input 
            v-if="isRenaming" 
            v-model="editingTitle" 
            class="file-item-input"
            @blur="handleInputBlur"
            @keyup.enter="handleConfirmRename"
            :focus="isRenaming"
            @tap.stop
          />
          <!-- 正常模式：显示标题 -->
          <text v-else class="file-item-title">{{ item.name }}</text>
        </view>
      </template>

      <!-- 操作区域：定义文件专属的操作按钮 -->
      <template #actions>
        <!-- 重命名模式 -->
        <template v-if="isRenaming">
          <view class="action-icon confirm-icon" @tap.stop="handleConfirmRename">
            <view class="icon-inner"></view>
          </view>
          <view class="action-icon cancel-icon" @tap.stop="handleCancelRename">
            <view class="icon-inner"></view>
          </view>
        </template>
        <!-- 正常模式 -->
        <template v-else>
          <view class="action-icon rename-icon" @tap.stop="handleRename">
            <view class="icon-inner"></view>
          </view>
          <view class="action-icon share-icon" @tap.stop="handleShare">
            <view class="icon-inner"></view>
          </view>
          <view class="action-icon delete-icon" @tap.stop="handleDelete">
            <view class="icon-inner"></view>
          </view>
        </template>
      </template>
    </ReusableItem>

    <!-- 删除确认的UI -->
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
import { useFileStore } from '@/stores/fileStore.js';
import { useNavigation } from '@/composables/useNavigation.js';

// 定义props
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

// 定义emit事件
const emit = defineEmits([]);

// 获取 store 实例
const fileStore = useFileStore();

const { navigateToMarkdownPage } = useNavigation();

// 状态管理
const isDeleting = ref(false);
const isRenaming = ref(false);
const editingTitle = ref('');

// --- 点击处理 ---
const handleItemClick = (item) => {
  navigateToMarkdownPage({ id: item.id });
};

// --- 重命名相关处理 ---
const handleRename = () => {
  isRenaming.value = true;
  editingTitle.value = props.item.name;
};

const handleConfirmRename = async () => {
  const newName = editingTitle.value.trim();
  if (!newName || newName === props.item.name) {
    handleCancelRename();
    return;
  }

  // 调用 store 中的 action 来处理重命名逻辑
  await fileStore.renameFile(props.item.id, newName);
  
  // 完成后关闭输入框
  isRenaming.value = false;
  editingTitle.value = '';
};

const handleCancelRename = () => {
  isRenaming.value = false;
  editingTitle.value = '';
};

const handleInputBlur = () => {
  // 延迟执行以允许确认/取消按钮的点击事件先行触发
  setTimeout(() => {
    if (isRenaming.value) {
      handleConfirmRename();
    }
  }, 200);
};

// --- 其他操作处理 ---
const handleShare = () => {
  emit('share-item', props.item);
  // 请在下方的 '' 中替换为你自己的线上域名或本地开发服务器地址
  const shareUrl = `http://localhost:5173/#/pages/share/share?id=${props.item.id}`;

  uni.shareWithSystem({
    summary: `快来看看我分享的文档：${props.item.name}`,
    href: shareUrl,
    success: () => {
      // 分享成功的回调
    },
    fail: () => {
      // 分享失败的降级处理：复制链接到剪贴板
      uni.setClipboardData({
        data: shareUrl,
        success: () => {
          uni.showToast({
            title: '分享调用失败，链接已复制',
            icon: 'none'
          });
        }
      });
    }
  });
};

const handleDelete = () => {
  isDeleting.value = true;
};

const handleConfirmDelete = () => {
  // 这里也可以调用 store action
  fileStore.deleteFile(props.item.id);
  isDeleting.value = false;
};

const handleCancelDelete = () => {
  isDeleting.value = false;
};
</script>

<style scoped>
.file-item-wrapper {
  position: relative;
}

.file-item-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.file-item-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.file-item-input {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
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
  transition: background-color 0.2s ease;
}

.share-icon {
  background: #f0f5ff;
}
.share-icon:active {
  background: #d9e8ff;
}

.delete-icon {
  background: #fff5f5;
}
.delete-icon:active {
  background: #ffe0e0;
}

.rename-icon {
  background: #f5f5f5;
}
.rename-icon:active {
  background: #e0e0e0;
}

.confirm-icon {
  background: #f0fff0;
}
.confirm-icon:active {
  background: #e0ffe0;
}

.cancel-icon {
  background: #fff5f5;
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

/* 使用SVG作为图标 */
.share-icon .icon-inner {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%232d8cf0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>');
}

.delete-icon .icon-inner {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>');
}

.rename-icon .icon-inner {
  background: url('data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 6l4 4-14 14H8v-4L22 6z" stroke="%23666" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 10l4 4" stroke="%23666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 28h19" stroke="%23666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>') no-repeat center/contain;
}

.confirm-icon .icon-inner {
  background: url('data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 16l6 6 12-12" stroke="%2322c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>') no-repeat center/contain;
}

.cancel-icon .icon-inner {
  background: url('data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="%23ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>') no-repeat center/contain;
}

/* 删除确认框样式 */
.delete-mode-container {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
  overflow: hidden;
  z-index: 2;
}

.delete-confirm {
  flex: 1;
  background: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-cancel {
  flex: 1;
  background: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-text, .cancel-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
}
</style>