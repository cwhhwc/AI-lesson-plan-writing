<template>
  <view class="login-bg">
    <GlassCard>
      <view class="login-title">登录</view>
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
            <checkbox :checked="rememberMe" @change="rememberMe = !rememberMe" style="transform:scale(0.8);margin-right:2px;"/> 记住我
          </label>
          <text class="forgot-password" @tap="onForgot">忘记密码？</text>
        </view>
        <BaseButton @click="onLogin" :loading="isLoading">登录</BaseButton>
        <view class="register-link">
          还没有账号？<text class="register-action" @tap="onRegister">立即注册</text>
        </view>
      </view>
    </GlassCard>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import GlassCard from '@/components/GlassCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
// 1. 引入我们新的 auth store
import { useAuthStore } from '@/stores/auth.js';

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const usernameError = ref(false);
const passwordError = ref(false);
const usernameErrorMsg = ref('');
// 加载状态
const isLoading = ref(false);

// 2. 获取 auth store 实例
const authStore = useAuthStore();

async function onLogin() {
  // 防止重复提交
  if (isLoading.value) return;

  usernameError.value = !username.value.trim();
  passwordError.value = !password.value.trim();
  // 清除之前的错误信息
  usernameErrorMsg.value = '';

  if (usernameError.value || passwordError.value) {
    return;
  }
  // 设置加载状态
  isLoading.value = true;

  try {
    // 3. 调用 store 的 login action
    await authStore.login({
      username: username.value,
      password: password.value,
    });

    // 4. 登录成功
    uni.showToast({ title: '登录成功', icon: 'success' });
    uni.navigateTo({ url: '/pages/chat/chat' });

  } catch (error) {
    // 5. 登录失败，错误信息由 store 抛出
    console.error(error);
    usernameErrorMsg.value = error.message || '登录失败，请重试';
    
  } finally {
    // 6. 无论成功失败，都重置加载状态
    isLoading.value = false;
  }
}

// 输入时清除错误状态
function onUsernameInput() {
  if (username.value.trim() && usernameError.value) usernameError.value = false;
  if (usernameErrorMsg.value) usernameErrorMsg.value = '';
}

// 判断密码是否为空
function onPasswordInput() {
  if (password.value.trim() && passwordError.value) passwordError.value = false;
}

// 忘记密码
function onForgot() {
  uni.showToast({ title: '请联系管理员', icon: 'none' });
}

// 注册
function onRegister() {
  uni.navigateTo({ url: '/pages/register/register' });
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #99c9ec 0%, #6438de 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #222;
  margin-bottom: 48rpx;
  letter-spacing: 2.5rpx;
  text-align: center;
}
.login-form {
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}
.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 8rpx 0;
  font-size: 26rpx;
}
.remember-me {
  color: #222;
  font-size: 26rpx;
}
.forgot-password {
  color: #222;
  text-decoration: underline;
  cursor: pointer;
}
.register-link {
  margin-top: 32rpx;
  text-align: center;
  color: #222;
  font-size: 28rpx;
}
.register-action {
  color: #222;
  text-decoration: underline;
  margin-left: 8rpx;
  cursor: pointer;
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
</style> 