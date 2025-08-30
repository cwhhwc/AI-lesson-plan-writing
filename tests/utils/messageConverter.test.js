import { describe, it, expect } from 'vitest';
import { convertStorageToRenderFormat } from '../../src/utils/messageConverter.js';

describe('convertStorageToRenderFormat - 消息格式转换器', () => {

  it('输入为空数组时，应返回空数组', () => {
    // 准备
    const input = [];
    // 执行
    const result = convertStorageToRenderFormat(input);
    // 断言
    expect(result).toEqual([]);
  });

  it('应能正确处理只包含用户消息的数组', () => {
    // 准备
    const input = [{ user: '你好' }, { user: '再见' }];
    // 执行
    const result = convertStorageToRenderFormat(input);
    // 断言
    expect(result).toEqual([
      { role: 'user', content: '你好' },
      { role: 'user', content: '再见' },
    ]);
  });

  it('应能正确处理只包含AI文本消息的数组', () => {
    // 准备
    const input = [{ ai: '回复1' }, { ai: '回复2' }];
    // 执行
    const result = convertStorageToRenderFormat(input);
    // 断言
    expect(result).toEqual([
      { role: 'ai', content: '回复1' },
      { role: 'ai', content: '回复2' },
    ]);
  });

  it('应能正确处理只包含AI卡片的消息', () => {
    // 准备
    const input = [{ card: { type: 'test_card' } }];
    // 执行
    const result = convertStorageToRenderFormat(input);
    // 断言
    expect(result).toEqual([{ role: 'ai', content: '', card: { type: 'test_card' } }]);
  });

  it('应能正确处理混合类型的消息数组', () => {
    // 准备
    const input = [{ user: '问题' }, { ai: '答案', card: { type: 'test_card' } }];
    // 执行
    const result = convertStorageToRenderFormat(input);
    // 断言
    expect(result).toEqual([
      { role: 'user', content: '问题' },
      { role: 'ai', content: '答案', card: { type: 'test_card' } },
    ]);
  });

  it('应能忽略无效或格式不正确的消息对象', () => {
    // 准备
    const input = [{}, { user: '' }, { ai: null }, { card: undefined }, { user: '有效消息' }];
    // 执行
    const result = convertStorageToRenderFormat(input);
    // 断言
    expect(result).toEqual([{ role: 'user', content: '有效消息' }]);
  });

  it('应能正确处理用户和AI纯文本交替出现的情况', () => {
    // 准备
    const input = [{ user: '你好' }, { ai: '我能帮你什么？' }];
    // 执行
    const result = convertStorageToRenderFormat(input);
    // 断言
    expect(result).toEqual([
      { role: 'user', content: '你好' },
      { role: 'ai', content: '我能帮你什么？' },
    ]);
  });

});