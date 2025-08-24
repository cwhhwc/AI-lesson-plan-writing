/**
 * 滚动检测工具
 * 提供滚动位置检测和DOM操作功能
 */

/**
 * 获取可滚动元素
 * @param {Object} messageListRef - 消息列表组件的引用
 * @returns {HTMLElement|null} 可滚动的DOM元素
 */
export const getScrollableElement = (messageListRef) => {
  if (messageListRef?.value) {
    // uniapp的组件引用需要通过$el访问真实DOM
    const messagesArea = messageListRef.value.$el;
    // 尝试获取内部的滚动容器，如果不存在则使用组件根元素
    return messagesArea?.querySelector?.('.messages-content') || messagesArea;
  }
  return null;
};

/**
 * 检查当前是否滚动到底部
 * @param {Object} messageListRef - 消息列表组件的引用
 * @returns {boolean} 是否在底部
 */
export const checkScrollPosition = (messageListRef) => {
  const scrollableElement = getScrollableElement(messageListRef);
  if (scrollableElement) {
    const { scrollTop, scrollHeight, clientHeight } = scrollableElement;
    // 增加5px的容差，避免像素计算不精确导致的问题
    return scrollTop + clientHeight >= scrollHeight - 5;
  }
  // 如果元素不存在，默认在底部
  return true;
};

/**
 * 设置滚动监听器
 * @param {Object} messageListRef - 消息列表组件的引用
 * @param {Function} updateCallback - 滚动时调用的回调函数，接收一个布尔值参数 (isAtBottom)
 */
export const setupBottomDetection = (messageListRef, updateCallback) => {
  const scrollableElement = getScrollableElement(messageListRef);
  
  if (scrollableElement?.addEventListener) {
    scrollableElement.addEventListener('scroll', () => {
      // 在滚动时，重新计算位置并通过回调函数通知外部
      const isAtBottom = checkScrollPosition(messageListRef);
      if (updateCallback) {
        updateCallback(isAtBottom);
      }
    });
  }
};

/**
 * 滚动到底部
 * @param {Object} messageListRef - 消息列表组件的引用
 */
export const scrollToBottom = (messageListRef) => {
  const scrollableElement = getScrollableElement(messageListRef);
  
  if (scrollableElement) {
    const { scrollHeight, clientHeight } = scrollableElement;
    const targetScrollTop = scrollHeight - clientHeight;
    
    // 使用平滑滚动动画
    scrollableElement.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  }
};