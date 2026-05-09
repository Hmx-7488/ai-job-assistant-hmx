// 封装模型配置
import { ChatOpenAI } from '@langchain/openai';

export function getChatModel() {
  const mimoApiKey = process.env.MIMO_API_KEY?.trim();
  const dashscopeApiKey = process.env.DASHSCOPE_API_KEY?.trim();
  const timeout = Number(process.env.AI_TIMEOUT_MS) || 30000;

  if (mimoApiKey) {
    return new ChatOpenAI({
      apiKey: mimoApiKey,
      model: process.env.MIMO_MODEL || 'mimo-v2-pro',
      temperature: 0.2,
      timeout,
      maxRetries: 1,
      configuration: {
        baseURL:
          process.env.MIMO_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/v1',
      },
    });
  }

  if (dashscopeApiKey) {
    return new ChatOpenAI({
      apiKey: dashscopeApiKey,
      model: process.env.DASHSCOPE_MODEL || 'qwen-plus',
      temperature: 0.2,
      timeout,
      maxRetries: 1,
      configuration: {
        baseURL:
          process.env.DASHSCOPE_BASE_URL ||
          'https://dashscope.aliyuncs.com/compatible-mode/v1',
      },
    });
  }

  throw new Error('Missing MIMO_API_KEY or DASHSCOPE_API_KEY');
}
