import type { InterviewGenerateResult, InterviewQuestion } from '../types/interview';

function cleanAIResponse(rawText: string): string {
  return rawText.trim().replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === 'string');
}

function normalizeDifficulty(v: unknown): 'easy' | 'medium' | 'hard' {
  if (v === 'easy' || v === 'medium' || v === 'hard') return v;
  return 'medium';
}

function normalizeQuestion(item: unknown, defaultCategory: string): InterviewQuestion | null {
  if (!item || typeof item !== 'object') return null;
  const obj = item as Record<string, unknown>;
  if (typeof obj.question !== 'string' || !obj.question.trim()) return null;

  return {
    category: typeof obj.category === 'string' && obj.category.trim() ? obj.category : defaultCategory,
    question: obj.question.trim(),
    intent: typeof obj.intent === 'string' ? obj.intent : '考察综合能力',
    difficulty: normalizeDifficulty(obj.difficulty),
    answerPoints: toStringArray(obj.answerPoints),
    followUps: toStringArray(obj.followUps),
  };
}

function parseQuestionList(value: unknown, defaultCategory: string): InterviewQuestion[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => normalizeQuestion(item, defaultCategory))
    .filter((x): x is InterviewQuestion => !!x);
}

function allocate(count: number) {
  const total = Math.max(4, count);
  const base = Math.floor(total / 4);
  const remain = total % 4;
  return {
    project: base + (remain > 0 ? 1 : 0),
    fundamental: base + (remain > 1 ? 1 : 0),
    scenario: base + (remain > 2 ? 1 : 0),
    behavioral: base,
  };
}

function fallbackList(prefix: string, n: number): InterviewQuestion[] {
  return Array.from({ length: n }).map((_, i) => ({
    category: prefix,
    question: `${prefix}第 ${i + 1} 题：请结合真实经历回答。`,
    intent: '考察结构化表达与复盘能力',
    difficulty: 'medium',
    answerPoints: ['背景', '行动', '结果'],
    followUps: ['如果重做，你会怎么优化？'],
  }));
}

export function safeParseInterview(rawText: string, questionCount: number): InterviewGenerateResult {
  const c = allocate(questionCount);

  const fallback: InterviewGenerateResult = {
    summary: 'AI 输出异常，返回兜底题目',
    projectQuestions: fallbackList('项目题', c.project),
    fundamentalQuestions: fallbackList('基础题', c.fundamental),
    scenarioQuestions: fallbackList('场景题', c.scenario),
    behavioralQuestions: fallbackList('行为题', c.behavioral),
  };

  try {
    const parsed = JSON.parse(cleanAIResponse(rawText)) as Record<string, unknown>;

    const result: InterviewGenerateResult = {
      summary: typeof parsed.summary === 'string' ? parsed.summary : '面试题已生成',
      projectQuestions: parseQuestionList(parsed.projectQuestions, '项目题').slice(0, c.project),
      fundamentalQuestions: parseQuestionList(parsed.fundamentalQuestions, '基础题').slice(0, c.fundamental),
      scenarioQuestions: parseQuestionList(parsed.scenarioQuestions, '场景题').slice(0, c.scenario),
      behavioralQuestions: parseQuestionList(parsed.behavioralQuestions, '行为题').slice(0, c.behavioral),
    };

    if (
      result.projectQuestions.length === 0 ||
      result.fundamentalQuestions.length === 0 ||
      result.scenarioQuestions.length === 0 ||
      result.behavioralQuestions.length === 0
    ) {
      return fallback;
    }

    return result;
  } catch {
    return fallback;
  }
}
