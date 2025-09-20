<!-- 输入选项面板 -->
<script setup>
import { computed } from 'vue';
import IconOption from './IconOption.vue';

const props = defineProps({
  isWriteMode: {
    type: Boolean,
    default: false
  }
});

// 根据isWriteMode动态生成选项
const options = computed(() => [
  {
    id: 'history',
    text: '聊天记录',
    iconClass: 'history-icon'
  },
  {
    id: 'toggle-write-mode',
    text: props.isWriteMode ? '聊天模式' : '写教案',
    iconClass: 'write-icon'
  },
  {
    id: 'files',
    text: '我的文件',
    iconClass: 'file-icon'
  },
  {
    id: 'balance',
    text: '我的余额',
    iconClass: 'balance-icon'
  },
  {
    id: 'logout',
    text: '登出',
    iconClass: 'logout-icon'
  }
]);

const emit = defineEmits(['option-click', 'click']);

const handleOptionClick = (option, index) => {
  // 直接将带有唯一id的完整option对象发射出去
  emit('option-click', option, index);
};

// 处理面板点击事件
const handlePanelClick = (e) => {
  emit('click', e);
};
</script>

<template>
  <view class="input-options-panel" @click="handlePanelClick">
    <view class="options-container" >
      <IconOption
        v-for="(option, index) in options" 
        :key="index"
        :text="option.text"
        @click.stop="handleOptionClick(option, index)"
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

.file-icon {
  background: url('data:image/svg+xml;utf8,<svg t="1756024347460" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1783" width="32" height="32"><path d="M300.8 202.666667l-12.8 64h-42.666667v640h533.333334v-640h-42.666667l-12.8-64h119.466667v768h-661.333334v-768h119.466667zM554.666667 640v64H320v-64h234.666667z m149.333333-170.666667v64H320v-64h384zM512 53.333333A96 96 0 0 1 608 149.333333v10.666667h58.24l34.133333 170.666667H323.626667l34.133333-170.666667h58.24V149.333333A96 96 0 0 1 512 53.333333z m0 64A32 32 0 0 0 480 149.333333v74.666667h-69.76l-8.533333 42.666667h220.586666l-8.533333-42.666667H544V149.333333A32 32 0 0 0 512 117.333333z" fill="black" p-id="1784"></path></svg>') no-repeat center/contain;
}

.logout-icon {
  background: url('data:image/svg+xml;utf8,<svg t="1756822516598" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2393" width="32" height="32"><path d="M952.7 492.1c-1.4-1.8-3.1-3.4-4.8-4.9l-179-178.9c-12.5-12.5-32.9-12.5-45.4 0s-12.5 32.9 0 45.4l126 126H421.3h-0.1c-18.2 0-32.9 14.8-32.9 33s14.7 33 32.9 33c0.3 0.1 0.5 0 0.7 0h427.8l-126 126c-12.3 12.3-12.3 32.4 0 44.7l0.7 0.7c12.3 12.3 32.4 12.3 44.7 0l182-182c11.7-11.7 12.3-30.6 1.6-43z" fill="%23515151" p-id="2394"></path><path d="M562.3 799c-18 0-32.7 14.7-32.7 32.7v63.8H129.2V128.7h400.4v63.1c0 18 14.7 32.7 32.7 32.7s32.7-14.7 32.7-32.7V96.3c0-3.5-0.6-6.8-1.6-10-4.2-13.3-16.6-23-31.2-23H96.6c-18 0-32.7 14.7-32.7 32.7v831.9c0 14.2 9.2 26.3 21.8 30.8 3.6 1.4 7.5 2.1 11.5 2.1h463.2c0.6 0 1.3 0.1 1.9 0.1 18 0 32.7-14.7 32.7-32.7v-96.5c0-18-14.7-32.7-32.7-32.7z" fill="%23515151" p-id="2395"></path><path d="M256.8 512.7a32.9 33 0 1 0 65.8 0 32.9 33 0 1 0-65.8 0Z" fill="%23515151" p-id="2396"></path></svg>') no-repeat center/contain;
}

.balance-icon {
  background: url('data:image/svg+xml;utf8,<svg t="1758270386828" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3321" width="32" height="32"><path d="M983.8 312.7C958 251.7 921 197 874 150c-47-47-101.8-83.9-162.7-109.7C648.2 13.5 581.1 0 512 0S375.8 13.5 312.7 40.2C251.7 66 197 102.9 150 150c-47 47-83.9 101.8-109.7 162.7C13.5 375.8 0 442.9 0 512s13.5 136.2 40.2 199.3C66 772.3 102.9 827 150 874c47 47 101.8 83.9 162.7 109.7 63.1 26.7 130.2 40.2 199.3 40.2s136.2-13.5 199.3-40.2C772.3 958 827 921 874 874c47-47 83.9-101.8 109.7-162.7 26.7-63.1 40.2-130.2 40.2-199.3s-13.4-136.2-40.1-199.3z m-55.3 375.2c-22.8 53.8-55.4 102.2-96.9 143.7s-89.9 74.1-143.7 96.9C632.2 952.1 573 964 512 964s-120.2-11.9-175.9-35.5c-53.8-22.8-102.2-55.4-143.7-96.9s-74.1-89.9-96.9-143.7C71.9 632.2 60 573 60 512s11.9-120.2 35.5-175.9c22.8-53.8 55.4-102.2 96.9-143.7s89.9-74.1 143.7-96.9C391.8 71.9 451 60 512 60s120.2 11.9 175.9 35.5c53.8 22.8 102.2 55.4 143.7 96.9s74.1 89.9 96.9 143.7C952.1 391.8 964 451 964 512s-11.9 120.2-35.5 175.9z" fill="%232c2c2c" p-id="3322"></path><path d="M706 469.1H574.7l84.2-180.6c7-15 0.4-32.9-14.5-39.9-15-7-32.9-0.4-39.9 14.5L512 461.5l-92.5-198.3c-7-15-24.9-21.5-39.9-14.5s-21.5 24.9-14.5 39.9l84.2 180.6H318c-16.5 0-30 13.5-30 30s13.5 30 30 30h164v64h-92.5c-20.6 0-37.5 13.5-37.5 30s16.9 30 37.5 30H482v95c0 16.5 13.5 30 30 30s30-13.5 30-30v-95h92.5c20.6 0 37.5-13.5 37.5-30s-16.9-30-37.5-30H542v-64h164c16.5 0 30-13.5 30-30 0-16.6-13.5-30.1-30-30.1z" fill="%232c2c2c" p-id="3323"></path></svg>') no-repeat center/contain;
}
</style>