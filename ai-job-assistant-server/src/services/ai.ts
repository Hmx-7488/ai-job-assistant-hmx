import axios from 'axios';
import {
  ChatPromptInput,
  getAnalysisPrompts,
  getChatPrompts,
  getInterviewPrompts,
  InterviewPromptInput,
} from '../prompt';

interface AnalyzeParams {
  jobTitle: string;
  jdText: string;
  resumeText: string;
}

interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

function getAIConfig(): AIConfig {
  const mimoApiKey = process.env.MIMO_API_KEY?.trim();
  const dashscopeApiKey = process.env.DASHSCOPE_API_KEY?.trim();
  const apiKey = mimoApiKey || dashscopeApiKey;

  if (!apiKey) {
    throw new Error(
      'Missing required environment variable DASHSCOPE_API_KEY or MIMO_API_KEY.\n' +
        'Please set DASHSCOPE_API_KEY=your_api_key_here in .env'
    );
  }

  if (mimoApiKey) {
    return {
      apiKey,
      baseUrl: process.env.MIMO_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/v1',
      model: process.env.MIMO_MODEL || 'mimo-v2-pro',
    };
  }

  return {
    apiKey,
    baseUrl: process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: process.env.DASHSCOPE_MODEL || 'qwen-plus',
  };
}

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const { apiKey, baseUrl, model } = getAIConfig();

  try {
    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const aiContent = response.data?.choices?.[0]?.message?.content;
    if (!aiContent || typeof aiContent !== 'string' || !aiContent.trim()) {
      throw new Error('AI service returned empty content');
    }

    return aiContent.trim();
  } catch (error: any) {
    if (error.response) {
      console.error('AI API error:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

export async function analyzeResumeWithAI(params: AnalyzeParams): Promise<string> {
  const { jobTitle, jdText, resumeText } = params;
  const { systemPrompt, userPrompt } = getAnalysisPrompts(jobTitle, jdText, resumeText);

  try {
    return await callAI(systemPrompt, userPrompt);
  } catch (error) {
    console.error('Failed to call AI analysis service:', error);

    if (
      error instanceof Error &&
      (error.message.includes('DASHSCOPE_API_KEY') || error.message.includes('MIMO_API_KEY'))
    ) {
      throw error;
    }

    throw new Error('AI analysis service error');
  }
}

export async function generateInterviewWithAI(params: InterviewPromptInput): Promise<string> {
  const { systemPrompt, userPrompt } = getInterviewPrompts(params);

  try {
    return await callAI(systemPrompt, userPrompt);
  } catch (error) {
    console.error('Failed to call AI interview service:', error);

    if (
      error instanceof Error &&
      (error.message.includes('DASHSCOPE_API_KEY') || error.message.includes('MIMO_API_KEY'))
    ) {
      throw error;
    }

    throw new Error('AI interview service error');
  }
}

export async function sendChatWithAI(params: ChatPromptInput): Promise<string> {
  const { systemPrompt, userPrompt } = getChatPrompts(params);

  try {
    return await callAI(systemPrompt, userPrompt);
  } catch (error) {
    console.error('Failed to call AI chat service:', error);

    if (
      error instanceof Error &&
      (error.message.includes('DASHSCOPE_API_KEY') || error.message.includes('MIMO_API_KEY'))
    ) {
      throw error;
    }

    throw new Error('AI chat service error');
  }
}
