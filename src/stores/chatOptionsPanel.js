/**
 * 聊天页面面板管理工具
 * 提供面板的显示控制、事件处理等功能
 */

import { defineStore } from 'pinia';
import { updateNavigationTitle } from '@/utils/titleManager.js';

/**
 * Pinia Store - 聊天选项面板状态管理
 */
export const useChatOptionsStore = defineStore('chatOptions', {
  state: () => ({
    showOptionsPanel: false,
    showHistoryPanel: false,
    // 新增：滚动状态管理
    isAtBottom: true,
    // 模式控制变量
    isWriteMode: false
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
    
    // 新增：滚动状态管理
    setScrollPosition(isAtBottom) {
      this.isAtBottom = isAtBottom;
    },
    
    // 更新导航栏标题
    updateTitle() {
      const modeConfig = {
        isWriteMode: '写教案模式'
        // 未来添加新模式: isAnalyzeMode: '分析模式'
      };
      const currentState = {
        isWriteMode: this.isWriteMode
        // 未来添加新模式: isAnalyzeMode: this.isAnalyzeMode
      };
      updateNavigationTitle(modeConfig, currentState);
    },
    
    // 设置模式 (确保只有一个为true)
    setMode(modeName, value) {
      // 先将所有模式设为false
      this.isWriteMode = false;
      // 再设置指定模式
      if (modeName === 'isWriteMode') this.isWriteMode = value;
      // 更新标题
      this.updateTitle();
    },
    
    // 选项处理
    handleOption(option, index) {
      // 根据不同选项执行相应逻辑
      switch (option.text) {
        case '聊天记录':
          this.handleHistoryOption();
          break;
        case '写教案':
          this.setMode('isWriteMode', !this.isWriteMode);
          break;
        // 可以继续添加其他选项的处理
        default:
          break;
      }
      
      // 处理完选项后关闭面板
      this.closeOptionsPanel();
    },
    
    handleHistoryOption() {
      // 处理历史记录逻辑
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