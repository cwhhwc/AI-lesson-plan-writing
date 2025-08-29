// 从 vitest 中导入测试所需的几个核心函数
// describe: 用于创建一个测试套件，将一组相关的测试包裹在一起。
// it: (或 test) 用于定义一个单独的测试用例。
// expect: 用于创建一个“断言”，声明你期望的结果。
// beforeEach: 是一个“钩子”，会在当前 describe 块中的每个 it 测试用例运行前执行一次。
// vi: 是 Vitest 提供的工具集，包含了 mock、spy 等高级功能。
import { describe, it, expect, beforeEach, vi } from 'vitest';

// 导入你要测试的模块中的函数。
// 这里的路径 '../src/utils/token.js' 是相对于当前测试文件的。
import { setToken, getToken, removeToken } from '../src/utils/token.js';


// --- 开始定义一个测试套件 ---
// 第一个参数是套件的描述，它会显示在测试报告中，帮助你快速识别测试内容。
describe('Token Management', () => {

  // --- 设置一个“钩子”函数 ---
  // 这个 beforeEach 钩子能确保每个测试用例都在一个干净、独立的环境中运行。
  beforeEach(() => {
    // vi.clearAllMocks() 会重置所有“间谍”函数(vi.fn)的调用记录。
    // 如果没有这行，上一个测试用例对 uni.setStorageSync 的调用记录会带到下一个测试用例中，造成干扰。
    vi.clearAllMocks();
  });

  // --- 第一个测试用例 ---
  // 'it' 的描述应该清晰地说明这个测试的目标：“它应该能将 token 设置到存储中”。
  it('should set token to storage', () => {
    // [第一步：准备 - Arrange]
    // 准备好测试需要用到的数据。
    const testToken = 'my-secret-token';

    // [第二步：行动 - Act]
    // 调用你要测试的函数。
    setToken(testToken);

    // [第三步：断言 - Assert]
    // 验证行动的结果是否符合预期。
    // 我们期望 `uni.setStorageSync` (在 setup.js 中创建的间谍) 被调用过。
    expect(uni.setStorageSync).toHaveBeenCalled();
    // 我们还期望它是用我们指定的 'token' 键和 'my-secret-token' 值来调用的。
    expect(uni.setStorageSync).toHaveBeenCalledWith('token', testToken);
  });

  // --- 第二个测试用例 ---
  it('should get token from storage', () => {
    // [准备 - Arrange]
    const storedToken = 'retrieved-token';
    // 这里是 mock 的关键一步：我们“伪造”了 `uni.getStorageSync` 的返回值。
    // 我们告诉这个间谍：“当有人调用你时，不要真的去读存储，而是直接返回 'retrieved-token' 这个值”。
    // 这使得我们的测试不依赖于真实的存储环境，变得非常稳定和快速。
    uni.getStorageSync.mockReturnValue(storedToken);

    // [行动 - Act]
    // 调用 getToken 函数，它内部会调用 `uni.getStorageSync`。
    const result = getToken();

    // [断言 - Assert]
    // 期望 `uni.getStorageSync` 被以 'token' 为参数调用过。
    expect(uni.getStorageSync).toHaveBeenCalledWith('token');
    // 期望 `getToken` 函数的返回值，严格等于 (toBe) 我们设定的 token 值。
    expect(result).toBe(storedToken);
  });

  // --- 第三个测试用例 ---
  it('should remove token from storage', () => {
    // [准备 - Arrange]
    // 这个测试比较简单，不需要太多准备工作。
    // 我们需要确保 `uni.removeStorageSync` 也是一个间谍函数 (在 setup.js 中定义)。
    // 在你的 setup.js 中，这个函数可能还没有被模拟，如果测试失败，请确保它已被添加：
    // global.uni = { ..., removeStorageSync: vi.fn() };
    if (!uni.removeStorageSync) {
      uni.removeStorageSync = vi.fn();
    }

    // [行动 - Act]
    // 调用 `removeToken` 函数。
    removeToken();

    // [断言 - Assert]
    // 期望 `uni.removeStorageSync` 被以 'token' 为参数调用过。
    expect(uni.removeStorageSync).toHaveBeenCalledWith('token');
  });
});
