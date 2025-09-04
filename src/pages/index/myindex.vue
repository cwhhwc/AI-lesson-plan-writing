<template>
  <view class="page-wrapper">
    <!-- 导航栏 -->
    <LandingNav @navigate-to="handleNavigate" @start-experience="handleStartExperience" />

    <!-- 开幕大屏 -->
    <HeroSection id="hero" @start-experience="handleStartExperience" @learn-more="handleLearnMore" />

    <!-- 为什么选择我们 -->
    <ComparisonSection id="advantages" />
    <!-- 功能部分 -->
    <FeaturesSection id="features" />

    <!-- 工作流程部分 -->
    <WorkflowSection id="workflow" />

    <!-- CTA部分 -->
    <CtaSection @start-experience="handleStartExperience" />

    <!-- 页脚 -->
    <FooterSection />
  </view>
</template>

<script setup>
import ComparisonSection from '../../components/ComparisonSection.vue';
import LandingNav from './components/LandingNav.vue';
import HeroSection from './components/HeroSection.vue';
import FeaturesSection from './components/FeaturesSection.vue';
import WorkflowSection from './components/WorkflowSection.vue';
import CtaSection from './components/CtaSection.vue';
import FooterSection from './components/FooterSection.vue';

// 处理页面内导航
function handleNavigate(sectionId) {
  uni.pageScrollTo({
    selector: `#${sectionId}`,
    duration: 300
  });
}

// 处理“了解更多”事件，滚动到“产品优势”部分
function handleLearnMore() {
  uni.pageScrollTo({
    selector: '#advantages',
    duration: 300
  });
}

// 处理开始体验事件
function handleStartExperience() {
  // 在这里编写你的业务逻辑，例如检查登录状态
  // const authStore = useAuthStore();
  // if (authStore.isLoggedIn) {
  //   uni.navigateTo({ url: '/pages/chat/chat' });
  // } else {
  //   uni.navigateTo({ url: '/pages/login/login' });
  // }
  console.log('跳转到登录或聊天页面');
  uni.navigateTo({ url: '/pages/login/login' });
}
</script>

<style scoped>
/* 基础样式设置 */
.page-wrapper {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
  line-height: 1.6;
  background-color: #f9fbfd;
  box-sizing: border-box;
}

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




.section-view {
  padding: 200rpx 0;
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



/* 工作流程部分 (已提取到组件) */

/* CTA部分 (已提取到组件) */

/* 页脚 (已提取到组件) */


/* 响应式调整 */


@media (max-width: 768px) {
  .nav-links {
    display: none; /* 在小屏幕上可以先隐藏，后续可改为汉堡菜单 */
  }
}
</style>
