<template>
  <div class="chat-page">
    <header class="chat-header">
      <button class="back-btn" @click="goBack">返回</button>
      <div class="chat-header-content">
        <h1>AI 模拟面试</h1>
        <p>输入你的回答，和 AI 面试官进行模拟练习。</p>
      </div>
      <button
        class="clear-session-btn"
        type="button"
        :disabled="sending || clearingSession || !analysisId || !sessionId"
        @click="handleClearSession"
      >
        {{ clearingSession ? '清空中...' : '清空会话' }}
      </button>
    </header>

    <main class="chat-container">
      <section ref="messageListRef" class="message-list">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-row"
          :class="message.role"
        >
          <div class="message-bubble">
            <p class="message-text">{{ message.content }}</p>
            <button
              class="copy-btn"
              type="button"
              :aria-label="copiedMessageId === message.id ? '已复制消息' : '复制消息'"
              @click="copyMessage(message)"
            >
              {{ copiedMessageId === message.id ? '已复制' : '复制' }}
            </button>
          </div>
        </div>
      </section>

      <footer class="chat-input-bar">
        <textarea
          v-model="inputText"
          placeholder="请输入你的回答..."
          rows="2"
          :disabled="sending || !analysisId"
          @keydown.enter.exact.prevent="handleSend"
        />
        <button
          class="send-btn"
          :disabled="!inputText.trim() || sending || !analysisId"
          @click="handleSend"
        >
          {{ sending ? '发送中...' : '发送' }}
        </button>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  sequence: number;
  createdAt: string;
}

const API_BASE_URL = 'http://localhost:3000';

const route = useRoute();
const router = useRouter();

const getLatestSessionStorageKey = (id: string) => `latest-chat-session:${id}`;

const analysisId = ref('');
const inputText = ref('');
const sessionId = ref('');
const sending = ref(false);
const clearingSession = ref(false);
const messageListRef = ref<HTMLElement | null>(null);
const copiedMessageId = ref<string | null>(null);
let copyFeedbackTimer: ReturnType<typeof setTimeout> | null = null;

const messages = ref<ChatMessage[]>([]);

const rememberLatestSession = (analysis: string, session: string) => {
  if (!analysis || !session) {
    return;
  }

  window.localStorage.setItem(getLatestSessionStorageKey(analysis), session);
};

const clearRememberedSession = (analysis: string) => {
  if (!analysis) {
    return;
  }

  window.localStorage.removeItem(getLatestSessionStorageKey(analysis));
};

const loadSession = async (id: string) => {
  const response = await axios.get(`${API_BASE_URL}/api/chat/session/${id}`);

  if (!response.data?.success) {
    throw new Error(response.data?.message || '读取聊天记录失败');
  }

  const data = response.data.data;
  sessionId.value = data.session.id;
  messages.value = data.messages;
  rememberLatestSession(analysisId.value, sessionId.value);

  await scrollToBottom();
};

const createSession = async () => {
  const response = await axios.post(`${API_BASE_URL}/api/chat/session`, {
    analysisId: analysisId.value,
  });

  if (!response.data?.success) {
    throw new Error(response.data?.message || '创建聊天会话失败');
  }

  const data = response.data.data;
  sessionId.value = data.session.id;
  messages.value = data.messages;
  rememberLatestSession(analysisId.value, sessionId.value);

  await router.replace({
    path: '/chat',
    query: {
      analysisId: analysisId.value,
      sessionId: sessionId.value,
    },
  });

  await scrollToBottom();
};

const scrollToBottom = async () => {
  await nextTick();

  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
  }
};


const copyText = async (content: string) => {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(content);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = content;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
};

const copyMessage = async (message: ChatMessage) => {
  try {
    await copyText(message.content);
    copiedMessageId.value = message.id;

    if (copyFeedbackTimer) {
      clearTimeout(copyFeedbackTimer);
    }

    copyFeedbackTimer = setTimeout(() => {
      copiedMessageId.value = null;
    }, 1800);
  } catch (error) {
    console.error('Copy message failed:', error);
  }
};

const handleSend = async () => {
  const text = inputText.value.trim();

  if (!text || sending.value || !analysisId.value || !sessionId.value) {
    return;
  }

  sending.value = true;

  try {
    const response = await axios.post(`${API_BASE_URL}/api/chat/send`, {
      analysisId: analysisId.value,
      sessionId: sessionId.value,
      message: text,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || '聊天失败');
    }

    inputText.value = '';
    await loadSession(sessionId.value);
  } catch (error) {
    console.error('发送消息失败:', error);
  } finally {
    sending.value = false;
  }
};

const handleClearSession = async () => {
  if (!analysisId.value || !sessionId.value || sending.value || clearingSession.value) {
    return;
  }

  const confirmed = window.confirm('清空后当前会话记录将被删除，并重新创建一个新会话。是否继续？');
  if (!confirmed) {
    return;
  }

  clearingSession.value = true;

  try {
    const response = await axios.delete(`${API_BASE_URL}/api/chat/session/${sessionId.value}`, {
      params: {
        analysisId: analysisId.value,
      },
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || '清空会话失败');
    }

    clearRememberedSession(analysisId.value);
    sessionId.value = '';
    messages.value = [];
    inputText.value = '';

    await createSession();
  } catch (error) {
    console.error('清空会话失败:', error);
  } finally {
    clearingSession.value = false;
  }
};


const goBack = () => {
  if (analysisId.value) {
    router.push({
      path: '/analysis',
      query: {
        analysisId: analysisId.value,
        sessionId: sessionId.value || undefined,
      },
    });
    return;
  }

  router.push('/analysis');
};

onMounted(async () => {
  const rawAnalysisId = route.query.analysisId;
  const rawSessionId = route.query.sessionId;

  analysisId.value = typeof rawAnalysisId === 'string' ? rawAnalysisId.trim() : '';
  sessionId.value = typeof rawSessionId === 'string' ? rawSessionId.trim() : '';

  if (!analysisId.value) {
    return;
  }

  const rememberedSessionId = window.localStorage.getItem(
    getLatestSessionStorageKey(analysisId.value)
  );

  if (!sessionId.value && rememberedSessionId) {
    sessionId.value = rememberedSessionId;
  }

  try {
    if (sessionId.value) {
      await loadSession(sessionId.value);
    } else {
      await createSession();
    }
  } catch (error) {
    console.error('初始化聊天会话失败:', error);
  }
});


onBeforeUnmount(() => {
  if (copyFeedbackTimer) {
    clearTimeout(copyFeedbackTimer);
  }
});
</script>

<style scoped>
.chat-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  text-align: left;
}

.chat-header-content {
  flex: 1;
}

.chat-header h1 {
  margin: 0 0 6px;
  font-size: 28px;
}

.chat-header p {
  color: #666;
}

.back-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background: #676a6e;
  color: #fff;
  cursor: pointer;
}

.clear-session-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background: #f56c6c;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
}

.chat-container {
  border: 1px solid #ddd;
  border-radius: 12px;
  background: #fff;
  min-height: 620px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.message-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f7f8fa;
}

.message-row {
  display: flex;
  margin-bottom: 14px;
}

.message-row.user {
  justify-content: flex-end;
}

.message-row.assistant {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 14px;
  border-radius: 10px;
  line-height: 1.6;
  text-align: left;
  word-break: break-word;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-text {
  white-space: pre-wrap;
}

.message-row.user .message-bubble {
  background: #409eff;
  color: #fff;
  align-items: flex-end;
}

.message-row.assistant .message-bubble {
  background: #fff;
  color: #333;
  border: 1px solid #e5e7eb;
  align-items: flex-start;
}

.copy-btn {
  border: none;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.message-row.user .copy-btn {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

.message-row.assistant .copy-btn {
  background: #eef2ff;
  color: #3654d1;
}

.copy-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.chat-input-bar {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-top: 1px solid #ddd;
  background: #fff;
}

.chat-input-bar textarea {
  flex: 1;
  resize: none;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.send-btn {
  width: 88px;
  border: none;
  border-radius: 8px;
  background: #409eff;
  color: #fff;
  cursor: pointer;
  font-size: 15px;
}

.send-btn:disabled,
.chat-input-bar textarea:disabled,
.back-btn:disabled,
.clear-session-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 700px) {
  .chat-page {
    padding: 20px 12px;
  }

  .chat-container {
    min-height: 70vh;
  }

  .chat-header {
    flex-wrap: wrap;
  }

  .message-bubble {
    max-width: 85%;
  }

  .chat-input-bar {
    flex-direction: column;
  }

  .send-btn {
    width: 100%;
    height: 40px;
  }
}
</style>
