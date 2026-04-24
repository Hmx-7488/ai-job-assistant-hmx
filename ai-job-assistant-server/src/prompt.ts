export function getAnalysisPrompts(jobTitle: string, jdText: string, resumeText: string) {
  const systemPrompt = `你是一位有多年招聘经验的技术面试官和简历顾问。
请根据提供的岗位 JD 和候选人简历，输出一份客观、简洁、可执行的匹配分析。

输出要求：
1. 只返回一个标准 JSON 对象，不要返回 markdown，不要加解释文本。
2. JSON 结构必须为：
{
  "score": number,
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[]
}
3. score 取值范围为 0 到 100。
4. strengths、weaknesses、suggestions 至少各 3 条。
5. 每条内容简洁明确，尽量控制在一句话内。`;

  const userPrompt = `岗位名称: ${jobTitle}
岗位描述:
${jdText}

简历内容:
${resumeText}`;

  return {
    systemPrompt,
    userPrompt,
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

  const systemPrompt = `你是一名中文技术面试官。
请结合岗位信息、简历内容和分析结果，生成一组高质量模拟面试题。

输出要求：
1. 只返回标准 JSON，不要返回 markdown，不要附加解释。
2. JSON 结构必须为：
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
  "fundamentalQuestions": [...],
  "scenarioQuestions": [...],
  "behavioralQuestions": [...]
}
3. 四类题目都必须有内容。
4. 数量必须严格符合：
   - projectQuestions: ${projectCount}
   - fundamentalQuestions: ${fundamentalCount}
   - scenarioQuestions: ${scenarioCount}
   - behavioralQuestions: ${behavioralCount}
5. 每题 answerPoints 至少 3 条，followUps 至少 2 条。
6. 题目必须贴合岗位和简历，不要泛泛而谈。`;

  const userPrompt = `岗位名称: ${input.jobTitle}
公司名称: ${input.companyName ?? '未知'}
岗位 JD:
${input.jdText}

简历内容:
${input.resumeText}

分析结果:
score: ${input.score}
strengths: ${JSON.stringify(input.strengths)}
weaknesses: ${JSON.stringify(input.weaknesses)}
suggestions: ${JSON.stringify(input.suggestions)}

总题量: ${total}`;

  return { systemPrompt, userPrompt };
}

export interface ChatPromptMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatPromptInput {
  jobTitle: string;
  companyName?: string | null;
  jdText: string;
  resumeText: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  history: ChatPromptMessage[];
  message: string;
}

export function getChatPrompts(input: ChatPromptInput) {
  const historyText = input.history.length
    ? input.history
        .map((item, index) => `${index + 1}. ${item.role}: ${item.content}`)
        .join('\n')
    : '无历史对话';

  const systemPrompt = `你是一名中文技术面试官，正在进行模拟面试。
请结合岗位信息、简历内容和分析结果，与候选人进行多轮面试交流。

回复要求：
1. 直接返回纯文本，不要 markdown，不要 JSON。
2. 每次回复控制在 2 到 5 句话。
3. 语气专业、自然，像真实面试官。
4. 优先围绕项目经历、岗位匹配度、能力短板、场景题和行为题继续追问。
5. 如果候选人回答过于笼统，要要求补充细节。
6. 如果候选人回答较完整，可以先简短评价，再继续追问下一步。`;

  const userPrompt = `岗位名称: ${input.jobTitle}
公司名称: ${input.companyName ?? '未知'}
岗位 JD:
${input.jdText}

简历内容:
${input.resumeText}

分析结果:
score: ${input.score}
strengths: ${JSON.stringify(input.strengths)}
weaknesses: ${JSON.stringify(input.weaknesses)}
suggestions: ${JSON.stringify(input.suggestions)}

历史对话:
${historyText}

候选人本轮输入:
${input.message}`;

  return { systemPrompt, userPrompt };
}
