<template>
  <view class="login-container">
    <!-- 1. 创建一个白色面板作为视觉主体 -->
    <view class="login-panel">
      <!-- 2. 左侧宣传栏 -->
      <view class="showcase-section">
        <!-- 这里未来可以放图片、产品Slogan等 -->
      </view>

      <!-- 3. 右侧表单栏 -->
      <view class="form-section">
        <view class="form-content">
          <image src="/static/logo.png" class="logo-image" mode="aspectFit" />
          <view class="login-title">欢迎回来</view>
          <view class="login-form">
            <BaseInput
              v-model="username"
              label="账号"
              placeholder="请输入账号"
              :error="usernameError ? '账号不能为空' : usernameErrorMsg"
              @input="onUsernameInput"
            >
              <template #icon>
                <view class="icon-common user-icon"></view>
              </template>
            </BaseInput>
            <BaseInput
              v-model="password"
              label="密码"
              placeholder="请输入密码"
              type="password"
              :error="passwordError ? '密码不能为空' : ''"
              @input="onPasswordInput"
            >
              <template #icon>
                <view class="icon-common lock-icon"></view>
              </template>
            </BaseInput>
            <view class="login-options">
              <label class="remember-me">
                <checkbox :checked="rememberMe" @change="rememberMe = $event.detail.value" style="transform:scale(0.8); margin-right: 4rpx;"/> 记住我
              </label>
              <text class="forgot-password" @tap="onForgot">忘记密码？</text>
            </view>
            <BaseButton @click="onLogin" :loading="isLoading">登 录</BaseButton>
            <view class="register-link">
              还没有账号？<text class="register-action" @tap="onRegister">立即注册</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
// --- 你的 <script setup> 部分代码完全不变 ---
import { ref } from 'vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { useAuthStore } from '@/stores/auth.js';

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
  background-color: #f7f9fc; /* 给左侧一个非常浅的背景色以作区分 */
  /* 未来可以在这里添加背景图 */
  /* background-image: url(...); */
  /* background-size: cover; */
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

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 26rpx;
  color: #666;
}

.remember-me {
  display: flex;
  align-items: center;
  color: #666;
}

.forgot-password {
  color: #999;
  cursor: pointer;
}

.forgot-password:hover {
  text-decoration: underline;
}

.register-link {
  margin-top: 32rpx;
  text-align: center;
  color: #666;
  font-size: 28rpx;
}

.register-action {
  color: #007aff;
  font-weight: 500;
  margin-left: 8rpx;
  cursor: pointer;
}

.register-action:hover {
  text-decoration: underline;
}

:deep(.base-button) {
  background-color: #007aff;
  color: white;
  font-weight: 500;
  letter-spacing: 4rpx;
  padding: 24rpx 0;
}

.icon-common {
  position: absolute;
  left: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 40rpx;
  z-index: 1;
}

.user-icon {
  background: url('data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="12" r="6" stroke="%23999" stroke-width="2"/><path d="M6 26c0-4.418 4.03-8 10-8s10 3.582 10 8" stroke="%23999" stroke-width="2" fill="none"/></svg>') no-repeat center/contain;
}

.lock-icon {
  background: url('data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="14" width="16" height="12" rx="3" stroke="%23999" stroke-width="2" fill="none"/><path d="M16 20v4" stroke="%23999" stroke-width="2"/><path d="M12 14v-4a4 4 0 1 1 8 0v4" stroke="%23999" stroke-width="2" fill="none"/></svg>') no-repeat center/contain;
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