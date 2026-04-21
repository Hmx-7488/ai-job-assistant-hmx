import axios from 'axios';
import { getAnalysisPrompts } from '../prompt';

interface AnalyzeParams {
  jobTitle: string;
  jdText: string;
  resumeText: string;
}

function validateEnvironment(): string {
  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error(
      '缺少必要的环境变量 DASHSCOPE_API_KEY。\n' +
        '请在 .env 中配置 DASHSCOPE_API_KEY=your_api_key_here'
    );
  }

  return apiKey;
}

export async function analyzeResumeWithAI(params: AnalyzeParams): Promise<string> {
  const { jobTitle, jdText, resumeText } = params;
  const apiKey = validateEnvironment();
  const { systemPrompt, userPrompt } = getAnalysisPrompts(jobTitle, jdText, resumeText);

  try {
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
    if (!aiContent) {
      throw new Error('AI 服务未返回有效内容');
    }

    return aiContent;
  } catch (error) {
    console.error('调用 AI 服务失败:', error);

    if (error instanceof Error && error.message.includes('DASHSCOPE_API_KEY')) {
      throw error;
    }

    throw new Error('AI 分析服务异常');
  }
}
