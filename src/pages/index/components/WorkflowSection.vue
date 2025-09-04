<template>
  <!-- 工作流程部分 -->
  <view class="section-view workflow" id="workflow">
    <view class="container">
      <view class="section-title">
        <text class="section-h2">简单高效的工作流程</text>
        <text class="section-p">只需三步，即可获得专业级教学方案</text>
      </view>
      <view class="steps">
        <view class="step">
          <view class="step-number">1</view>
          <text class="step-h3">输入课程信息</text>
          <text class="step-p">提供课程主题、教学目标、学生年级等基本信息</text>
        </view>
        <view class="step">
          <view class="step-number">2</view>
          <text class="step-h3">AI智能生成</text>
          <text class="step-p">我们的AI系统根据您的需求生成个性化教案</text>
        </view>
        <view class="step">
          <view class="step-number">3</view>
          <text class="step-h3">微调与使用</text>
          <text class="step-p">对生成内容进行适当调整，即可用于课堂教学</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
</script>

<style scoped>
/* 基础样式，确保组件独立性 */
.container {
  width: 100%;
  max-width: 2400rpx;
  margin: 0 auto;
  padding: 0 40rpx;
}

.section-view {
  padding: 200rpx 0;
}

.section-title {
  text-align: center;
  margin-bottom: 120rpx;
}

.section-h2 {
  display: block;
  font-size: 80rpx;
  color: #2c3e50;
  margin-bottom: 40rpx;
}

.section-p {
  display: block;
  color: #7f8c8d;
  max-width: 1200rpx;
  margin: 0 auto;
}

/* 工作流程部分 */
.workflow {
  background: linear-gradient(to bottom, #f9fbfd 0%, #ffffff 100%);
}

.steps {
  display: flex;
  justify-content: space-between;
  max-width: 2000rpx;
  margin: 0 auto;
}

.step {
  text-align: center;
  position: relative;
  width: 30%;
}

.step-number {
  width: 100rpx;
  height: 100rpx;
  background: #3498db;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 40rpx;
  font-size: 38rpx;
  font-weight: bold;
}

.step-h3 {
  display: block;
  margin-bottom: 30rpx;
  color: #2c3e50;
}

.step-p {
  display: block;
  color: #7f8c8d;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .steps {
    flex-direction: column;
    align-items: center;
  }
  .step {
    width: 100%;
    margin-bottom: 80rpx;
  }
}
</style>