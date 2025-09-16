<template>
  <view class="login-form">
    <BaseInput
      :modelValue="username"
      @update:modelValue="emit('update:username', $event)"
      label="账号"
      placeholder="请输入账号"
      :error="usernameError ? '账号不能为空' : usernameErrorMsg"
      @input="onUsernameInputInternal"
    >
      <template #icon>
        <view class="icon-common user-icon"></view>
      </template>
    </BaseInput>
    <BaseInput
      :modelValue="password"
      @update:modelValue="emit('update:password', $event)"
      label="密码"
      placeholder="请输入密码"
      type="password"
      :error="passwordError ? '密码不能为空' : ''"
      @input="onPasswordInputInternal"
    >
      <template #icon>
        <view class="icon-common lock-icon"></view>
      </template>
    </BaseInput>
    <view class="login-options">
      <label class="remember-me">
        <checkbox :checked="rememberMe" @change="emit('update:rememberMe', $event.detail.value)" style="transform:scale(0.8); margin-right: 4rpx;"/> 记住我
      </label>
      <text class="forgot-password" @tap="emit('forgot-password')">忘记密码？</text>
    </view>
    
    <view class="register-link">
      还没有账号？<text class="register-action" @tap="emit('register')">立即注册</text>
    </view>
  </view>
</template>

<script setup>
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';

const props = defineProps({
  username: String,
  password: String,
  rememberMe: Boolean,
  usernameError: Boolean,
  passwordError: Boolean,
  usernameErrorMsg: String,
  });

const emit = defineEmits([
  'update:username',
  'update:password',
  'update:rememberMe',
  'forgot-password',
  'register',
  'username-input',
  'password-input',
]);

// Internal input handlers to pass through to parent's validation
function onUsernameInputInternal(e) {
  emit('username-input', e);
}

function onPasswordInputInternal(e) {
  emit('password-input', e);
}
</script>

<style scoped>
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
