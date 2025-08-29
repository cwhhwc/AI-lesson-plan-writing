// tests/utils/localStorage.test.js

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setStorage, getStorage, removeStorage } from '../../src/utils/localStorage.js';

// 使用 describe 对测试进行分组，使其更具可读性
describe('localStorage utility', () => {

  // beforeEach 是一个钩子，在当前文件中的每个 it 测试用例运行之前都会执行一次
  beforeEach(() => {
    // 清除所有模拟函数（vi.fn）的调用记录，确保每个测试用例都是干净的
    vi.clearAllMocks();
  });

  // 第一个测试用例：测试 setStorage 函数
  it('should set an item to storage correctly', () => {
    // 1. 准备 (Arrange)
    const key = 'user';
    const value = { name: 'Gemini', level: 99 };
    const serializedValue = JSON.stringify(value);

    // 2. 行动 (Act)
    const result = setStorage(key, value);

    // 3. 断言 (Assert)
    // 检查 uni.setStorageSync 是否被调用过
    expect(uni.setStorageSync).toHaveBeenCalled();
    // 检查 uni.setStorageSync 是否是用我们期望的参数调用的
    expect(uni.setStorageSync).toHaveBeenCalledWith(key, serializedValue);
    // 检查 setStorage 函数的返回值是否为 true
    expect(result).toBe(true);
  });

  // 第二个测试用例：测试 getStorage 函数
  it('should get an item from storage correctly', () => {
    // 1. 准备 (Arrange)
    const key = 'user';
    const value = { name: 'Gemini', level: 99 };
    const serializedValue = JSON.stringify(value);
    // 模拟 uni.getStorageSync 的返回值，当它被调用时，假装它返回了我们设定的值
    uni.getStorageSync.mockReturnValue(serializedValue);

    // 2. 行动 (Act)
    const result = getStorage(key);

    // 3. 断言 (Assert)
    // 检查 uni.getStorageSync 是否被调用过
    expect(uni.getStorageSync).toHaveBeenCalledWith(key);
    // 检查 getStorage 的返回值是否和我们存入的对象深度相等
    expect(result).toEqual(value);
  });

  // 第三个测试用例：测试 getStorage 在没有值时返回默认值
  it('should return default value when item does not exist', () => {
    // 1. 准备 (Arrange)
    const key = 'non-existent-key';
    const defaultValue = 'default';
    // 模拟 uni.getStorageSync 返回空字符串，模拟找不到值的情况
    uni.getStorageSync.mockReturnValue('');

    // 2. 行动 (Act)
    const result = getStorage(key, defaultValue);

    // 3. 断言 (Assert)
    expect(uni.getStorageSync).toHaveBeenCalledWith(key);
    // 检查返回值是否是我们提供的默认值
    expect(result).toBe(defaultValue);
  });

  // 第四个测试用例：测试 removeStorage 函数
  it('should remove an item from storage', () => {
    // 1. 准备 (Arrange)
    const key = 'item-to-remove';
    // 确保你的 setup.js 中已经模拟了 removeStorageSync
    // global.uni = { ..., removeStorageSync: vi.fn() };
    if (!uni.removeStorageSync) {
      uni.removeStorageSync = vi.fn();
    }

    // 2. 行动 (Act)
    const result = removeStorage(key);

    // 3. 断言 (Assert)
    expect(uni.removeStorageSync).toHaveBeenCalledWith(key);
    expect(result).toBe(true);
  });
});
