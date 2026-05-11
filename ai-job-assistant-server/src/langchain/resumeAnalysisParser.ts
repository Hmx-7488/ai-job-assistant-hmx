import { JsonOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

// OutputParser：把 AI 返回的 JSON 文本 转成 JS 对象
// zod定义对象标准格式，并返回一个 zod 对象，用于验证和转换数据
export const resumeAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).min(1),
  suggestions: z.array(z.string()).min(1),
});

// 从zod schema导出ts类型
export type ResumeAnalysisResult = z.infer<typeof resumeAnalysisSchema>;

export const resumeAnalysisParser =
  new JsonOutputParser<ResumeAnalysisResult>();

export function validateResumeAnalysisResult(
  result: unknown
): ResumeAnalysisResult {
  return resumeAnalysisSchema.parse(result);
}
