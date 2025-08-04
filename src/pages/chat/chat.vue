<template>
  <view class="chat-container" @click="handlePageClick">
    <!-- 消息列表区域 -->
    <view class="chat-messages" ref="messagesContainer">
      <view v-for="(msg, idx) in messages" :key="idx" :class="['msg-row', msg.role === 'user' ? 'msg-user' : 'msg-ai']" :id="'msg-' + idx">
        <ChatBubble>
          <template v-if="msg.role === 'ai'">
            <view v-html="renderMarkdown(msg.content)"></view>
          </template>
          <template v-else>
            <!-- 用户消息渲染 -->
            <view class="user-message" v-html="formatUserMessage(msg.content)"></view>
          </template>
        </ChatBubble>
      </view>
      <!-- 滚动定位元素 -->
      <view id="messages-bottom" style="height: 1px;"></view>
    </view>
    
    <!-- 新建会话按钮 -->
    <view class="new-chat-container">
      <NewChatButton @click="handleNewChat" />
    </view>
    
    <!-- 底部输入栏 -->
    <view class="chat-input-wrapper">
      <view class="chat-input-bar" @click="handlePanelClick">
        <view class="input-container">
          <textarea 
            class="chat-input" 
            v-model="inputValue" 
            placeholder="请输入消息..." 
            :auto-height="true"
            :show-confirm-bar="false"
            :cursor-spacing="20"
            :adjust-position="true"
            :hold-keyboard="true"
            :maxlength="1000"
          />
          <view class="plus-btn" @tap="toggleOptionsPanel">
            <view class="plus-icon"></view>
          </view>
        </view>
        <view class="send-btn" :class="{ 'send-btn--disabled': isSending }" @tap="Conversation">
          <view class="send-arrow"></view>
        </view>
      </view>
      
      <!-- 输入选项面板作为输入栏的子组件 -->
      <InputOptionsPanel 
        v-show="showOptionsPanel"
        @option-click="handlePanelOptionClick"
        @click="handlePanelClick"
      />
    </view>
    
    <!-- 会话列表面板 -->
    <ChatHistoryPanel 
      v-show="showHistoryPanel"
      @click="handleHistoryPanelClick"
      @select-chat="handleSelectChat"
      @close="handleHistoryPanelClose"
    />
  </view>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
import ChatBubble from '@/components/ChatBubble.vue';
import InputOptionsPanel from '@/components/InputOptionsPanel.vue';
import ChatHistoryPanel from '@/components/ChatHistoryPanel.vue';
import NewChatButton from '@/components/NewChatButton.vue';
import { chatApi } from '@/api.js';
import { renderMarkdown } from '@/utils/renderMarkdown.js';
import { createChatOptionsPanel, useGenericPanel, handleGenericPanelClick, createGenericPageClickHandler } from '@/utils/chatOptionsPanel.js';
import { createNewChat, continueChat, loadChatById } from '@/utils/chatStorageService.js';

// 格式化用户消息，处理换行符
const formatUserMessage = (content) => {
  if (!content) return '';
  // 将换行符转换为 <br> 标签
  return content.replace(/\n/g, '<br>');
};

const inputValue = ref('');
const messages = ref([]);

// 新增 session_id 状态
const sessionId = ref('');
const isSending = ref(false);

// 选项面板显示状态
const showOptionsPanel = ref(false);

// 聊天记录面板显示状态
const showHistoryPanel = ref(false);

// 消息容器引用
const messagesContainer = ref(null);

// 创建选项面板管理系统
const {
  toggleOptionsPanel,
  handlePanelOptionClick,
  handlePanelClick
} = createChatOptionsPanel(showOptionsPanel, showHistoryPanel);

// 创建会话列表面板管理器
const historyPanelManager = useGenericPanel(showHistoryPanel);

// 使用通用面板点击处理器
const handleHistoryPanelClick = handleGenericPanelClick;

// 处理新建会话
const handleNewChat = () => {
  // 清空 session_id
  sessionId.value = '';
  // 清空消息列表
  messages.value = [];
  // 清空输入框
  inputValue.value = '';
  console.log('新建会话，session_id 已清空');
};

// 处理会话选择
const handleSelectChat = (selectedSessionId) => {
  console.log('chat.vue 收到会话选择:', selectedSessionId);
  sessionId.value = selectedSessionId;
  
  // 根据session_id搜索对应的聊天信息
  const chatData = loadChatById(selectedSessionId);
  if (chatData) {
    // 将存储格式的消息转换为界面渲染格式
    const convertedMessages = [];
    chatData.messages.forEach(message => {
      // 添加用户消息
      if (message.user) {
        convertedMessages.push({
          role: 'user',
          content: message.user
        });
      }
      // 添加AI消息
      if (message.ai) {
        convertedMessages.push({
          role: 'ai',
          content: message.ai
        });
      }
    });
    
    // 更新界面消息列表
    messages.value = convertedMessages;
    
    console.log('历史消息已加载到界面，消息数量:', messages.value.length);
  } else {
    console.log('未找到会话数据:', selectedSessionId);
    // 清空当前消息列表
    messages.value = [];
  }
};

// 处理历史面板关闭
const handleHistoryPanelClose = () => {
  showHistoryPanel.value = false;
  showOptionsPanel.value = true; // 关闭历史面板时显示选项面板
};

// 使用通用页面点击处理器，统一管理所有面板
const handlePageClick = createGenericPageClickHandler([
  { showPanel: showOptionsPanel, manager: { close: () => showOptionsPanel.value = false } },
  { showPanel: showHistoryPanel, manager: historyPanelManager }
]);

// 滚动到消息底部
const scrollToBottom = () => {
  nextTick(() => {
    // 使用 uni-app 的 createSelectorQuery 滚动到底部元素
    const query = uni.createSelectorQuery();
    query.select('#messages-bottom').boundingClientRect((rect) => {
      if (rect) {
        // 滚动到指定元素
        uni.pageScrollTo({
          scrollTop: rect.top,
          duration: 200
        });
      }
    }).exec();
  });
};

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  scrollToBottom();
}, { deep: true });

// 流式消息内容累积变量
let aiContent = '';

//渲染AI消息
function handleAIMessage(chunk, msgIndex) {
  const lines = chunk.split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    try {
      const data = JSON.parse(line);
      if (data.code === 0) {
        if (data.session_id) sessionId.value = data.session_id;
        if (data.reply) {
          aiContent += data.reply;
          // 直接更新数组中的对象，Vue会自动检测变化
          messages.value[msgIndex].content = aiContent;
        }
      } else if (data.message) {
        messages.value[msgIndex].content = data.message;
      }
    } catch (e) {
      // 不是JSON，忽略
    }
  }
}

// 保存聊天记录到长期缓存
async function saveChatToStorage(userText, aiMessage) {
  if (sessionId.value) {
    // 检查session_id是否已存在于缓存中
    const existingChat = loadChatById(sessionId.value);
    if (existingChat) {
      // 存在，继续对话
      await continueChat(sessionId.value, userText, aiMessage);
    } else {
      // 不存在，创建新对话
      await createNewChat(sessionId.value, userText.substring(0, 20), userText, aiMessage);
    }
  } else {
    console.log('保存失败');
  }
}

//接收AI消息
async function receiveAIMessage(userText) {
  // 直接向messages数组中添加AI消息，并记录索引
  const aiMsgIndex = messages.value.length;
  messages.value.push({ role: 'ai', content: '' });
  aiContent = '';
  isSending.value = true;//发送中，禁用发送按钮
  try {
    await chatApi({
      message: userText,
      session_id: sessionId.value || undefined,
      onMessage: (chunk) => handleAIMessage(chunk, aiMsgIndex)
    });
    
    // AI消息接收完成后，存入缓存
    const aiMessage = messages.value[aiMsgIndex].content;
    await saveChatToStorage(userText, aiMessage);
  } catch (e) {
    // 直接通过索引更新
    messages.value[aiMsgIndex].content = 'AI服务异常';
  } finally {
    isSending.value = false;//结束，启用发送按钮
  }
}

//发送用户消息
function sendUserMessage() {
  const text = inputValue.value.trim();
  if (!text) return null;
  messages.value.push({ role: 'user', content: text });
  inputValue.value = '';
  return text;
}

//对话
async function Conversation() {
  const text = sendUserMessage();
  if (!text) return;
  await receiveAIMessage(text);
}

</script>

<style scoped>
.chat-container {
  min-height: 100vh;
  background: #e8e8e8;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 32rpx 24rpx 120rpx 24rpx;
  padding-bottom: 200rpx; /* 为底部输入框留出空间 */
}
.msg-row {
  display: flex;
  margin-bottom: 12rpx;
}
.msg-user {
  justify-content: flex-end;
}
.msg-ai {
  justify-content: flex-start;
}
.new-chat-container {
  position: fixed;
  left: 50%;
  bottom: 170rpx; /* 调整位置，避免与输入框重叠 */
  transform: translateX(-50%);
  z-index: 10;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 24rpx;
}

.chat-input-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: #fff;
}

.chat-input-bar {
  display: flex;
  align-items: center;
  padding: 24rpx 24rpx 32rpx 24rpx;
  background: #fff;
  box-sizing: border-box;
}
.input-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.chat-input {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 24rpx;
  padding: 18rpx 60rpx 18rpx 24rpx; /* 右侧留出空间给加号按钮 */
  font-size: 30rpx;
  outline: none;
  background: #f7fafd;
  min-height: 60rpx;
  max-height: 300rpx; /* 约5行的高度 */
  resize: none;
  overflow-y: auto;
  line-height: 1.5;
  word-wrap: break-word;
}

.send-btn {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  background: #e3f2fd;
  margin-left: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
  cursor: pointer;
  position: relative;
}
.send-btn--disabled {
  pointer-events: none;
  cursor: not-allowed;
}
.send-btn--disabled::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(180, 180, 180, 0.45);
  border-radius: 50%;
  z-index: 1;
}
.plus-btn {
  position: absolute;
  right: 8rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
}

.plus-icon {
  width: 28rpx;
  height: 28rpx;
  background: url('data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 4v12M4 10h12" stroke="%23666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>') no-repeat center/contain;
}

.send-arrow {
  width: 50rpx;
  height: 50rpx;
  background: url('data:image/svg+xml;utf8,<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="14" fill="none"/><path d="M8 14h12M16 10l4 4-4 4" stroke="%23339af0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>') no-repeat center/contain;
}

.user-message {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.5;
}


</style> 