/**
 * 滚动检测工具
 * 提供滚动位置检测和状态管理功能
 */

import { useChatOptionsStore } from '@/stores/chatOptionsPanel.js';

/**
 * 公共函数：检查滚动位置并更新状态
 * @param {HTMLElement} scrollableElement - 可滚动的DOM元素
 * @returns {boolean} 是否在底部
 */
export const updateScrollState = (scrollableElement) => {
  if (scrollableElement) {
    const { scrollTop, scrollHeight, clientHeight } = scrollableElement;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5; // 5px容差
    
    // 通过store更新滚动状态
    const chatOptionsStore = useChatOptionsStore();
    chatOptionsStore.setScrollPosition(isAtBottom);
    return isAtBottom;
  }
  return true; // 默认认为在底部
};

/**
 * 获取可滚动元素
 * @param {Object} messageListRef - 消息列表组件的引用
 * @returns {HTMLElement|null} 可滚动的DOM元素
 */
export const getScrollableElement = (messageListRef) => {
  if (messageListRef?.value) {
    const messagesArea = messageListRef.value.$el;
    return messagesArea?.querySelector?.('.messages-content') || messagesArea;
  }
  return null;
};

/**
 * 设置滚动监听器
 * @param {Object} messageListRef - 消息列表组件的引用
 */
export const setupBottomDetection = (messageListRef) => {
  const scrollableElement = getScrollableElement(messageListRef);
  
  if (scrollableElement?.addEventListener) {
    scrollableElement.addEventListener('scroll', (event) => {
      updateScrollState(event.target);
    });
  }
};

/**
 * 检查当前滚动位置并更新状态
 * @param {Object} messageListRef - 消息列表组件的引用
 */
export const checkScrollPosition = (messageListRef) => {
  const scrollableElement = getScrollableElement(messageListRef);
  updateScrollState(scrollableElement);
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
    
    // 滚动完成后更新状态
    setTimeout(() => {
      updateScrollState(scrollableElement);
    }, 300); // 等待滚动动画完成
  }
};
