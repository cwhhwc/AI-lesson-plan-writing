<template>
  <view class="chat-container" @click="handlePageClick">
    <!-- 消息列表区域 -->
    <view class="chat-messages" ref="messagesContainer">
      <view v-for="(msg, idx) in messages" :key="idx" :class="['msg-row', msg.role === 'user' ? 'msg-user' : 'msg-ai']" :id="'msg-' + idx">
        <ChatBubble>
          <template v-if="msg.role === 'ai'">
            <view class="ai-message" v-html="renderMarkdown(msg.content)"></view>
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
    <ChatInput 
      ref="chatInputRef"
      @send-message="handleSendMessage"
    />
    
    <!-- 会话列表面板 -->
    <ChatHistoryPanel 
      v-show="chatOptionsStore.showHistoryPanel"
      @click="(e) => e.stopPropagation()"
      @select-chat="handleSelectChat"
      @close="handleHistoryPanelClose"
    />
  </view>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
import ChatBubble from '@/components/ChatBubble.vue';
import ChatHistoryPanel from '@/components/ChatHistoryPanel.vue';
import NewChatButton from '@/components/NewChatButton.vue';
import { chatApi } from '@/api.js';
import { renderMarkdown } from '@/utils/renderMarkdown.js';
import { useChatOptionsStore } from '@/utils/chatOptionsPanel.js';
import { createNewChat, continueChat, loadChatById } from '@/utils/chatStorageService.js';
import ChatInput from '@/components/ChatInput.vue';

// 格式化用户消息，处理换行符
const formatUserMessage = (content) => {
  if (!content) return '';
  // 将换行符转换为 <br> 标签
  return content.replace(/\n/g, '<br>');
};

const messages = ref([]);

// 新增 session_id 状态
const sessionId = ref('');

// 使用 Pinia Store
const chatOptionsStore = useChatOptionsStore();

// 消息容器引用
const messagesContainer = ref(null);

// ChatInput 组件引用
const chatInputRef = ref(null);

// 处理新建会话
const handleNewChat = () => {
  // 清空 session_id
  sessionId.value = '';
  // 清空消息列表
  messages.value = [];
  // 清空输入框
  if (chatInputRef.value) {
    chatInputRef.value.setInputValue('');
  }
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

// 处理发送消息
const handleSendMessage = (text) => {
  console.log('收到发送消息:', text);
  // 添加用户消息到列表
  messages.value.push({ role: 'user', content: text });
  // 调用AI接口
  receiveAIMessage(text);
};

// 处理历史面板关闭
const handleHistoryPanelClose = () => {
  chatOptionsStore.closeHistoryPanel();
  chatOptionsStore.toggleOptionsPanel(); // 关闭历史面板时显示选项面板
};

// 使用通用页面点击处理器，统一管理所有面板
const handlePageClick = (e) => {
  chatOptionsStore.handlePageClick(e);
};

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
          duration: 100
        });
        console.log('滚动完成');
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
  
  // 设置发送状态
  if (chatInputRef.value) {
    chatInputRef.value.setIsSending(true);
  }
  
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
    // 结束，启用发送按钮
    if (chatInputRef.value) {
      chatInputRef.value.setIsSending(false);
    }
  }
}


</script>

<style scoped>
.chat-container {
  min-height: 90vh;
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



.user-message {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.5;
  /* 启用文本选择 */
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  cursor: text;
}

.ai-message {
  /* 启用文本选择 */
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  cursor: text;
  line-height: 1.5;
}


</style> 