<template>
  <view class="forgot-password-container">
    <view class="panel">
      <view class="title">设置新密码</view>
      <view class="description">
        请输入您的新密码。建议密码长度不少于8位。
      </view>
      <view class="form">
        <BaseInput
          v-model="newPassword"
          label="新密码"
          placeholder="请输入新密码"
          type="password"
          :error="passwordErrorMsg"
          @input="passwordErrorMsg = ''"
        />
        <BaseInput
          v-model="confirmPassword"
          label="确认新密码"
          placeholder="请再次输入新密码"
          type="password"
          :error="confirmPasswordErrorMsg"
          @input="confirmPasswordErrorMsg = ''"
        />
        <BaseButton @click="handleResetPassword" :loading="isLoading" class="next-step-button">
          确认重置
        </BaseButton>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { resetPasswordApi } from '@/api.js';
import { validatePassword } from '@/utils/validation.js';

const email = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const passwordErrorMsg = ref('');
const confirmPasswordErrorMsg = ref('');
const isLoading = ref(false);

// 页面加载时，从 URL 参数中获取 email
onLoad((options) => {
  if (options.email) {
    email.value = decodeURIComponent(options.email);
  } else {
    // 如果没有 email，提示错误并返回上一页
    uni.showToast({
      title: '无效的链接',
      icon: 'error'
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }
});

async function handleResetPassword() {
  // 重置错误信息
  passwordErrorMsg.value = '';
  confirmPasswordErrorMsg.value = '';

  // 前端校验
  if(!email.value) {
    uni.showToast({
      title: '无效的链接',
      icon: 'error'
    });
    return;
  }
  if (!newPassword.value) {
    passwordErrorMsg.value = '新密码不能为空';
    return;
  }

  // --- 使用新的密码验证逻辑 ---
  const passwordValidation = validatePassword(newPassword.value);
  if (!passwordValidation.valid) {
    if (passwordValidation.error === 'length') {
      passwordErrorMsg.value = '密码必须为6-18位';
    } else if (passwordValidation.error === 'complexity') {
      passwordErrorMsg.value = '密码必须包含大小写字母和数字';
    }
    return;
  }
  // --------------------------

  if (newPassword.value !== confirmPassword.value) {
    confirmPasswordErrorMsg.value = '两次输入的密码不一致';
    return;
  }

  isLoading.value = true;

  try {
    await resetPasswordApi({ email: email.value, newPassword: newPassword.value });

    // 为了方便您测试样式，暂时模拟一个成功的场景
    console.log('模拟 API 调用', { email: email.value, password: newPassword.value });

    // 成功提示
    uni.showToast({
      title: '密码重置成功！',
      icon: 'success',
      duration: 2000
    });

    // 2秒后跳转到登录页
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/login/login'
      });
    }, 2000);

  } catch (error) {
    console.error('重置密码失败:', error);
    confirmPasswordErrorMsg.value = (error.data && error.data.message) || '重置失败，请稍后再试';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* 样式与 forgot-password 页面完全一致 */
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.panel {
  width: 90%;
  max-width: 500px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
}

.description {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 32px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.next-step-button {
  margin-top: 8px;
}
</style>
