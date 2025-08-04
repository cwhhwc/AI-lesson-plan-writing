/**
 * 聊天页面选项面板管理工具
 * 提供选项面板的显示控制、事件处理等功能
 */

/**
 * 通用面板管理器 - 统一管理任意面板的显示、隐藏和状态
 * @param {Object} showPanel - Vue ref对象，控制面板显示状态
 * @returns {Object} 包含toggle、close、preventClose方法的对象
 */
export const useGenericPanel = (showPanel) => {
  const toggle = (e) => {
    e?.stopPropagation(); // 防止事件冒泡
    showPanel.value = true;
  };

  const close = () => {
    showPanel.value = false;
  };

  const preventClose = (e) => {
    e.stopPropagation();
  };

  return { toggle, close, preventClose };
};

/**
 * 选项面板管理器 - 基于通用面板管理器的特定实现
 * @param {Object} showOptionsPanel - Vue ref对象，控制面板显示状态
 * @returns {Object} 包含toggle、close、preventClose方法的对象
 */
export const useOptionsPanel = (showOptionsPanel) => {
  return useGenericPanel(showOptionsPanel);
};

/**
 * 选项处理器 - 处理选项面板中的各种选项点击事件
 * @param {Object} panelManager - 面板管理器实例
 * @param {Object} showHistoryPanel - Vue ref对象，控制会话列表显示状态
 * @returns {Object} 包含handleOption方法的对象
 */
export const useOptionHandler = (panelManager, showHistoryPanel) => {
  const handleOption = (option, index) => {
    console.log('聊天页面收到选项点击:', option, '索引:', index);
    
    // 根据不同选项执行相应逻辑
    switch (option.text) {
      case '聊天记录':
        console.log('聊天记录在处理');
        handleHistoryOption();
        break;
      // 可以继续添加其他选项的处理
      default:
        console.log('未知选项:', option.text);
    }
    
    // 处理完选项后关闭面板
    panelManager.close();
  };

  const handleHistoryOption = () => {
    // 处理历史记录逻辑
    console.log('处理历史记录');
    if (showHistoryPanel) {
      showHistoryPanel.value = true;
    }
  };

  return { handleOption };
};

/**
 * 通用面板点击事件处理器 - 阻止事件冒泡
 * @param {Event} e - 事件对象
 */
export const handleGenericPanelClick = (e) => {
  e.stopPropagation();
};

/**
 * 通用页面点击处理器 - 关闭多个面板
 * @param {Array} panels - 面板数组，每个元素包含 {showPanel, manager}
 * @returns {Function} 页面点击处理函数
 */
export const createGenericPageClickHandler = (panels) => {
  return (e) => {
    panels.forEach(({ showPanel, manager }) => {
      if (showPanel.value) {
        manager.close();
      }
    });
  };
};

/**
 * 页面事件处理器 - 统一处理页面级别的点击事件
 * @param {Object} showOptionsPanel - Vue ref对象，控制面板显示状态
 * @param {Object} panelManager - 面板管理器实例
 * @returns {Object} 包含handlePageClick、handlePanelClick方法的对象
 */
export const usePageEvents = (showOptionsPanel, panelManager) => {
  const handlePageClick = (e) => {
    if (showOptionsPanel.value) {
      panelManager.close();
    }
  };

  const handlePanelClick = (e) => {
    panelManager.preventClose(e);
  };

  return { handlePageClick, handlePanelClick };
};

/**
 * 创建完整的选项面板管理系统
 * @param {Object} showOptionsPanel - Vue ref对象，控制面板显示状态
 * @param {Object} showHistoryPanel - Vue ref对象，控制会话列表显示状态
 * @returns {Object} 包含所有需要的方法和管理器的对象
 */
export const createChatOptionsPanel = (showOptionsPanel, showHistoryPanel) => {
  // 创建各个管理器实例
  const panelManager = useOptionsPanel(showOptionsPanel);//面板管理器
  const optionHandler = useOptionHandler(panelManager, showHistoryPanel);//选项处理器
  const pageEvents = usePageEvents(showOptionsPanel, panelManager);//页面事件处理器

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