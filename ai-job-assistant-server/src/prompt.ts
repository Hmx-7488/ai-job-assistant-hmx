// src/prompt.ts

/**
 * 获取简历分析所需的 System 和 User Prompt
 * @param jobTitle 岗位名称
 * @param jdText 岗位描述
 * @param resumeText 简历内容
 * @returns 包含 systemPrompt 和 userPrompt 的对象
 */
export function getAnalysisPrompts(jobTitle: string, jdText: string, resumeText: string) {
  const systemPrompt = `你是一位拥有 10 年经验的资深技术招聘专家。
请根据提供的【岗位描述(JD)】和【候选人简历内容】进行深度匹配分析。

【输出要求】
1. 必须严格仅返回一个标准的 JSON 对象，不要包含 \`\`\`json 标记或其他任何解释性文字。
2. JSON 结构如下：
{
  "score": number, // 匹配度分数 0-100
  "strengths": string[], // 优势项，至少 3 条，每条不超过 20 字
  "weaknesses": string[], // 待补强项，至少 3 条，每条不超过 20 字
  "suggestions": string[] // 优化建议，至少 3 条，具体可执行
}
3. 如果简历内容与岗位完全无关，score 设为 10，并在 weaknesses 中说明。`;

  const userPrompt = `【输入数据】
岗位名称: ${jobTitle}
岗位描述:
${jdText}

简历内容:
${resumeText}`;

  return {
    systemPrompt,
    userPrompt
  };
}