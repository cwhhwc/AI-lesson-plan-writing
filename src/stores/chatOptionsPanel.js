/**
 * 聊天页面面板管理工具
 * 提供面板的显示控制、事件处理等功能
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
    // 选项面板控制
    toggleOptionsPanel(e) {
      e?.stopPropagation(); // 防止事件冒泡
      this.showOptionsPanel = true;
    },
    
    // 关闭选项面板
    closeOptionsPanel() {
      this.showOptionsPanel = false;
    },
    
    // 防止选项面板关闭
    preventOptionsPanelClose(e) {
      e.stopPropagation();
    },
    
    // 历史面板控制
    toggleHistoryPanel(e) {
      e?.stopPropagation();
      this.showHistoryPanel = true;
    },

    // 关闭历史面板
    closeHistoryPanel() {
      this.showHistoryPanel = false;
    },
    
    // 防止历史面板关闭
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

    // 选项面板点击事件处理
    handlePanelClick(e) {
      this.preventOptionsPanelClose(e);
    }
  }
});