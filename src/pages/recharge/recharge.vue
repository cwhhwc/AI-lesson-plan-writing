<template>
  <view class="recharge-container">
    <view class="balance-section">
      <text class="balance-label">当前余额</text>
      <text class="balance-amount">¥ 18.88</text>
      <text class="balance-description">（此余额仅为测试演示）</text>
    </view>

    <view class="recharge-options-section">
      <text class="section-title">选择充值金额</text>
      <view class="options-grid">
        <button v-for="amount in rechargeAmounts" :key="amount" class="recharge-button" @click="handleRecharge(amount)">
          ¥ {{ amount }}
        </button>
      </view>
    </view>

    <view class="footer-notice">
      <text>点击任意金额以完成模拟充值</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const rechargeAmounts = ref([10, 20, 50, 100, 200, 500]);

const handleRecharge = (amount) => {
  uni.showToast({
    title: `感谢参与测试！您选择的金额是 ¥${amount}。`,
    icon: 'none',
    duration: 2000
  });
};
</script>

<style scoped>
.recharge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
  background-color: #f7f7f7;
  min-height: 100vh;
}

.balance-section {
  width: 100%;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 60rpx;
}

.balance-label {
  font-size: 32rpx;
  color: #666;
}

.balance-amount {
  font-size: 80rpx;
  font-weight: bold;
  color: #333;
  margin: 20rpx 0;
}

.balance-description {
  font-size: 24rpx;
  color: #999;
}

.recharge-options-section {
  width: 100%;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 40rpx;
  text-align: center;
  display: block;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30rpx;
}

.recharge-button {
  min-width: 180rpx;
  background-color: #ecf5ff;
  color: #409eff;
  border: 1rpx solid #b3d8ff;
  border-radius: 10rpx;
  font-size: 36rpx;
  font-weight: 500;
  padding: 20rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recharge-button:active {
  background-color: #d9ecff;
}

.footer-notice {
  margin-top: 60rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
