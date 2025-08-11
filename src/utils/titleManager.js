/**
 * 标题管理工具
 * 根据控制变量状态决定导航栏标题
 */

/**
 * 根据模式状态更新导航栏标题
 * @param {Object} modeConfig - 模式配置，格式：{ isWriteMode: '写教案模式' }
 * @param {Object} currentState - 当前状态，格式：{ isWriteMode: true }
 */
export function updateNavigationTitle(modeConfig, currentState) {
  let title = '聊天模式'; // 默认标题
  
  // 查找为true的控制变量对应的模式名字
  for (const [key, modeName] of Object.entries(modeConfig)) {
    if (currentState[key] === true) {
      title = modeName;
      break;
    }
  }
  
  if (typeof uni !== 'undefined' && uni.setNavigationBarTitle) {
    uni.setNavigationBarTitle({ title });
  } else if (typeof document !== 'undefined') {
    document.title = title;
    setTimeout(() => {
      const navTitle = document.querySelector('.uni-page-head-title');
      if (navTitle) navTitle.textContent = title;
    }, 50);
  }
}
