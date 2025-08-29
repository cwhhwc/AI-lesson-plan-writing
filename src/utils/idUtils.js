/**
 * [辅助函数] 生成唯一的临时ID，用于在获取到永久ID前占位
 * @param {object} chatHistoryStore - a pinia store instance
 * @returns {string} 临时ID
 */
export const generateTemporaryId = (chatHistoryStore) => {
  const currentSessionId = chatHistoryStore.getCurrentSessionId;
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).slice(2, 11);
  const baseId = currentSessionId || `new_${timestamp}`;
  return `temp_${baseId}_${timestamp}_${randomId}`;
};
