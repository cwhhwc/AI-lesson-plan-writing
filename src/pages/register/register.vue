<template>
  <view class="login-container">
    <view class="login-panel">
      <!-- 左侧宣传栏 -->
      <view class="showcase-section">
        <view class="showcase-content">
          <view class="showcase-title">开启您的创作之旅</view>
          <view class="showcase-subtitle">加入折纸AI，体验专为教师设计的智能备课平台</view>
        </view>
      </view>

      <!-- 右侧注册表单 -->
      <view class="form-section">
        <view class="form-content">
          <image src="/static/logo.png" class="logo-image" mode="aspectFit" />
          <view class="login-title">创建新账户</view>
          
          <view class="register-form">
            <BaseInput
              v-model="username"
              label="用户名"
              placeholder="请输入您的账号"
              :error="usernameError ? '账号不能为空' : usernameErrorMsg"
              @input="onUsernameInput"
            />
            <BaseInput
              v-model="password"
              label="密码"
              placeholder="请输入6-18位密码"
              type="password"
              :error="passwordError ? '密码不能为空' : passwordLengthError ? '密码必须为6-18位' : passwordComplexityError ? '密码必须包含大小写字母和数字' : ''"
              @input="onPasswordInput"
            />
            <BaseInput
              v-model="confirmPassword"
              label="确认密码"
              placeholder="请再次输入密码"
              type="password"
              :error="confirmPasswordError ? '确认密码不一致' : ''"
              @input="onConfirmPasswordInput"
            />
            <view class="agreement">
              <checkbox :checked="agree" @tap="agree = !agree" style="transform:scale(0.7)"/>
              <text>我已阅读并同意</text>
              <text class="link">用户协议</text>
              <text>和</text>
              <text class="link">隐私政策</text>
            </view>
            <BaseButton @click="onRegister" :loading="isLoading" class="register-button">立即注册</BaseButton>
            <view class="login-link">
              已有账号？<text class="link" @tap="onLogin">直接登录</text>
            </view>
          </view>

        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
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
const passwordComplexityError = ref(false);
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
  passwordComplexityError.value = false;
  confirmPasswordError.value = false;
  usernameErrorMsg.value = '';
  
  if (usernameError.value) return;
  if (passwordError.value) return;
  if (password.value.length < 6 || password.value.length > 18) {
    passwordLengthError.value = true;
    return;
  }

  const hasUpperCase = /[A-Z]/.test(password.value);
  const hasLowerCase = /[a-z]/.test(password.value);
  const hasNumber = /[0-9]/.test(password.value);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    passwordComplexityError.value = true;
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
  if (e.detail && e.detail.value && passwordComplexityError.value) passwordComplexityError.value = false;
}

function onConfirmPasswordInput(e) {
  if (e.detail && e.detail.value && confirmPasswordError.value) confirmPasswordError.value = false;
}

function onLogin() {
  uni.navigateTo({ url: '/pages/login/login' });
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
  overflow: hidden;
}

.showcase-section {
  flex: 1;
  background: linear-gradient(135deg, #3498db, #2980b9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
  text-align: center;
  color: white;
}

.showcase-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 430rpx;
}

.showcase-logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 40rpx;
}

.showcase-title {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.showcase-subtitle {
  font-size: 32rpx;
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

.register-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.agreement {
  font-size: 24rpx;
  color: #666;
  display: flex;
  align-items: center;
}

.agreement .link {
  color: #3498db;
  cursor: pointer;
  margin: 0 8rpx;
}

.register-button {
  margin-top: 20rpx;
}

.login-link {
  margin-top: 40rpx;
  font-size: 28rpx;
  color: #666;
  text-align: center;
}

.login-link .link {
  color: #3498db;
  cursor: pointer;
  margin-left: 8rpx;
}


:deep(.base-button) {
  background-color: #007aff;
  color: white;
  font-weight: 500;
  letter-spacing: 4rpx;
  padding: 24rpx 0;
}

@media (max-width: 768px) {
  .login-panel {
    flex-direction: column;
    width: 90%;
    min-height: auto;
    max-height: none;
  }

  .showcase-section {
    display: none;
  }

  .form-section {
    padding: 40rpx;
  }
}
</style>