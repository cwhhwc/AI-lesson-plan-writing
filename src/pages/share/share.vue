<!-- D:\html&css\my-first-cursor\myFirstApp\src\pages\share\share.vue -->
<template>
  <view class="share-page-container">
    <view v-if="isLoading" class="loading-state">
      <text>内容加载中...</text>
    </view>
    <view v-else-if="error" class="error-state">
      <text>{{ error }}</text>
    </view>
    <view v-else-if="file" class="content-display">
      <h1 class="title">{{ file.title }}</h1>
      <!-- rich-text 组件用于在 uni-app 中渲染 HTML 内容 -->
      <rich-text :nodes="renderedContent"></rich-text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { getDocumentByIdApi } from '@/api.js';
import { renderMarkdown } from '@/utils/renderMarkdown.js';

const file = ref(null);
const renderedContent = ref('');
const isLoading = ref(true);
const error = ref('');

let fileId = null;

// 1. 页面加载时，获取URL参数并加载内容
onLoad(async (options) => {
  fileId = options.id;
  if (!fileId) {
    error.value = '无效的分享链接，缺少文件ID。';
    isLoading.value = false;
    return;
  }

  try {
    const fetchedFile = await getDocumentByIdApi(fileId);
    if (fetchedFile && fetchedFile.id) {
      file.value = fetchedFile;
      // 使用 renderMarkdown 工具函数将内容转换为 HTML
      renderedContent.value = renderMarkdown(fetchedFile.content || '');
    } else {
      error.value = '找不到对应的文件内容，或者该分享已失效。';
    }
  } catch (e) {
    console.error('加载文件失败:', e);
    error.value = '加载文件失败，请稍后重试。';
  } finally {
    isLoading.value = false;
  }
});

// 2. 为小程序、App和H5的被动分享准备数据
// 即使用户从这个分享页再次发起分享，也能正确携带信息
onShareAppMessage(() => {
  if (!file.value) return null;
  return {
    title: `分享文档：${file.value.title}`,
    path: `/pages/share/share?id=${fileId}`,
    // imageUrl: '/static/logo.png' // 可选，自定义分享卡片图片
  };
});

onShareTimeline(() => {
  if (!file.value) return null;
  return {
    title: `分享文档：${file.value.title}`,
    query: `id=${fileId}`,
    // imageUrl: '/static/logo.png' // 可选
  };
});
</script>

<style scoped>
.share-page-container {
  padding: 30rpx;
  background-color: #fff;
  min-height: 100vh;
}
.loading-state, .error-state {
  text-align: center;
  color: #999;
  padding-top: 100rpx;
}
.title {
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  border-bottom: 1px solid #eee;
  padding-bottom: 20rpx;
  color: #333;
}
/* 确保 rich-text 里的内容样式正确 */
:deep(p) {
    margin-bottom: 1em;
}
:deep(h2) {
    font-size: 1.5em;
    margin-top: 1em;
    margin-bottom: 0.5em;
}
</style>
