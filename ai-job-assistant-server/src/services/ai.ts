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

function validateEnvironment(): string {
  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error(
      'Missing required environment variable DASHSCOPE_API_KEY.\n' +
        'Please set DASHSCOPE_API_KEY=your_api_key_here in .env'
    );
  }

  return apiKey;
}

async function callDashScope(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = validateEnvironment();

  const response = await axios.post(
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    {
      model: 'qwen-turbo',
      input: {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      },
      parameters: {
        result_format: 'message',
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  const aiContent = response.data?.output?.choices?.[0]?.message?.content;
  if (!aiContent || typeof aiContent !== 'string' || !aiContent.trim()) {
    throw new Error('AI service returned empty content');
  }

  return aiContent.trim();
}

export async function analyzeResumeWithAI(params: AnalyzeParams): Promise<string> {
  const { jobTitle, jdText, resumeText } = params;
  const { systemPrompt, userPrompt } = getAnalysisPrompts(jobTitle, jdText, resumeText);

  try {
    return await callDashScope(systemPrompt, userPrompt);
  } catch (error) {
    console.error('Failed to call AI analysis service:', error);

    if (error instanceof Error && error.message.includes('DASHSCOPE_API_KEY')) {
      throw error;
    }

    throw new Error('AI analysis service error');
  }
}

export async function generateInterviewWithAI(params: InterviewPromptInput): Promise<string> {
  const { systemPrompt, userPrompt } = getInterviewPrompts(params);

  try {
    return await callDashScope(systemPrompt, userPrompt);
  } catch (error) {
    console.error('Failed to call AI interview service:', error);

    if (error instanceof Error && error.message.includes('DASHSCOPE_API_KEY')) {
      throw error;
    }

    throw new Error('AI interview service error');
  }
}

export async function sendChatWithAI(params: ChatPromptInput): Promise<string> {
  const { systemPrompt, userPrompt } = getChatPrompts(params);

  try {
    return await callDashScope(systemPrompt, userPrompt);
  } catch (error) {
    console.error('Failed to call AI chat service:', error);

    if (error instanceof Error && error.message.includes('DASHSCOPE_API_KEY')) {
      throw error;
    }

    throw new Error('AI chat service error');
  }
}
