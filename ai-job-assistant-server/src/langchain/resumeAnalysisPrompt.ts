import { ChatPromptTemplate } from '@langchain/core/prompts';

export interface ResumeAnalysisPromptInput {
  jobTitle: string;
  jdText: string;
  resumeText: string;
}

export const resumeAnalysisPrompt =
  ChatPromptTemplate.fromMessages([
    [
      'system',
      [
        '你是一名有经验的技术招聘面试官和简历顾问。',
        '请根据用户提供的岗位 JD 和候选人简历，输出客观、简洁、可执行的匹配分析。',
        '',
        '输出要求：',
        '1. 只返回标准 JSON，不要返回 markdown，不要添加解释文本。',
        '2. JSON 必须包含以下字段：',
        '{{',
        '  "score": number,',
        '  "strengths": string[],',
        '  "weaknesses": string[],',
        '  "suggestions": string[]',
        '}}',
        '3. score 范围是 0 到 100。',
        '4. strengths、weaknesses、suggestions 每项至少 3 条。',
        '5. 每条内容尽量控制在一句话内。',
      ].join('\n'),
    ],
    [
      'human',
      [
        '岗位名称：{jobTitle}',
        '',
        '岗位 JD：',
        '{jdText}',
        '',
        '简历内容：',
        '{resumeText}',
      ].join('\n'),
    ],
  ]);
