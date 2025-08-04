// Pinia 功能测试文件
console.log('=== Pinia 功能测试 ===');

// 测试 1: 检查 Pinia 是否正确安装
try {
  const piniaModule = await import('pinia');
  const { createPinia, defineStore } = piniaModule;
  console.log('✓ Pinia 模块导入成功');
  
  // 测试 2: 创建 Pinia 实例
  const pinia = createPinia();
  console.log('✓ Pinia 实例创建成功');
  
  // 测试 3: 定义 Store
  const useTestStore = defineStore('test', {
    state: () => ({
      count: 0,
      name: 'test',
      items: []
    }),
    getters: {
      doubleCount: (state) => state.count * 2,
      itemCount: (state) => state.items.length
    },
    actions: {
      increment() {
        this.count++;
      },
      addItem(item) {
        this.items.push(item);
      },
      reset() {
        this.count = 0;
        this.items = [];
      }
    }
  });
  console.log('✓ Store 定义成功');
  
  // 注意: 在实际 Vue 应用中，我们需要将 pinia 实例挂载到应用上
  // 这里只是测试 Pinia API 是否正常工作
  console.log('=== Pinia 基础功能测试完成 ===');
  console.log('如果要在组件中使用，请确保在 main.js 中正确配置:');
  console.log('1. import { createPinia } from "pinia"');
  console.log('2. const pinia = createPinia()');
  console.log('3. app.use(pinia)');
  
} catch (error) {
  console.error('✗ Pinia 功能测试失败:', error);
}

// 测试 4: 检查版本兼容性
try {
  const piniaPackage = await import('pinia/package.json');
  console.log(`Pinia 版本: ${piniaPackage.version}`);
} catch (error) {
  console.log('无法获取 Pinia 版本信息');
}