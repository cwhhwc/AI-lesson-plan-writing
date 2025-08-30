import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChat } from '../../src/composables/useChat.js';
import { useChatHistoryStore } from '../../src/stores/chatHistory.js';
import { chatApi } from '../../src/api.js';
import chatStorageAPI from '../../src/utils/chatStorageService.js';

// --- 模拟外部依赖 ---
vi.mock('../../src/api.js', () => ({
  chatApi: vi.fn(),
}));

vi.mock('../../src/utils/chatStorageService.js', () => ({
  default: {
    saveChatToStorage: vi.fn(),
    _getUserIdFromToken: vi.fn().mockReturnValue('mock-user-id'), // 假设用户已登录
  },
}));

vi.mock('../../src/stores/chatHistory.js');
vi.mock('../../src/stores/lessonPlan.js', () => ({
  useLessonPlanStore: vi.fn(() => ({})),
}));
// 纯工具函数，我们信任它们或在自己的测试中覆盖它们，这里只做空模拟
vi.mock('../../src/utils/idUtils.js');
vi.mock('../../src/utils/messageConverter.js');

describe('useChat - 消息收发功能 (集成测试)', () => {

  beforeEach(() => {
    // 在每个测试前重置所有模拟
    vi.clearAllMocks();
    // 为 history store 提供一个默认的模拟实现
    useChatHistoryStore.mockReturnValue({
      setCurrentSessionId: vi.fn(),
    });
  });

  it('在聊天模式下，应能完整处理一次成功的消息收发流程', async () => {
    // 准备: 深度模拟 chatApi 的成功行为
    vi.mocked(chatApi).mockImplementation(async (options) => {
      // 模拟流式返回JSON字符串
      options.onMessage(JSON.stringify({ reply: '你好' }));
      options.onMessage(JSON.stringify({ reply: '！' }));
      options.onMessage(JSON.stringify({ session_id: 'new-session-123' }));
      // chatApi 本身返回一个 resolved Promise 表示成功结束
      return Promise.resolve();
    });

    const { messages, sessionId, handleSendMessage } = useChat({ isWriteMode: false });

    // 执行: 等待整个消息发送和接收流程完成
    await handleSendMessage('用户的问题', {});

    // 断言
    // 1. 用户消息被添加
    expect(messages.value[0]).toEqual({ role: 'user', content: '用户的问题' });
    // 2. AI 占位消息被添加，并最终被填充内容
    expect(messages.value[1]).toEqual({ role: 'ai', content: '你好！' });
    // 3. sessionId 被更新
    expect(sessionId.value).toBe('new-session-123');
    // 4. 最终的保存函数被调用
    expect(chatStorageAPI.default.saveChatToStorage).toHaveBeenCalledTimes(1);
    // 5. 验证保存时传入了正确的用户问题和AI回答
    expect(chatStorageAPI.default.saveChatToStorage).toHaveBeenCalledWith('用户的问题', messages.value[1]);
  });

  it('在聊天模式下，当API调用失败时，应能显示错误信息', async () => {
    // 准备: 模拟 chatApi 抛出错误
    const apiError = new Error('Network Error');
    vi.mocked(chatApi).mockRejectedValue(apiError);

    const { messages, handleSendMessage } = useChat({ isWriteMode: false });

    // 执行
    await handleSendMessage('一个会失败的问题', {});

    // 断言
    // 1. AI 消息的最终内容是错误提示
    expect(messages.value[1].content).toBe('AI服务异常');
    // 2. 不应该调用保存函数
    expect(chatStorageAPI.default.saveChatToStorage).not.toHaveBeenCalled();
  });

  it('在聊天模式下，即使发送空字符串，也应能触发一次完整的收发流程', async () => {
    // 准备: 模拟一个简单的成功返回
    vi.mocked(chatApi).mockImplementation(async (options) => {
      options.onMessage(JSON.stringify({ reply: '空消息的回复' }));
      return Promise.resolve();
    });

    const { messages, handleSendMessage } = useChat({ isWriteMode: false });

    // 执行
    await handleSendMessage('', {});

    // 断言
    expect(messages.value[0]).toEqual({ role: 'user', content: '' });
    expect(messages.value[1].content).toBe('空消息的回复');
    expect(chatStorageAPI.default.saveChatToStorage).toHaveBeenCalledTimes(1);
  });
});
