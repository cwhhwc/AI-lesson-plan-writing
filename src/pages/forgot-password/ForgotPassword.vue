<template>
  <view class="forgot-password-container">
    <view class="panel">
      <view class="title">重置密码</view>
      <view class="description">
        请输入您注册时使用的邮箱地址。
      </view>
      <view class="form">
        <view class="input-with-button">
          <BaseInput
            class="email-input"
            v-model="email"
            label="邮箱"
            placeholder="请输入您的邮箱"
            type="email"
            :error="emailErrorMsg"
            @input="emailErrorMsg = ''"
          />
          <button 
            @click="handleSendCode" 
            class="send-code-button"
            :disabled="isSendingCode || countdown > 0 || !isValidEmail(email) || !email.trim()"
          >
            {{ countdown > 0 ? `重新发送(${countdown}s)` : '发送验证码' }}
          </button>
        </view>
        
        <!-- 新增的验证码输入框 -->
        <BaseInput
          v-model="verificationCode"
          label="验证码"
          placeholder="请输入您收到的验证码"
          type="number"
          :error="codeErrorMsg"
          @input="codeErrorMsg = ''"
        />
        
        <BaseButton @click="handleNextStep" :loading="isLoading" class="next-step-button">
          下一步
        </BaseButton>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { sendVerificationCodeApi, verifyVerificationCodeApi } from '@/api.js';
import { useCountdown } from '@/composables/useCountdown.js';

const email = ref('');
const verificationCode = ref(''); // 新增
const emailErrorMsg = ref('');
const codeErrorMsg = ref(''); // 新增
const isLoading = ref(false);
const { isSendingCode, countdown, startCountdown } = useCountdown();

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function handleSendCode() { // Make it async
  if (isSendingCode.value || countdown.value > 0) {
    return;
  }

  if (!email.value.trim()) {
    emailErrorMsg.value = '请输入邮箱后再发送';
    return;
  }
  if (!isValidEmail(email.value)) {
    emailErrorMsg.value = '邮箱格式不正确';
    return;
  }

  isSendingCode.value = true; // 开始发送，禁用按钮
  emailErrorMsg.value = ''; // 清除之前的错误信息

  try {
    // 调用后端 API
    await sendVerificationCodeApi({ email: email.value });

    // API 调用成功，启动倒计时
    startCountdown();

    uni.showToast({
      title: '验证码已生成，请联系管理员获取', // 提示用户验证码已生成
      icon: 'success',
      duration: 3000
    });

  } catch (error) {
    console.error('发送验证码失败:', error);
    // 检查 error 对象是否有 message 属性，否则使用默认错误信息
    emailErrorMsg.value = error.message || (error.data && error.data.message) || '发送验证码失败，请稍后再试'; // 显示后端返回的错误信息
    isSendingCode.value = false; // 发生错误，按钮可用
    // 不启动倒计时
  } 
}

async function handleNextStep() {
  // 重置错误信息
  emailErrorMsg.value = '';
  codeErrorMsg.value = '';

  // 前端校验
  if (!email.value.trim()) {
    emailErrorMsg.value = '邮箱不能为空';
    return;
  }
  if (!isValidEmail(email.value)) {
    emailErrorMsg.value = '请输入有效的邮箱格式';
    return;
  }
  if (!verificationCode.value.trim()) {
    codeErrorMsg.value = '验证码不能为空';
    return;
  }

  isLoading.value = true; // 开始加载

  try {
    // 调用 API 进行验证
    await verifyVerificationCodeApi({ email: email.value, code: verificationCode.value });
    
    // API 验证成功后，才执行跳转
    uni.navigateTo({
      url: `/pages/reset-password/ResetPassword?email=${encodeURIComponent(email.value)}`
    });

  } catch (error) {
    // API 验证失败
    console.error('验证码验证失败:', error);
    codeErrorMsg.value = (error.data && error.data.message) || '验证码错误或已失效，请重试';
  } finally {
    // 无论成功或失败，都结束加载
    isLoading.value = false;
  }
}
</script>

<style scoped>
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

.input-with-button {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.email-input {
  flex-grow: 1;
}

.send-code-button {
  flex-shrink: 0;
  height: 50px;
  padding: 0 12px;
  font-size: 14px;
  white-space: nowrap;
  
  background-color: #ffffff;
  color: #007aff;
  border: 1px solid #007aff;
  border-radius: 5px;
  
  margin: 0;
  line-height: 50px;
  overflow: hidden;
  text-align: center;
}

.send-code-button:active {
  background-color: #f0f0f0;
  border: 1px solid #007aff;
}

.next-step-button {
  margin-top: 8px;
}

/* 直接为我们添加的 .email-input 类设置样式，覆盖子组件的 margin-top */
.email-input {
  margin-top: 0;
}
</style>