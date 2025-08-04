<template>
  <view class="markdown-container">
    <view class="markdown-content">
      <!-- Markdown内容将在这里渲染 -->
      <view class="md-html" v-html="html"></view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import 'katex/dist/katex.min.css'
import { renderMarkdown } from '@/utils/renderMarkdown.js'

// markdown内容响应式变量，可用于流式输入
const markdown = ref('')
const html = ref('')

// 监听markdown内容变化，实时渲染
watch(markdown, (newVal) => {
  html.value = renderMarkdown(newVal)
}, { immediate: true })

// ==================== 流式输入区域开始 ====================
// 在此处添加您的流式输入逻辑
// 例如：WebSocket接收、API轮询、定时器等

// 示例1：WebSocket流式输入
// const ws = new WebSocket('ws://your-server.com')
// ws.onmessage = (event) => {
//   markdown.value += event.data
// }

// 示例2：定时器模拟流式输入
// let streamIndex = 0
// const streamData = ['# 标题\n\n', '这是第一段内容\n\n', '## 子标题\n\n', '更多内容...']
// function streamInput() {
//   if (streamIndex < streamData.length) {
//     markdown.value += streamData[streamIndex]
//     streamIndex++
//     setTimeout(streamInput, 100)
//   }
// }
// streamInput()

// 示例3：API轮询流式输入
// async function pollStreamData() {
//   const response = await fetch('/api/stream-data')
//   const data = await response.json()
//   if (data.content) {
//     markdown.value += data.content
//   }
//   setTimeout(pollStreamData, 1000)
// }
// pollStreamData()

// 示例4：直接赋值（用于测试）
// markdown.value = '# 测试标题\n\n这是测试内容'

// ==================== 流式输入区域结束 ====================
</script>

<style scoped>
.markdown-container {
  background-color: #ffffff;
  min-height: 100vh;
  padding: 20px;
}

.markdown-content {
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

.md-html {
  margin-top: 24px;
}

/* 表格样式 */
.md-html :deep(table) {
  border-collapse: collapse;
  min-width: 600px;
  margin: 16px 0;
}

/* 表格容器横向滚动 */
.md-html :deep(table) {
  display: block;
  overflow-x: auto;
  white-space: nowrap;
}

/* 数学公式横向滚动 */
.md-html :deep(.katex-display) {
  overflow-x: auto;
  display: block;
  margin: 1em 0;
}

.md-html :deep(th),
.md-html :deep(td) {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.md-html :deep(th) {
  background-color: #f5f5f5;
  font-weight: bold;
}

.md-html :deep(tr:nth-child(even)) {
  background-color: #f9f9f9;
}

.md-html :deep(tr:hover) {
  background-color: #f0f0f0;
}
</style> 