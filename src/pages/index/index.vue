<template>
  <view class="index-bg">
    <GlassCard>
      <view class="index-title">年级</view>
      <view class="index-form">
        <!-- 在下方填写年级下拉内容 -->
        <BaseSelect v-model="grade" :options="gradeOptions" placeholder="请选择年级" />
        <view class="index-label">教材版本</view>
        <!-- 在下方填写教材版本下拉内容 -->
        <BaseSelect v-model="book" :options="bookOptions" placeholder="请选择教材版本" />
        <view class="index-label">学科</view>
        <!-- 在下方填写学科下拉内容 -->
        <BaseSelect v-model="subject" :options="subjectOptions" placeholder="请选择学科" />
        <BaseButton @click="onGenerate">下一步</BaseButton>
      </view>
    </GlassCard>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import GlassCard from '@/components/GlassCard.vue';
import BaseSelect from '@/components/BaseSelect.vue';
import BaseButton from '@/components/BaseButton.vue';

const grade = ref('');
const book = ref('');
const subject = ref('');
// 在这里填写年级下拉内容，例如：['一年级','二年级','三年级']
const gradeOptions = ref(['高一']);
// 在这里填写教材版本下拉内容，例如：['人教版','苏教版']
const bookOptions = ref(['人教版']);
// 在这里填写学科下拉内容，例如：['语文','数学','英语']
const subjectOptions = ref(['化学']);

function onGenerate() {
  uni.showToast({ title: '生成演示', icon: 'none' });
}
</script>

<style scoped>
.index-bg {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #99c9ec 0%, #6438de 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}
.index-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #222;
  margin-bottom: 48rpx;
  letter-spacing: 2.5rpx;
  text-align: center;
}
.index-form {
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}
.index-label {
  font-size: 40rpx;
  color: #222;
  margin: 32rpx 0 0 0;
  text-align: center;
  font-weight: 700;
}
</style>
