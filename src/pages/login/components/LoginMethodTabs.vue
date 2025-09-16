<template>
  <view class="login-tabs">
    <view
      class="tab-item"
      :class="{ active: activeTab === 'password' }"
      @click="selectTab('password')"
    >
      密码登录
    </view>
    <view
      class="tab-item"
      :class="{ active: activeTab === 'phone' }"
      @click="selectTab('phone')"
    >
      手机登录
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  activeTab: {
    type: String,
    default: 'password', // Default to password login
  },
});

const emit = defineEmits(['update:activeTab']);

function selectTab(tab) {
  // 允许切换到任何tab，因为现在手机登录也已启用
  emit('update:activeTab', tab);
}
</script>

<style scoped>
.login-tabs {
  display: flex;
  width: 100%;
  margin-bottom: 40rpx; /* Space below tabs */
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1; /* 即使只有一个tab，也占据全部宽度 */
  padding: 20rpx 0;
  text-align: center;
  font-size: 32rpx;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: color 0.3s ease;
}

.tab-item.active {
  color: #007aff; /* Active tab color */
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1rpx; /* Align with border-bottom */
  left: 50%;
  transform: translateX(-50%);
  width: 80rpx; /* Underline width */
  height: 6rpx; /* Underline thickness */
  background-color: #007aff; /* Underline color */
  border-radius: 3rpx;
}

.tab-item:hover {
  color: #007aff;
}
</style>
