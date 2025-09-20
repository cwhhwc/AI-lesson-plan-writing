/**
 * 教案生成流式数据处理 Store
 * 专门负责写教案模式的数据分流和处理
 */

import { defineStore } from 'pinia';

// 教案正文开始的标记
const START_MARKER = '\n\n\n\n';

export const useLessonPlanStore = defineStore('lessonPlan', {
  state: () => ({
    // 原始缓冲区（用于搜索开始标记）
    rawContent: '',
    // 是否已经找到开始标记
    isStart: false,
    // 用于存储流式传输的教案正文 (Markdown格式)
    lessonPlanContent: '',
    // 用于标记流式传输是否正在进行
    isStreaming: false,
    // [新增] 用于存储从后端返回的、已存盘的教案对象
    savedDocument: null,
    // 当前处理模式（为将来扩展其他模式预留）
    currentMode: 'lesson',
    // 聊天数据回调函数（用于标记前内容）
    chatCallback: null,
  }),
  
  actions: {
    // 设置模式和回调函数（为将来扩展预留）
    setMode(mode, chatCallback = null) {
      this.currentMode = mode;
      this.chatCallback = chatCallback;
    },
    
    // 开始一次新的生成，清空旧数据
    startGeneration() {
      this.rawContent = '';
      this.isStart = false;
      this.lessonPlanContent = '';
      this.isStreaming = true;
      this.savedDocument = null; // 同时清空已保存的教案状态
    },

    // [新增] 设置已保存的教案对象
    setSavedDocument(document) {
      this.savedDocument = document;
    },
    
    // 统一的数据处理入口
    processStreamData(chunk) {
      if (!this.isStreaming) return;
      
      // 目前只处理教案模式，将来可扩展其他模式
      if (this.currentMode === 'lesson') {
        this._handleLessonModeData(chunk);
      }
    },
    
    // 处理教案数据：搜索标记并分流
    _handleLessonModeData(originalChunk) {
  // 将接收到的数据块中所有 '\n' (两个字符) 替换为 '\n' (一个换行符)。
  // 这是为了解决 AI 或数据流中存在的转义不一致问题，确保我们总是在处理标准换行符。
  const chunk = originalChunk.replace(/\\n/g, '\n');

  if(this.isStart){
    // 状态：已找到标记。所有后续（已归一化的）数据块都直接追加到教案正文。
    this.lessonPlanContent += chunk;
  }else{
    // 状态：未找到标记。在（已归一化的）缓冲区中继续搜索。
    const markerLength = START_MARKER.length;
    const tail = this.rawContent.slice(-(markerLength - 1));
    const searchArea = tail + chunk;

    const startIndexInSearchArea = searchArea.indexOf(START_MARKER);

    // 将当前（已归一化的）数据块存入缓冲区，供下一次拼接。
    this.rawContent += chunk;

    if(startIndexInSearchArea !== -1){
      // 找到了！
      this.isStart = true;
      
      // 从缓冲区中，把标记之前和之后的内容分割开
      const startIndexInRawContent = this.rawContent.length - searchArea.length + startIndexInSearchArea;
      
      // 标记之前的内容，需要通过回调传给聊天气泡显示
      const preInSearchArea = searchArea.slice(0, startIndexInSearchArea);
      const preInCurrentChunk = preInSearchArea.slice(tail.length);
      if (preInCurrentChunk && this.chatCallback) {
        this.chatCallback(preInCurrentChunk);
      }

      // 标记之后的内容，是教案的开头，存入 lessonPlanContent
      const postMarkerContent = this.rawContent.slice(startIndexInRawContent + markerLength);
      this.lessonPlanContent = postMarkerContent;

      // 清空缓冲区，因为它已经完成了它的历史使命
      this.rawContent = '';
    } else {
      // 本次依然没找到，将当前（已归一化的）数据块作为普通聊天内容处理
      if (this.chatCallback) {
        this.chatCallback(chunk);
      }
    }
  }
},
    
    // 结束流式传输
    endGeneration() {
      this.isStreaming = false;
    },
  },
});