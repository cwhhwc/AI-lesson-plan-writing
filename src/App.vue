<script setup>
import { onLaunch, onShow } from '@dcloudio/uni-app';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();
// 新增一个启动标记
// 这个变量只在内存中，每次刷新页面都会重置为 true
let isJustLaunched = true;

onLaunch(async () => {
  console.log('App Launch - 尝试自动登录');
  const refreshed = await authStore.proactiveRefresh();

  if (refreshed) {
    console.log('自动登录成功');
    // 登录成功，设置标志位，由 login.vue 页面自己处理跳转
    authStore.justLoggedIn = true;
  } else {
    console.log('自动登录失败或未登录');
  }

  // 在 onLaunch 的末尾，用一个短暂的延时来改变标记
  // 这确保了 onShow 第一次触发时，isJustLaunched 仍然是 true
  setTimeout(() => {
    isJustLaunched = false;
  }, 100);
});

onShow(async () => {
  // 如果是刚启动，则跳过 onShow 的刷新，避免重复
  if (isJustLaunched) {
    return; 
  }

  console.log('App Show - 刷新token');
  await authStore.proactiveRefresh();
});

/*export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}*/
</script>

<style>
/*每个页面公共css */
</style>