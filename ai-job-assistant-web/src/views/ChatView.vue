<template>
  <div class="chat-page">
    <header class="chat-header">
      <button class="back-btn" @click="goBack">返回</button>
      <div>
        <h1>AI 模拟面试</h1>
        <p>输入你的回答，和 AI 面试官进行模拟练习。</p>
      </div>
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
            {{ message.content }}
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
import { nextTick, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

const API_BASE_URL = 'http://localhost:3000';

const route = useRoute();
const router = useRouter();

const analysisId = ref('');
const inputText = ref('');
const sending = ref(false);
const messageListRef = ref<HTMLElement | null>(null);

const messages = ref<ChatMessage[]>([
  {
    id: 1,
    role: 'assistant',
    content: '你好，我是 AI 面试官。请先做一个简短的自我介绍。',
  },
]);

const scrollToBottom = async () => {
  await nextTick();

  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
  }
};

const appendAssistantMessage = async (content: string) => {
  messages.value.push({
    id: Date.now(),
    role: 'assistant',
    content,
  });

  await scrollToBottom();
};

const handleSend = async () => {
  const text = inputText.value.trim();

  if (!text || sending.value) {
    return;
  }

  if (!analysisId.value) {
    await appendAssistantMessage('当前缺少 analysisId，请先从分析页进入模拟面试。');
    return;
  }

  const history = messages.value.map((item) => ({
    role: item.role,
    content: item.content,
  }));

  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: text,
  });

  inputText.value = '';
  sending.value = true;
  await scrollToBottom();

  try {
    const response = await axios.post(`${API_BASE_URL}/api/chat/send`, {
      analysisId: analysisId.value,
      message: text,
      history,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || '聊天失败');
    }

    const reply = response.data?.data?.reply;
    if (typeof reply !== 'string' || !reply.trim()) {
      throw new Error('后端未返回有效回复');
    }

    await appendAssistantMessage(reply.trim());
  } catch (error: unknown) {
    await appendAssistantMessage(error instanceof Error ? error.message : '聊天失败，请稍后重试');
  } finally {
    sending.value = false;
  }
};

const goBack = () => {
  if (analysisId.value) {
    router.push({
      path: '/analysis',
      query: {
        analysisId: analysisId.value,
      },
    });
    return;
  }

  router.push('/analysis');
};

onMounted(async () => {
  const rawAnalysisId = route.query.analysisId;
  analysisId.value = typeof rawAnalysisId === 'string' ? rawAnalysisId.trim() : '';

  if (!analysisId.value) {
    await appendAssistantMessage('未检测到分析记录，请先完成简历分析后再开始模拟面试。');
  } else {
    await scrollToBottom();
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
}

.message-row.user .message-bubble {
  background: #409eff;
  color: #fff;
}

.message-row.assistant .message-bubble {
  background: #fff;
  color: #333;
  border: 1px solid #e5e7eb;
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
.back-btn:disabled {
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
