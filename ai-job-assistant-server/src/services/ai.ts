import axios from 'axios';
import { getAnalysisPrompts } from '../prompt';

// 定义输入参数类型
interface AnalyzeParams {
  jobTitle: string;
  jdText: string;
  resumeText: string;
}

/**
 * 校验环境变量是否配置
 */
function validateEnvironment() {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  
  if (!apiKey || apiKey.trim() === '') {
    throw new Error(
      '缺少必要的环境变量 DASHSCOPE_API_KEY。\n' +
      '请在项目根目录创建 .env 文件，并添加：\n' +
      'DASHSCOPE_API_KEY=your_api_key_here\n' +
      '或者在系统环境变量中配置该变量。'
    );
  }
  
  return apiKey;
}

/**
 * 调用 AI 模型分析简历
 * @param params 包含岗位标题、JD 和简历文本
 * @returns 返回 AI 生成的原始字符串
 */
export async function analyzeResumeWithAI(params: AnalyzeParams): Promise<string> {
  const { jobTitle, jdText, resumeText } = params;

  // 0. 校验环境变量（在调用 AI 之前）
  const apiKey = validateEnvironment();

  // 1. 构建 Prompt (提示词) - 从 prompt.ts 获取
  const { systemPrompt, userPrompt } = getAnalysisPrompts(jobTitle, jdText, resumeText);

  try {
    // 2. 调用 AI 接口
    // 注意：请根据你的实际 AI 服务商修改 URL 和 Headers
    // 示例使用阿里云通义千问 DashScope API (qwen-turbo 或 qwen-plus)
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', 
      {
        model: 'qwen-turbo', // 或者 qwen-plus, qwen-max
        input: {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        },
        parameters: {
          result_format: 'message'
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    // 3. 解析并返回原始字符串
    // 不同 API 的返回结构不同，以下是阿里云 DashScope 的典型结构
    const aiContent = response.data?.output?.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error('AI 服务未返回有效内容');
    }

    return aiContent;

  } catch (error) {
    console.error('调用 AI 服务失败:', error);
    
    // 如果是环境变量错误，直接抛出原始错误
    if (error instanceof Error && error.message.includes('DASHSCOPE_API_KEY')) {
      throw error;
    }
    
    throw new Error('AI 分析服务异常');
  }
}