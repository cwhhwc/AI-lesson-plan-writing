import { vi } from 'vitest';

/**
 * Mock uni-app 全局 API
 * @see https://vitest.dev/api/vi.html
 */

// vi.fn() 会创建一个无害的模拟函数，它可以记录所有调用
global.uni = {
  showToast: vi.fn(),
  showLoading: vi.fn(),
  hideLoading: vi.fn(),
  navigateTo: vi.fn(),
  navigateBack: vi.fn(),
  redirectTo: vi.fn(),
  switchTab: vi.fn(),
  getSystemInfoSync: vi.fn(() => ({
    platform: 'devtools',
    statusBarHeight: 20,
    // ...可以按需添加更多模拟的系统信息
  })),
  getStorageSync: vi.fn(),
  setStorageSync: vi.fn(),
  // ... 在这里按需添加您项目中用到的其他 uni API
};
