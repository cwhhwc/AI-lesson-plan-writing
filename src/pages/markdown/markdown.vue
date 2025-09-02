<template>
  <view class="page-container">
    <!-- 1. 使用工具栏组件，并监听它发出的 command 事件 -->
    <EditorToolbar @command="handleToolbarCommand" />

    <!-- 编辑器 -->
    <editor
      id="editor"
      class="editor-area"
      placeholder="等待AI生成内容，或在此处开始编辑..."
      :read-only="isStreaming"
      @ready="onEditorReady"
      @input="onEditorInput"
    ></editor>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getDocumentByIdApi, exportDocumentApi } from '@/api.js' // 引入导出API
import { storeToRefs } from 'pinia'
import { useLessonPlanStore } from '@/stores/lessonPlan.js'
import 'katex/dist/katex.min.css'
import { renderMarkdown } from '@/utils/renderMarkdown.js'
import { useAutoSave } from '../../composables/useAutoSave.js'
import { triggerBrowserDownload } from '@/utils/downloader.js'; // 引入下载工具
import EditorToolbar from '../../components/EditorToolbar.vue'

// --- Pinia Store 连接 ---
const lessonPlanStore = useLessonPlanStore()
const { lessonPlanContent, isStreaming } = storeToRefs(lessonPlanStore)

// --- 编辑器核心变量 ---
let editorCtx = null
const pendingInitialHtml = ref(null)
const editorContent = ref('') // 用于暂存最新的编辑器HTML内容
const documentTitle = ref(''); // 新增：用于存储文档标题

// --- 自动保存相关 ---
const currentDocumentId = ref(null)
const { isSaving, scheduleAutoSave, latestHtml, saveDocument } = useAutoSave(currentDocumentId)

// --- 编辑器生命周期函数 ---
const onEditorReady = () => {
  uni.createSelectorQuery().select('#editor').context((res) => {
    editorCtx = res.context
    if (pendingInitialHtml.value !== null) {
      editorCtx.setContents({ html: pendingInitialHtml.value })
      pendingInitialHtml.value = null
      latestHtml.value = ''
    } else if (lessonPlanContent.value) {
      const initialHtml = renderMarkdown(lessonPlanContent.value)
      editorCtx.setContents({ html: initialHtml })
      latestHtml.value = initialHtml
    }
  }).exec()
}

// --- 核心数据流逻辑 ---
const onEditorInput = (e) => {
  if (isStreaming.value) return
  const currentHtml = e.detail.html;
  editorContent.value = currentHtml; // 更新暂存的内容
  lessonPlanStore.lessonPlanContent = currentHtml
  scheduleAutoSave(currentHtml)
}

watch(lessonPlanContent, (newMarkdown, oldMarkdown) => {
  if (!isStreaming.value) return
  if (!editorCtx || newMarkdown === oldMarkdown) return
  const newHtml = renderMarkdown(newMarkdown)
  editorCtx.setContents({ html: newHtml })
})

// --- 工具栏事件处理 ---
const handleToolbarCommand = (command) => {
  if (!editorCtx && command.name !== 'export' && command.name !== 'save') return;

  switch (command.name) {
    case 'save':
      saveDocument(editorContent.value); // 调用手动保存
      break;
    case 'export':
      handleExport(); // 调用导出
      break;
    case 'clear':
      editorCtx.removeFormat();
      break;
    default:
      editorCtx.format(command.name, command.value || '');
      break;
  }
}

// --- 导出业务逻辑 ---
const handleExport = async () => {
  if (!currentDocumentId.value) {
    uni.showToast({ title: '文档尚未保存，无法导出', icon: 'none' });
    return;
  }
  uni.showLoading({ title: '正在导出...' });
  try {
    const response = await exportDocumentApi({
      htmlId: currentDocumentId.value,
      title: documentTitle.value, // 使用当前标题
      content: editorContent.value // 发送最新的HTML内容，实现“保存并导出”
    });
    triggerBrowserDownload(response, `${documentTitle.value || 'document'}.docx`);
  } catch (error) {
    console.error('导出失败:', error);
    uni.showToast({ title: '导出失败', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
};

// --- 根据路由参数加载已保存教案 ---
async function loadDocumentIfNeeded(options) {
  const { id } = options || {}
  if (!id) return
  try {
    const doc = await getDocumentByIdApi(id)
    if (doc && doc.id) {
      setEditorContent(doc)
    } else {
      uni.showToast({ title: '未找到教案或无权限', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '加载教案失败', icon: 'none' })
  }
}

// 设置编辑器内容
function setEditorContent(doc) {
  const html = doc.content || ''
  documentTitle.value = doc.title || ''; // 保存标题
  if (editorCtx) {
    editorCtx.setContents({ html })
  } else {
    pendingInitialHtml.value = html
  }
  latestHtml.value = html
  editorContent.value = html // 暂存内容
}

onLoad((options) => {
  const docId = options && options.id ? options.id : null
  currentDocumentId.value = docId

  //检查 store 中是否已有内容，且id匹配
  if (saveDocument.value && saveDocument.value.id === docId){
    console.log('使用store中的教案数据初始化编辑器');
    setEditorContent(saveDocument.value);
    lessonPlanStore.setSavedDocument(null); // 清空store，避免重复加载
  }
  else {
    console.log('从API加载教案数据初始化编辑器');
    loadDocumentIfNeeded(options);
  }
})
</script>

<style scoped>
.page-container {
  padding: 10px;
  box-sizing: border-box;
  height: 95vh;
  display: flex;
  flex-direction: column;
}

.editor-area {
  flex: 1;
  width: 100%;
  height: 90%;
  box-sizing: border-box;
}

.editor-area[read-only] {
  background-color: #f5f5f5;
  opacity: 0.8;
}

/* 修复有序列表（ol）编号错误的CSS */
:deep(ol) {
  /* 创建一个名为 'list-counter' 的计数器 */
  counter-reset: list-counter;
  /* uniapp的rich-text默认有40px的padding，这里也设置一下以对齐 */
  padding-left: 40px;
}

:deep(li) {
  /* 移除li默认的项目符号 */
  list-style-type: none;
  position: relative;
}

:deep(ol > li::before) {
  /* 递增计数器并将值作为内容显示 */
  counter-increment: list-counter;
  content: counter(list-counter) ". "; /* 显示 "1. ", "2. ", etc. */
  
  /* 定位数字，使其看起来像默认列表 */
  position: absolute;
  left: -40px; /* 与ol的padding-left相对应 */
  width: 30px; /* 留出空间给数字 */
  text-align: right;
  font-weight: bold;
}
</style>