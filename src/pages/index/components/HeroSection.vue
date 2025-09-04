<template>
  <view class="hero" id="hero">
    <view class="hero-bg-before"></view>
    <view class="container">
      <view class="hero-content">
        <text class="hero-p">教师一站式智能备课平台</text>
        <text class="hero-h1">把备课交给我们</text>
        <text class="hero-h1 hero-h1-blue">把精力留给课堂</text>
        <text class="hero-p">从强大的 AI 写教案功能开始，迈出高效备课第一步。</text>
        <view class="hero-buttons">
          <view class="btn" @click="emit('start-experience')">立即体验</view>
          <view class="btn btn-outline" @click="emit('learn-more')">了解更多</view>
        </view>
      </view>
    </view>
    <view class="hero-image">
      <!-- 此处应放置一幅展示AI与教育结合的现代风格插图 -->
      <!-- 图片建议：抽象化的教师与AI互动的场景，使用淡蓝色调 -->
    </view>
  </view>
</template>

<script setup>
const emit = defineEmits(['start-experience', 'learn-more']);
</script>

<style scoped>
/* 继承自父组件的 .container 和 .btn 样式 */
.container {
  width: 100%;
  max-width: 2400rpx;
  margin: 0 auto;
  padding: 0 40rpx;
}

.btn {
  display: inline-block;
  padding: 24rpx 60rpx;
  background-color: #3498db;
  color: white;
  border-radius: 60rpx;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}
.btn text {
  color: white;
}

.btn:hover {
  background-color: #2980b9;
  transform: translateY(-4rpx);
  box-shadow: 0 10rpx 30rpx rgba(52, 152, 219, 0.3);
}

.btn-outline {
  background: transparent;
  border: 4rpx solid #3498db;
  color: #3498db;
}
.btn-outline text {
  color: #3498db;
}

.btn-outline:hover {
  background: #3498db;
  color: white;
}
.btn-outline:hover text {
  color: white;
}


/* 开幕大屏样式 */
.hero {
  height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%);
  position: relative;
  overflow: hidden;
}

.hero-bg-before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(52, 152, 219, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200rpx;
}

.hero-h1 {
  display: block;
  font-size: 112rpx; /* 3.5rem */
  margin-bottom: 40rpx;
  color: #2c3e50;
  line-height: 1.2;
  letter-spacing: 8rpx;
}

.hero-h1-blue {
  color: #3498db;
  font-weight: 700;
  font-size: 112rpx; 
}

.hero-p {
  display: block;
  font-size: 38rpx; /* 1.2rem */
  margin-bottom: 60rpx;
  color: #7f8c8d;
}

.hero-buttons {
  display: flex;
  gap: 30rpx;
}

.hero-image {
  position: absolute;
  right: 0;
  bottom: -140rpx;
  width: 70%;
  height: 100%;
  /* 此处放置AI与教育相关的抽象插图 */
  background: url('/static/teacherAndAI.png') no-repeat center right;
  background-size: contain;
  z-index: 1;
  opacity: 0.7;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .hero-h1 {
    font-size: 88rpx; /* 2.8rem */
  }
  .hero-image {
    width: 40%;
  }
}

@media (max-width: 768px) {
  .hero {
    text-align: center;
  }
  .hero-content {
    margin: 0 auto;
  }
  .hero-buttons {
    justify-content: center;
  }
  .hero-image {
    display: none;
  }
}
</style>