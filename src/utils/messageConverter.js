/**
 * 将存储格式的消息转换为渲染格式
 * @param {Array} storageMessages - 存储格式的消息数组
 * @returns {Array} 渲染格式的消息数组
 */
export const convertStorageToRenderFormat = (storageMessages) => {
  const convertedMessages = [];
  storageMessages.forEach(message => {
    if (message.user) {
      convertedMessages.push({ role: 'user', content: message.user });
    }
    const hasAiText = typeof message.ai === 'string' && message.ai !== '';
    const hasCard = message.card !== null && message.card !== undefined;
    if (hasAiText || hasCard) {
      const aiMsg = { role: 'ai', content: hasAiText ? message.ai : '' };
      if (hasCard) {
        aiMsg.card = message.card;
      }
      convertedMessages.push(aiMsg);
    }
  });
  return convertedMessages;
};
