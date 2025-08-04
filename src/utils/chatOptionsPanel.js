/**
 * 聊天页面选项面板管理工具
 * 提供选项面板的显示控制、事件处理等功能
 */

import { defineStore } from 'pinia';

/**
 * Pinia Store - 聊天选项面板状态管理
 */
export const useChatOptionsStore = defineStore('chatOptions', {
  state: () => ({
    showOptionsPanel: false,
    showHistoryPanel: false
  }),
  
  actions: {
    // 面板显示控制
    toggleOptionsPanel(e) {
      e?.stopPropagation(); // 防止事件冒泡
      this.showOptionsPanel = true;
    },
    
    closeOptionsPanel() {
      this.showOptionsPanel = false;
    },
    
    preventOptionsPanelClose(e) {
      e.stopPropagation();
    },
    
    // 历史面板控制
    toggleHistoryPanel(e) {
      e?.stopPropagation();
      this.showHistoryPanel = true;
    },
    
    closeHistoryPanel() {
      this.showHistoryPanel = false;
    },
    
    preventHistoryPanelClose(e) {
      e.stopPropagation();
    },
    
    // 选项处理
    handleOption(option, index) {
      console.log('聊天页面收到选项点击:', option, '索引:', index);
      
      // 根据不同选项执行相应逻辑
      switch (option.text) {
        case '聊天记录':
          console.log('聊天记录在处理');
          this.handleHistoryOption();
          break;
        // 可以继续添加其他选项的处理
        default:
          console.log('未知选项:', option.text);
      }
      
      // 处理完选项后关闭面板
      this.closeOptionsPanel();
    },
    
    handleHistoryOption() {
      // 处理历史记录逻辑
      console.log('处理历史记录');
      this.showHistoryPanel = true;
    },
    
    // 页面事件处理
    handlePageClick(e) {
      if (this.showOptionsPanel) {
        this.closeOptionsPanel();
      }
      if (this.showHistoryPanel) {
        this.closeHistoryPanel();
      }
    },
    
    handlePanelClick(e) {
      this.preventOptionsPanelClose(e);
    }
  }
});



/**
 * 创建完整的选项面板管理系统
 * @param {Object} showOptionsPanel - Vue ref对象，控制面板显示状态
 * @param {Object} showHistoryPanel - Vue ref对象，控制会话列表显示状态
 * @returns {Object} 包含所有需要的方法和管理器的对象
 */
export const createChatOptionsPanel = (showOptionsPanel, showHistoryPanel) => {
  // 使用 Pinia Store
  const store = useChatOptionsStore();
  
  // 创建各个管理器实例 - 使用 Store 方法
  const panelManager = {
    toggle: store.toggleOptionsPanel,
    close: store.closeOptionsPanel,
    preventClose: store.preventOptionsPanelClose
  };
  
  const optionHandler = {
    handleOption: store.handleOption
  };
  
  const pageEvents = {
    handlePageClick: store.handlePageClick,
    handlePanelClick: store.handlePanelClick
  };

  return {
    // 导出给模板使用的函数
    toggleOptionsPanel: panelManager.toggle,
    handlePanelOptionClick: optionHandler.handleOption,
    handlePageClick: pageEvents.handlePageClick,
    handlePanelClick: pageEvents.handlePanelClick,
    // 也可以导出各个管理器实例，便于进一步扩展
    panelManager,
    optionHandler,
    pageEvents
  };
};

// 为了保持向后兼容，提供与原函数相同接口的包装函数
export const useGenericPanel = (showPanel) => {
  const store = useChatOptionsStore();
  return {
    toggle: store.toggleOptionsPanel,
    close: store.closeOptionsPanel,
    preventClose: store.preventOptionsPanelClose
  };
};

export const useOptionsPanel = (showOptionsPanel) => {
  return useGenericPanel(showOptionsPanel);
};

export const useOptionHandler = (panelManager, showHistoryPanel) => {
  const store = useChatOptionsStore();
  return {
    handleOption: store.handleOption
  };
};

export const handleGenericPanelClick = (e) => {
  e.stopPropagation();
};

export const createGenericPageClickHandler = (panels) => {
  const store = useChatOptionsStore();
  return (e) => {
    store.handlePageClick(e);
  };
};

export const usePageEvents = (showOptionsPanel, panelManager) => {
  const store = useChatOptionsStore();
  return {
    handlePageClick: store.handlePageClick,
    handlePanelClick: store.handlePanelClick
  };
};