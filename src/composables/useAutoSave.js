import { ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { updateDocumentApi } from '@/api.js'

export function useAutoSave(currentDocumentId) {
  const latestHtml = ref('')
  const saveTimer = ref(null)
  const isSaving = ref(false)

  onLoad(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }
  })

  onUnload(() => {
    if (saveTimer.value) {
      clearTimeout(saveTimer.value)
      saveTimer.value = null
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  })

  // --- 核心保存逻辑 ---
  async function saveDocument(contentToSave, options = { silent: false }) {
    if (!currentDocumentId.value || isSaving.value) return

    if (!options.silent) {
      uni.showLoading({ title: '保存中...' });
    }
    isSaving.value = true;

    try {
      await updateDocumentApi(currentDocumentId.value, { content: contentToSave });
      if (!options.silent) {
        uni.hideLoading();
        uni.showToast({ title: '保存成功', icon: 'success' });
      }
    } catch (e) {
      if (!options.silent) {
        uni.hideLoading();
      }
      // 失败时做轻提示
      uni.showToast({ title: options.silent ? '自动保存失败' : '保存失败', icon: 'none' });
    } finally {
      isSaving.value = false;
    }
  }

  // --- 自动保存：静置 1 秒后更新后端内容 ---
  function scheduleAutoSave(newHtml) {
    latestHtml.value = typeof newHtml === 'string' ? newHtml : latestHtml.value
    if (!currentDocumentId.value) return
    if (saveTimer.value) clearTimeout(saveTimer.value)
    saveTimer.value = setTimeout(() => {
      // 定时器触发后立即置空，避免在已触发保存时仍被视为“未保存”
      saveTimer.value = null
      saveDocument(latestHtml.value, { silent: true })
    }, 1000)
  }

  // --- 离开前提示：仅在存在未触发的自动保存任务时提示 ---
  function handleBeforeUnload(e) {
    if (saveTimer.value) {
      e.preventDefault()
      e.returnValue = ''
    }
  }

  return {
    scheduleAutoSave,
    isSaving,
    latestHtml, // 也返回 latestHtml 以便在 loadDocumentIfNeeded 中设置初始值
    saveDocument
  }
}
