// src/stores/fileStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { updateDocumentApi, deleteDocumentApi, listDocumentsApi } from '@/api.js'; // 导入更新、删除和列表教案API

export const useFileStore = defineStore('file', () => {
  const files = ref([]);
  const isLoading = ref(false);
  const currentFileId = ref(null); // 可以用来追踪当前选中的文件

  const getFiles = computed(() => files.value);
  const getIsLoading = computed(() => isLoading.value);
  const getCurrentFileId = computed(() => currentFileId.value);

  /**
   * 获取用户文件列表
   */
  async function fetchFiles() {
    isLoading.value = true;
    try {
      const response = await listDocumentsApi({}); // 调用API获取文件列表，目前不传分页参数
      if (response) {
        files.value = response.map(file => ({
          id: file.id,
          name: file.title, // 将后端返回的 title 映射为 name
          updated_at: file.updated_at // 保留其他有用信息
        }));
      } else {
        files.value = [];
      }
    } catch (error) {
      console.error('获取文件列表失败:', error);
      uni.showToast({ title: '获取文件列表失败', icon: 'none' });
      files.value = []; // 失败时清空列表
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 重命名文件
   * @param {string} fileId - 文件的唯一ID
   * @param {string} newName - 文件的新名称
   */
  async function renameFile(fileId, newName) {
    try {
      // 调用后端API重命名文件
      const response = await updateDocumentApi(fileId, { title: newName });
      if (response.success) { // 假设后端返回 { success: true, message: "..." }
        // 更新本地状态
        const index = files.value.findIndex(file => file.id === fileId);
        if (index !== -1) {
          files.value[index].name = newName;
        }
        uni.showToast({ title: '重命名成功', icon: 'success' });
      } else {
        uni.showToast({ title: response.message || '重命名失败', icon: 'none' });
      }
    } catch (error) {
      console.error('重命名文件失败:', error);
      uni.showToast({ title: '重命名失败', icon: 'none' });
    }
  }

  /**
   * 删除文件
   * @param {string} fileId - 文件的唯一ID
   */
  async function deleteFile(fileId) {
    let deletedFile = null;
    const originalFiles = [...files.value]; // 备份原始文件列表用于回滚

    // 乐观更新：从本地状态中移除文件
    const index = files.value.findIndex(file => file.id === fileId);
    if (index !== -1) {
      deletedFile = files.value[index];
      files.value.splice(index, 1); // 移除文件
    } else {
      // 如果文件不存在，直接返回
      return;
    }

    // 处理 currentFileId
    const wasCurrent = currentFileId.value === fileId;
    if (wasCurrent) {
      currentFileId.value = null;
    }

    try {
      // 调用后端API删除文件
      await deleteDocumentApi(fileId);
      uni.showToast({ title: '删除成功', icon: 'success' });
    } catch (error) {
      console.error('删除文件失败:', error);
      // 悲观回滚：如果API调用失败，将文件加回原始位置
      files.value = originalFiles; // 恢复到删除前的状态
      if (wasCurrent) { // 如果之前是当前文件，恢复 currentFileId
        currentFileId.value = fileId;
      }
      uni.showToast({ title: '删除失败', icon: 'none' });
    }
  }

  /**
   * 选择文件
   * @param {string} fileId - 被选择文件的唯一ID
   */
  function selectFile(fileId) {
    currentFileId.value = fileId;
    console.log(`TODO: selectFile - 文件被选中: ${fileId}`);
    // 可以在这里添加其他逻辑，例如加载文件内容到预览区
  }

  return {
    files,
    isLoading,
    currentFileId,
    getFiles,
    getIsLoading,
    getCurrentFileId,
    fetchFiles,
    renameFile,
    deleteFile,
    selectFile,
  };
});
