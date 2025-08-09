<template>
  <view class="login-bg">
    <GlassCard>
      <view class="login-title">注册</view>
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
          :error="passwordError ? '密码不能为空' : passwordLengthError ? '密码必须为6-18位' : ''"
          @input="onPasswordInput"
        >
          <template #icon>
            <view class="icon-common lock-icon"></view>
          </template>
        </BaseInput>
        <BaseInput
          v-model="confirmPassword"
          label="确认密码"
          placeholder="请再次输入密码"
          type="password"
          :error="confirmPasswordError ? '确认密码不一致' : ''"
          @input="onConfirmPasswordInput"
        >
          <template #icon>
            <view class="icon-common lock-icon"></view>
          </template>
        </BaseInput>
        <view style="display: flex; align-items: center; margin: 16rpx 0 0 0; font-size: 26rpx; color: #222;">
          <checkbox v-model="agree" style="transform:scale(0.8);margin-right:2px;"/>
          我已阅读并同意<text style="color:#3b82f6;text-decoration:underline;">用户协议</text>和<text style="color:#3b82f6;text-decoration:underline;">隐私政策</text>
        </view>
        <BaseButton @click="onRegister" :loading="isLoading">注册</BaseButton>
        <view style="text-align:center; margin-top:32rpx; color:#222; font-size:28rpx;">
          已有账号？<text style="color:#222; text-decoration:underline; margin-left:8rpx; cursor:pointer;" @tap="onLogin">返回登录</text>
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
import { registerApi } from '@/api.js';
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const agree = ref(false);
// 仅做错误变量声明和绑定，不实现判断逻辑
const usernameError = ref(false);
const passwordError = ref(false);
const passwordLengthError = ref(false);
const confirmPasswordError = ref(false);
const usernameErrorMsg = ref('');
// 添加加载状态防止重复提交
const isLoading = ref(false);
function onRegister() {
  // 防止重复提交
  if (isLoading.value) return;
  
  usernameError.value = !username.value.trim();
  passwordError.value = !password.value.trim();
  passwordLengthError.value = false;
  confirmPasswordError.value = false;
  usernameErrorMsg.value = '';
  
  if (usernameError.value) return;
  if (passwordError.value) return;
  if (password.value.length < 6 || password.value.length > 18) {
    passwordLengthError.value = true;
    return;
  }
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = true;
    return;
  }
  
  // 设置加载状态
  isLoading.value = true;
  
  // 注册接口调用
  registerApi({
    username: username.value,
    password: password.value,
    confirmPwd: confirmPassword.value
  })
    .then(data => {
      if (data.code === 0) {
        uni.showToast({ title: '注册成功', icon: 'success' });
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/login/login' });
        }, 800);
        // TODO: 注册成功后的后续逻辑
      } else {
        usernameErrorMsg.value = data.message || '注册失败';
      }
    })
    .catch(() => {
      uni.showToast({ title: '网络错误', icon: 'none' });
    })
    .finally(() => {
      // 无论成功失败都要重置加载状态
      isLoading.value = false;
    });
}
function onUsernameInput(e) {
  if (e.detail && e.detail.value && usernameError.value) usernameError.value = false;
  if (usernameErrorMsg.value) usernameErrorMsg.value = '';
}
function onPasswordInput(e) {
  if (e.detail && e.detail.value && passwordError.value) passwordError.value = false;
  if (e.detail && e.detail.value && passwordLengthError.value) passwordLengthError.value = false;
}
function onConfirmPasswordInput(e) {
  if (e.detail && e.detail.value && confirmPasswordError.value) confirmPasswordError.value = false;
}
function onLogin() {
  uni.navigateTo({ url: '/pages/login/login' });
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