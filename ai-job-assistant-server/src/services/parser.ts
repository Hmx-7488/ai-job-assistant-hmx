/**
 * AI 响应解析服务
 * 负责将 AI 返回的原始文本解析为结构化的分析结果
 */

export interface AnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

/**
 * 默认的分析结果（用于降级处理）
 */
const DEFAULT_RESULT: AnalysisResult = {
  score: 0,
  strengths: [],
  weaknesses: ['AI 解析失败，无法提取有效信息'],
  suggestions: ['请重试或检查输入内容']
};

/**
 * 清理 AI 响应文本
 * 去除可能的 Markdown 代码块标记（```json ... ```）
 * @param rawText AI 返回的原始文本
 * @returns 清理后的 JSON 字符串
 */
function cleanAIResponse(rawText: string): string {
  let cleaned = rawText.trim();
  
  // 去除开头的 ```json 或 ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/, '');
  
  // 去除结尾的 ```
  cleaned = cleaned.replace(/\s*```$/, '');
  
  return cleaned.trim();
}

/**
 * 校验分析结果的字段类型
 * @param data 待校验的对象
 * @returns 是否为有效的 AnalysisResult
 */
function isValidAnalysisResult(data: any): data is AnalysisResult {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // 校验 score：必须是数字且在 0-100 之间
  if (typeof data.score !== 'number' || data.score < 0 || data.score > 100) {
    return false;
  }

  // 校验 strengths：必须是字符串数组
  if (!Array.isArray(data.strengths) || !data.strengths.every((item: any) => typeof item === 'string')) {
    return false;
  }

  // 校验 weaknesses：必须是字符串数组
  if (!Array.isArray(data.weaknesses) || !data.weaknesses.every((item: any) => typeof item === 'string')) {
    return false;
  }

  // 校验 suggestions：必须是字符串数组
  if (!Array.isArray(data.suggestions) || !data.suggestions.every((item: any) => typeof item === 'string')) {
    return false;
  }

  return true;
}

/**
 * 安全解析 AI 响应（别名函数，与 parseAIResponse 功能相同）
 * 保证无论 AI 输出如何，始终返回统一的 AnalysisResult 对象结构
 * @param rawText AI 返回的原始文本
 * @returns 结构化的分析结果（永远不会抛出异常）
 */
export function safeParseAnalysis(rawText: string): AnalysisResult {
  return parseAIResponse(rawText);
}

/**
 * 解析 AI 返回的原始文本为结构化数据
 * @param rawText AI 返回的原始文本
 * @returns 结构化的分析结果
 */
export function parseAIResponse(rawText: string): AnalysisResult {
  try {
    // 1. 清理文本（去除 Markdown 标记）
    const cleanedText = cleanAIResponse(rawText);
    
    console.log('Cleaned AI Response:', cleanedText.substring(0, 200) + '...');

    // 2. 尝试解析 JSON
    const parsed = JSON.parse(cleanedText);

    // 3. 校验字段类型
    if (isValidAnalysisResult(parsed)) {
      console.log('AI Response parsed successfully');
      return parsed;
    } else {
      console.warn('AI Response validation failed, using default result');
      return DEFAULT_RESULT;
    }

  } catch (error) {
    // 4. 解析失败时的降级处理
    console.error('Failed to parse AI response:', error);
    console.error('Raw text:', rawText.substring(0, 500));
    return DEFAULT_RESULT;
  }
}
