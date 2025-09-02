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
    _handleLessonModeData(chunk) {
      if(this.isStart){
        // 已经找到标记，所有后续内容都追加到教案正文
        this.lessonPlanContent += chunk;
      }else{
        // 还未找到标记，在缓冲区中搜索
        const markerLength = START_MARKER.length;
        const tail = this.rawContent.slice(-(markerLength - 1));
        const searchArea = tail + chunk;

        const startIndexInSearchArea = searchArea.indexOf(START_MARKER);

        this.rawContent += chunk;

        if(startIndexInSearchArea !== -1){
          console.log('找到教案开始标记');
          // 找到标记
          this.isStart = true;
          const startIndexInRawContent = this.rawContent.length - searchArea.length + startIndexInSearchArea;

          const preInSearchArea = searchArea.slice(0, startIndexInSearchArea);
          const preInCurrentChunk = preInSearchArea.slice(tail.length);
          if (preInCurrentChunk && this.chatCallback) {
            this.chatCallback(preInCurrentChunk);
          }

          const postMarkerContent = this.rawContent.slice(startIndexInRawContent + markerLength);
          this.lessonPlanContent = postMarkerContent;

          this.rawContent = '';
        } else {
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