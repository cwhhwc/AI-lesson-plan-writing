/**
 * @description 根据API响应触发浏览器下载。该函数主要用于H5环境。
 * @param {object} response - 包含 data 和 headers 的完整API响应。`response.data` 应为 Blob 或 ArrayBuffer。
 * @param {string} defaultFilename - 如果无法从响应头解析到文件名，使用的默认文件名。
 */
export function triggerBrowserDownload(response, defaultFilename = 'document.docx') {
  // 检查是否在浏览器环境中，非浏览器环境无法执行此操作
  if (typeof window === 'undefined') {
    console.error('下载失败：非浏览器环境。');
    // 在非H5环境下，可以提示用户保存失败
    uni.showToast({ title: '仅支持在浏览器中下载文件', icon: 'none' });
    return;
  }

  // 1. 从响应头中解析文件名
  // content-disposition header 示例: attachment; filename="教案示例.docx"
  const disposition = response.headers['content-disposition'];
  let filename = defaultFilename;
  
  if (disposition && disposition.includes('attachment')) {
    // 使用正则表达式尝试提取文件名
    // 这能处理 filename="..." 和 filename*=UTF-8''... 两种格式
    const filenameMatch = /filename\*?=(?:UTF-8'')?([^;]+)/.exec(disposition);
    if (filenameMatch && filenameMatch[1]) {
      try {
        // 替换掉多余的引号，并用 decodeURIComponent 解码URL编码的字符 (例如 %20 会被转换为空格)
        filename = decodeURIComponent(filenameMatch[1].replace(/['|"]/g, ''));
      } catch (e) {
        console.error('解码文件名失败，将使用默认文件名:', e);
        // 如果解码失败，回退到默认文件名
        filename = defaultFilename;
      }
    }
  }

  // 2. 创建 Blob 对象，用于后续生成可下载的链接
  // response.data 此时应为 arraybuffer 或 blob 类型
  const blob = new Blob([response.data], {
    // 从响应头获取正确的MIME类型，如果获取不到，则使用通用的二进制流类型
    type: response.headers['content-type'] || 'application/octet-stream' 
  });

  // 3. 创建一个隐藏的 <a> 标签来触发下载
  const link = document.createElement('a');
  // 使用浏览器的 URL.createObjectURL API 为 Blob 数据创建一个临时的URL
  link.href = window.URL.createObjectURL(blob);
  // 设置 a 标签的 download 属性，浏览器会使用这个属性值作为下载文件的默认名
  link.download = filename;
  
  // 将 a 标签添加到页面中（设为不可见），这是触发点击事件的前提
  document.body.appendChild(link);
  // 编程方式模拟用户点击这个链接
  link.click();

  // 4. 清理工作：移除 a 标签，并释放临时的URL对象，避免内存泄漏
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href);
}
