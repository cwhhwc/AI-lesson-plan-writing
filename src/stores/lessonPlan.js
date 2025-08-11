/**
 * 教案生成流式数据处理 Store
 * 专门负责处理后端发来的流式数据
 */

import { defineStore } from 'pinia';

const START_MARKER = '\n\n\n\n';

export const useLessonPlanStore = defineStore('lessonPlan', {
  state: () => ({
    //原始缓冲区
    rawContent: '',
    //是否已经找到开始标记
    isStart: false,
    // 用于存储流式传输的教案正文
    lessonPlanContent: '',
    // 用于标记流式传输是否正在进行
    isStreaming: false,
    // 当前模式：'chat' 或 'lesson'
    currentMode: 'chat',
    // 聊天数据回调函数
    chatCallback: null,
  }),
  
  actions: {
    // 设置模式和回调函数
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
    
    // 统一的数据中转处理函数
    processStreamData(chunk) {
      if (!this.isStreaming) return;
      
      // 聊天模式：直接转发到聊天处理
      if (this.currentMode === 'chat') {
        if (this.chatCallback) {
          this.chatCallback(chunk);
        }
        return;
      }
      
      // 写教案模式：处理标记分流
      if (this.currentMode === 'lesson') {
        this._handleLessonModeData(chunk);
      }
    },
    
    // 原有的追加内容逻辑，重命名为私有方法
    _handleLessonModeData(chunk) {
      if(this.isStart){
        this.lessonPlanContent += chunk;
      }else{
        const markerLength = START_MARKER.length;
        const tail = this.rawContent.slice(-(markerLength - 1));
        const searchArea = tail + chunk;

        const startIndexInSearchArea = searchArea.indexOf(START_MARKER);

        this.rawContent += chunk;

        if(startIndexInSearchArea !== -1){
          this.isStart = true;
          const startIndexInRawContent = this.rawContent.length - searchArea.length + startIndexInSearchArea;

          // 标记之前的内容转发到聊天模式
          const preMarkerContent = this.rawContent.slice(0, startIndexInRawContent);
          if (preMarkerContent && this.chatCallback) {
            this.chatCallback(preMarkerContent);
          }

          this.lessonPlanContent = this.rawContent.slice(startIndexInRawContent + markerLength);

          this.rawContent = '';
        } else {
          // 未找到标记，继续向聊天模式转发
          if (this.chatCallback) {
            this.chatCallback(chunk);
          }
        }
      }
    },
    
    // 兼容性：保留原有的appendContent方法
    appendContent(chunk) {
      this._handleLessonModeData(chunk);
    },
    
    // 结束流式传输
    endGeneration() {
      this.isStreaming = false;
    },
  },
});
