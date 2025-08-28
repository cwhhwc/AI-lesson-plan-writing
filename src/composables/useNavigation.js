/**
 * @description 统一处理应用内的页面跳转逻辑
 */
export function useNavigation() {

  /**
   * 跳转到 Markdown 页面
   * @param {object} params - 跳转参数，例如 { id: 123 } 或 { tempId: 'abc' }
   */
  const navigateToMarkdownPage = (params) => {
    if (!params || (params.id === undefined && params.tempId === undefined)) {
      console.error('导航失败：缺少 id 或 tempId 参数。');
      uni.showToast({ title: '无法打开文件' });
      return;
    }

    // 将参数对象转换为查询字符串
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    const url = `/pages/markdown/markdown?${queryString}`;

    uni.navigateTo({
      url
    });
  };

  // 未来可以扩展其他跳转，例如跳转到个人中心等
  // const navigateToUserProfile = (userId) => { ... };

  return {
    navigateToMarkdownPage
  };
}
