<template>
  <view class="login-container">
    <!-- 1. 创建一个白色面板作为视觉主体 -->
    <view class="login-panel">
      <!-- 2. 左侧宣传栏 -->
      <view class="showcase-section">
        <view class="showcase-content">
          <image src="/static/mylogo.svg" class="showcase-logo" mode="aspectFit" />
          <view class="showcase-title">折纸AI</view>
          <view class="showcase-subtitle">专为教师打造的智能备课平台</view>
        </view>
      </view>

      <!-- 3. 右侧表单栏 -->
      <view class="form-section">
        <view class="form-content">
          <view class="login-title">欢迎回来</view>
          <LoginMethodTabs v-model:activeTab="activeTab" />
          <PasswordLoginForm
            v-if="activeTab === 'password'"
            v-model:username="username"
            v-model:password="password"
            v-model:rememberMe="rememberMe"
            :usernameError="usernameError"
            :passwordError="passwordError"
            :usernameErrorMsg="usernameErrorMsg"
            :isLoading="isLoading"
            @login="onLogin"
            @forgot-password="onForgot"
            @register="onRegister"
            @username-input="onUsernameInput"
            @password-input="onPasswordInput"
          />
          <view v-if="activeTab === 'phone'" class="phone-login-placeholder">
            手机登录功能待实现
          </view>
          <BaseButton @click="onLogin" :loading="isLoading">登 录</BaseButton>
          
          
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import BaseButton from '@/components/BaseButton.vue';
import { useAuthStore } from '@/stores/auth.js';
import PasswordLoginForm from './components/PasswordLoginForm.vue';
import LoginMethodTabs from './components/LoginMethodTabs.vue';

const activeTab = ref('password');

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const usernameError = ref(false);
const passwordError = ref(false);
const usernameErrorMsg = ref('');
const isLoading = ref(false);

const authStore = useAuthStore();

async function onLogin() {
  if (isLoading.value) return;
  usernameError.value = !username.value.trim();
  passwordError.value = !password.value.trim();
  usernameErrorMsg.value = '';
  if (usernameError.value || passwordError.value) {
    return;
  }
  isLoading.value = true;
  try {
    await authStore.login({
      username: username.value,
      password: password.value,
    });
    uni.showToast({ title: '登录成功', icon: 'success' });
    uni.reLaunch({ url: '/pages/chat/chat' });
  } catch (error) {
    console.error(error);
    usernameErrorMsg.value = error.message || '登录失败，请重试';
  } finally {
    isLoading.value = false;
  }
}

function onUsernameInput() {
  if (username.value.trim() && usernameError.value) usernameError.value = false;
  if (usernameErrorMsg.value) usernameErrorMsg.value = '';
}

function onPasswordInput() {
  if (password.value.trim() && passwordError.value) passwordError.value = false;
}

function onForgot() {
  uni.showToast({ title: '请联系管理员', icon: 'none' });
}

function onRegister() {
  uni.navigateTo({ url: '/pages/register/register' });
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.login-panel {
  width: 80%;
  max-width: 1600rpx;
  min-height: 80vh;
  max-height: 90vh;
  background-color: white;
  border-radius: 20rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
  display: flex;
  overflow: hidden; /* 确保子元素的圆角生效 */
}

.showcase-section {
  flex: 1;
  background: linear-gradient(135deg, #3498db, #2980b9); /* 蓝色渐变背景 */
  display: flex;
  flex-direction: column; /* 内容垂直居中 */
  align-items: center;
  justify-content: center;
  padding: 60rpx;
  text-align: center;
  color: white; /* 确保文字颜色为白色 */
}

.showcase-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 430rpx; /* 限制内容宽度 */
}

.showcase-logo {
  width: 160rpx; /* 调整Logo大小 */
  height: 160rpx;
  margin-bottom: 40rpx;
}

.showcase-title {
  font-size: 48rpx; /* 标题字体大小 */
  font-weight: bold;
  margin-bottom: 20rpx;
}

.showcase-subtitle {
  font-size: 32rpx; /* 副标题字体大小 */
  line-height: 1.5;
  opacity: 0.9;
}

.form-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
  box-sizing: border-box;
}

.form-content {
  width: 100%;
  max-width: 600rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-image {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 40rpx;
}

.login-title {
  font-size: 44rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 60rpx;
  text-align: center;
}

.phone-login-placeholder {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
  font-size: 32rpx;
  width: 100%;
}


.login-form {
  /* This was the container for the form, now it's just a conceptual grouping */
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 40rpx; /* This gap will apply between PasswordLoginForm, BaseButton, and register-link */
}

:deep(.base-button) {
  background-color: #007aff;
  color: white;
  font-weight: 500;
  letter-spacing: 4rpx;
  padding: 24rpx 0;
}



/* 响应式布局：在小屏幕上，左右分栏变为上下堆叠 */
@media (max-width: 768px) {
  .login-panel {
    flex-direction: column;
    width: 90%;
    min-height: auto;
    max-height: none;
  }

  .showcase-section {
    display: none; /* 在移动端直接隐藏宣传栏，聚焦登录 */
  }

  .form-section {
    padding: 40rpx;
  }
}
</style>