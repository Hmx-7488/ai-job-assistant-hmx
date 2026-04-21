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

export interface InterviewPromptInput {
  jobTitle: string;
  companyName?: string | null;
  jdText: string;
  resumeText: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  questionCount: number;
}

export function getInterviewPrompts(input: InterviewPromptInput) {
  const total = Math.max(4, input.questionCount);
  const base = Math.floor(total / 4);
  const remain = total % 4;

  const projectCount = base + (remain > 0 ? 1 : 0);
  const fundamentalCount = base + (remain > 1 ? 1 : 0);
  const scenarioCount = base + (remain > 2 ? 1 : 0);
  const behavioralCount = base;

  const systemPrompt = `你是一名资深技术面试官。
请基于岗位、简历和分析结果，生成面试题。
只返回 JSON，不要 markdown，不要解释文字，不要多余字段。

必须返回如下结构：
{
  "summary": string,
  "projectQuestions": [
    {
      "question": string,
      "intent": string,
      "difficulty": "easy" | "medium" | "hard",
      "answerPoints": string[],
      "followUps": string[]
    }
  ],
  "fundamentalQuestions": [同上结构],
  "scenarioQuestions": [同上结构],
  "behavioralQuestions": [同上结构]
}

硬性要求：
1) 四类题目都必须有内容，不可为空数组
2) 数量严格等于：
   - projectQuestions: ${projectCount}
   - fundamentalQuestions: ${fundamentalCount}
   - scenarioQuestions: ${scenarioCount}
   - behavioralQuestions: ${behavioralCount}
3) 每题 answerPoints 至少 3 条
4) 问题要结合岗位和简历，不要泛泛而谈`;

  const userPrompt = `岗位名称: ${input.jobTitle}
公司名称: ${input.companyName ?? '未知'}
岗位JD:
${input.jdText}

简历文本:
${input.resumeText}

分析结果:
score: ${input.score}
strengths: ${JSON.stringify(input.strengths)}
weaknesses: ${JSON.stringify(input.weaknesses)}
suggestions: ${JSON.stringify(input.suggestions)}

总题量: ${total}`;

  return { systemPrompt, userPrompt };
}
