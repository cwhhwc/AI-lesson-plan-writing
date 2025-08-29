import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChat } from '../../src/composables/useChat.js';
import { useChatHistoryStore } from '../../src/stores/chatHistory.js';
import chatStorageAPI from '../../src/utils/chatStorageService.js';
import { nextTick } from 'vue';

// 模拟依赖项
vi.mock('../../src/stores/lessonPlan.js', () => ({
  useLessonPlanStore: vi.fn(() => ({})),
}));
vi.mock('../../src/utils/chatStorageService.js');
vi.mock('../../src/api.js', () => ({}));
vi.mock('../../src/stores/chatHistory.js', () => ({
  useChatHistoryStore: vi.fn(),
}));

describe('useChat 功能', () => {
  let mockChatHistoryStore;

  beforeEach(() => {
    // 在每个测试前，重置模拟的 store
    mockChatHistoryStore = {
      clearCurrentSession: vi.fn(),
      setSelectedSessionId: vi.fn(),
      setCurrentSessionId: vi.fn(),
    };
    useChatHistoryStore.mockReturnValue(mockChatHistoryStore);

    // 清除所有模拟的历史记录
    vi.clearAllMocks();
  });

  describe('handleNewChat - 新建会话', () => {
    it('应能重置 sessionId 和 messages 状态', () => {
      const { messages, sessionId, handleNewChat } = useChat();
      messages.value = [{ role: 'user', content: 'hello' }];
      sessionId.value = 'existing_session_123';
      handleNewChat();
      expect(sessionId.value).toBe('');
      expect(messages.value).toEqual([]);
    });

    it('应能调用 store 的 clearCurrentSession 方法', () => {
      const { handleNewChat } = useChat();
      handleNewChat();
      expect(mockChatHistoryStore.clearCurrentSession).toHaveBeenCalledTimes(1);
    });

    it('应能调用输入框引用并触发滚动回调', async () => {
      const mockInputRef = { setInputValue: vi.fn() };
      const mockOnScrollCheck = vi.fn();
      const { handleNewChat } = useChat({ onScrollCheck: mockOnScrollCheck });
      handleNewChat(mockInputRef);
      await nextTick();
      expect(mockInputRef.setInputValue).toHaveBeenCalledWith('');
      expect(mockOnScrollCheck).toHaveBeenCalledTimes(1);
    });

    it('在未提供可选依赖项时应能静默处理', async () => {
      const { handleNewChat } = useChat();
      const action = () => handleNewChat(null);
      expect(action).not.toThrow();
      await expect(nextTick()).resolves.not.toThrow();
    });
  });

  describe('handleSelectChat - 选择已有会话', () => {
    const mockUserId = 'user-123';
    const mockSessionId = 'session-abc';

    beforeEach(() => {
      vi.mocked(chatStorageAPI._getUserIdFromToken).mockClear();
      vi.mocked(chatStorageAPI.loadChatById).mockClear();
    });

    it('如果用户未登录，应打印警告并退出', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.mocked(chatStorageAPI._getUserIdFromToken).mockReturnValue(null);
      const { handleSelectChat } = useChat();
      handleSelectChat(mockSessionId);
      expect(consoleSpy).toHaveBeenCalledWith('用户未登录');
      expect(chatStorageAPI.loadChatById).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('如果用户已登录且找到聊天数据，应加载消息', async () => {
      vi.mocked(chatStorageAPI._getUserIdFromToken).mockReturnValue(mockUserId);
      const mockChatData = { messages: [{ user: '你好', ai: '你好，有什么可以帮忙的？' }] };
      vi.mocked(chatStorageAPI.loadChatById).mockReturnValue(mockChatData);
      const mockOnScrollCheck = vi.fn();
      const { messages, handleSelectChat } = useChat({ onScrollCheck: mockOnScrollCheck });
      handleSelectChat(mockSessionId);
      await nextTick();
      expect(chatStorageAPI.loadChatById).toHaveBeenCalledWith(mockUserId, mockSessionId);
      expect(messages.value).toEqual([
        { role: 'user', content: '你好' },
        { role: 'ai', content: '你好，有什么可以帮忙的？' },
      ]);
      expect(mockOnScrollCheck).toHaveBeenCalledTimes(1);
    });

    it('如果未找到聊天数据，应清空消息列表', async () => {
      vi.mocked(chatStorageAPI._getUserIdFromToken).mockReturnValue(mockUserId);
      vi.mocked(chatStorageAPI.loadChatById).mockReturnValue(null);
      const { messages, handleSelectChat } = useChat();
      messages.value = [{ role: 'user', content: 'stale message' }];
      handleSelectChat(mockSessionId);
      await nextTick();
      expect(messages.value).toEqual([]);
    });

    it('应能正确更新 sessionId 并调用 store 的方法', () => {
      vi.mocked(chatStorageAPI._getUserIdFromToken).mockReturnValue(mockUserId);
      const { sessionId, handleSelectChat } = useChat();
      handleSelectChat(mockSessionId);
      expect(sessionId.value).toBe(mockSessionId);
      expect(mockChatHistoryStore.setSelectedSessionId).toHaveBeenCalledWith(mockSessionId);
      expect(mockChatHistoryStore.setCurrentSessionId).toHaveBeenCalledWith(mockSessionId);
    });
  });
});
