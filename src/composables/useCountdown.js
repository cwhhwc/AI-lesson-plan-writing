import { ref } from 'vue';

export function useCountdown(initialSeconds = 60) {
  const isSendingCode = ref(false);
  const countdown = ref(0);
  let countdownTimer = null;

  const startCountdown = () => {
    if (isSendingCode.value || countdown.value > 0) {
      return;
    }

    isSendingCode.value = true;
    countdown.value = initialSeconds;

    countdownTimer = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--;
      } else {
        clearInterval(countdownTimer);
        countdownTimer = null;
        isSendingCode.value = false;
      }
    }, 1000);
  };

  const stopCountdown = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    isSendingCode.value = false;
    countdown.value = 0;
  };

  // 在组件卸载时清除定时器，防止内存泄漏
  // onUnmounted(() => {
  //   stopCountdown();
  // });

  return {
    isSendingCode,
    countdown,
    startCountdown,
    stopCountdown,
  };
}
