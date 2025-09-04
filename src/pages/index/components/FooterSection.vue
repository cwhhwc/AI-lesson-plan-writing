<template>
  <!-- 页脚 -->
  <view class="footer">
    <view class="container">
      <view class="footer-content">
        <view class="footer-column">
          <text class="footer-h3">折纸 AI</text>
          <text class="footer-p">赋能教育，助力教师</text>
        </view>
        <view class="footer-column">
          <text class="footer-h3">产品</text>
          <view class="footer-links">
            <view><text>AI写教案</text></view>
            <view><text>AI制作教学PPT(即将推出)</text></view>
            <view><text>智能搜集教学资料(即将推出)</text></view>
          </view>
        </view>
        <view class="footer-column">
          <text class="footer-h3">资源</text>
          <view class="footer-links">
            <view><text>使用流程</text></view>
            <view><text>教学案例</text></view>
            <view><text>帮助中心</text></view>
          </view>
        </view>
        <view class="footer-column">
          <text class="footer-h3">联系我们</text>
          <view class="footer-links">
            <view><text>支持邮箱</text></view>
            <view><text>反馈建议</text></view>
            <view><text>加入我们</text></view>
          </view>
        </view>
      </view>
      <view class="copyright">
        <text>© 2023 EduAI教师备课平台. 保留所有权利.</text>
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

/* 页脚 */
.footer {
  background: #2c3e50;
  color: white;
  padding: 120rpx 0 60rpx;
}
.footer text {
  color: #ecf0f1;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 80rpx;
}

.footer-column {
  flex: 1;
  min-width: 400rpx;
  margin-bottom: 60rpx;
}

.footer-h3 {
  display: block;
  margin-bottom: 40rpx;
  font-size: 38rpx; /* 1.2rem */
  color: white;
}

.footer-links view {
  margin-bottom: 20rpx;
}

.footer-links text:hover {
  color: #3498db;
}

.copyright {
  text-align: center;
  padding-top: 60rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}
.copyright text {
  color: #bdc3c7;
  font-size: 29rpx; /* 0.9rem */
}

/* footer-p is used in template but not styled, adding a default style */
.footer-p {
  color: #bdc3c7;
}
</style>
