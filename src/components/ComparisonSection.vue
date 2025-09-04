<template>
  <!-- 为什么选择我们 -->
  <view class="section-view comparison-section">
    <view class="container">
      <view class="section-title">
        <text class="section-h2">为什么选择 折纸AI？</text>
        <text class="section-p">专为教学而生，我们更懂你</text>
      </view>
      <view class="comparison-container">
        <!-- 传统备课方式 -->
        <view class="comparison-card traditional-method">
          <text class="card-title">传统备课方式</text>
          <view class="comparison-list">
            <view class="comparison-item">
              <text class="icon">⚠️</text>
              <view class="text-content">
                <text class="item-title">资料搜集耗时</text>
                <text class="item-description">各种资料散落在各个平台，搜集、筛选、整理过程繁琐，耗费大量时间。</text>
              </view>
            </view>
            <view class="comparison-item">
              <text class="icon">⚠️</text>
              <view class="text-content">
                <text class="item-title">组织加工困难</text>
                <text class="item-description">要么花费大量精力自己组织教学方案，要么在各平台翻找模板，格式不一，难以处理。</text>
              </view>
            </view>
            <view class="comparison-item">
              <text class="icon">⚠️</text>
              <view class="text-content">
                <text class="item-title">综合成本高</text>
                <text class="item-description">各大文库、资源平台都有各自的会员体系，需要多处付费，综合成本高昂。</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 通用 AI 工具 -->
        <view class="comparison-card general-ai">
          <text class="card-title">通用 AI 工具</text>
          <view class="comparison-list">
            <view class="comparison-item">
              <text class="icon">⚠️</text>
              <view class="text-content">
                <text class="item-title">缺乏专业知识</text>
                <text class="item-description">内容零散，缺乏教学连贯性，容易偏离教学大纲，不够专业。</text>
              </view>
            </view>
            <view class="comparison-item">
              <text class="icon">⚠️</text>
              <view class="text-content">
                <text class="item-title">使用门槛高</text>
                <text class="item-description">需要反复调试复杂的提示词（Prompt），耗时费力才能得到勉强可用的结果。</text>
              </view>
            </view>
            <view class="comparison-item">
              <text class="icon">⚠️</text>
              <view class="text-content">
                <text class="item-title">月费负担重</text>
                <text class="item-description">免费版限制多、响应慢，专业版动辄上百元月费，持续使用成本高。</text>
              </view>
            </view>
          </view>
        </view>

        <!-- EduAI 专业备课 -->
        <view class="comparison-card edu-ai">
          <text class="card-title">折纸AI 专业备课</text>
          <view class="comparison-list">
            <view class="comparison-item">
              <text class="icon">✅</text>
              <view class="text-content">
                <text class="item-title">专业知识库</text>
                <text class="item-description">内置海量教学知识库和课程标准，严格按单元、课时生成，确保专业性和准确性。</text>
              </view>
            </view>
            <view class="comparison-item">
              <text class="icon">✅</text>
              <view class="text-content">
                <text class="item-title">简单易用</text>
                <text class="item-description">内置针对教学场景优化的提示词模板，只需填写关键信息，一键生成专业教案。</text>
              </view>
            </view>
            <view class="comparison-item">
              <text class="icon">✅</text>
              <view class="text-content">
                <text class="item-title">成本可控</text>
                <text class="item-description">按需使用，用多少充值多少。每节课的备课成本极低，无月费负担。</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
// 这个组件没有特定的逻辑，所以script部分是空的
</script>

<style scoped>
/* 基础样式引用自主页面，这里只写真对本组件的样式 */
.section-view {
  padding: 200rpx 0;
}

.container {
  width: 100%;
  max-width: 2400rpx;
  margin: 0 auto;
  padding: 0 40rpx;
}

.section-title {
  text-align: center;
  margin-bottom: 120rpx;
}

.section-h2 {
  display: block;
  font-size: 80rpx; /* 2.5rem */
  color: #2c3e50;
  margin-bottom: 40rpx;
}

.section-p {
  display: block;
  color: #7f8c8d;
  max-width: 1200rpx;
  margin: 0 auto;
}

/* 为什么选择我们部分 */
.comparison-section {
  background-color: #f9fbfd;
}

.comparison-container {
  display: flex;
  gap: 40rpx; /* 调整间距以适应三栏 */
  align-items: stretch; /* 让卡片等高 */
}

.comparison-card {
  flex: 1;
  background: white;
  padding: 50rpx; /* 调整内边距 */
  border-radius: 20rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.card-title {
  display: block;
  font-size: 40rpx; /* 调整字体大小 */
  font-weight: 600;
  text-align: center;
  margin-bottom: 50rpx;
  color: #2c3e50;
}

.comparison-list {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.comparison-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.icon {
  font-size: 40rpx;
  margin-top: 6rpx;
}

.text-content {
  display: flex;
  flex-direction: column;
}

.item-title {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
  font-size: 30rpx; /* 调整字体大小 */
}

.item-description {
  display: block;
  color: #7f8c8d;
  font-size: 28rpx;
  line-height: 1.6;
}

/* 对比卡片特殊样式 */
.comparison-card.traditional-method,
.comparison-card.general-ai {
  border: 2rpx solid #e0e0e0;
}

.comparison-card.edu-ai {
  background-color: #e6f7ff;
  border: 2rpx solid #3498db;
  box-shadow: 0 15px 30px rgba(52, 152, 219, 0.1);
}

.edu-ai .card-title {
  color: #3498db;
}

/* 响应式调整 */
@media (max-width: 1200px) { /* 增加一个断点以更好处理三栏 */
  .comparison-container {
    flex-direction: column;
  }
}
</style>