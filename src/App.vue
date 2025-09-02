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
    // 1. 获取当前页面栈。这是一个包含了所有页面实例的数组。
    const pages = getCurrentPages();

    // 确保页面栈存在
    if (pages.length > 0) {
      // 2. 获取当前页面实例（数组的最后一个就是当前页）
      const currentPage = pages[pages.length - 1];
      // 3. 获取当前页面的路径，例如 "pages/login/login"
      const currentRoute = currentPage.route;

      // 4. 判断当前页面是否为登录页
      if (currentRoute === 'pages/login/login') {
        console.log('自动登录成功且在登录页，准备跳转...');
        
        // 5. 使用 reLaunch 跳转到主页。
        // reLaunch 会关闭所有其他页面，只打开目标页面，
        // 完美防止用户从主页返回到登录页。
        uni.reLaunch({
          url: '/pages/chat/chat'
        });
      }
    }
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