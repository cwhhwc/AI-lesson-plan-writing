/**
 * 教案生成流式数据处理 Store
 * 专门负责写教案模式的数据分流和处理
 */

import { defineStore } from 'pinia';

const START_MARKER = '\n\n\n\n';

export const useLessonPlanStore = defineStore('lessonPlan', {
  state: () => ({
    // 原始缓冲区（用于搜索开始标记）
    rawContent: '',
    // 是否已经找到开始标记
    isStart: false,
    // 用于存储流式传输的教案正文
    lessonPlanContent: '',
    // 用于标记流式传输是否正在进行
    isStreaming: false,
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
    },
    
    // 统一的数据处理入口
    processStreamData(chunk) {
      if (!this.isStreaming) return;
      
      // 目前只处理教案模式，将来可扩展其他模式
      if (this.currentMode === 'lesson') {
        this._handleLessonModeData(chunk);
      }
      // 将来可以在这里添加其他模式的处理
      // else if (this.currentMode === 'analyze') {
      //   this._handleAnalyzeModeData(chunk);
      // }
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
          // 找到标记
          this.isStart = true;
          const startIndexInRawContent = this.rawContent.length - searchArea.length + startIndexInSearchArea;

          // 仅转发“当前chunk中、标记之前、且尚未发送”的部分，避免重复
          // 计算在 searchArea 中标记之前的内容
          const preInSearchArea = searchArea.slice(0, startIndexInSearchArea);
          // 去掉开头的 tail（来自上一包已发送的内容）后，得到当前chunk中需要补发的前半部分
          const preInCurrentChunk = preInSearchArea.slice(tail.length);
          if (preInCurrentChunk && this.chatCallback) {
            this.chatCallback(preInCurrentChunk);
          }

          // 标记之后的内容存入教案正文
          const postMarkerContent = this.rawContent.slice(startIndexInRawContent + markerLength);
          this.lessonPlanContent = postMarkerContent;

          // 清空缓冲区
          this.rawContent = '';
        } else {
          // 未找到标记，继续向聊天模式转发
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
