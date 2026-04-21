import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { generateInterviewWithAI } from '../services/ai';
import { safeParseInterview } from '../services/interviewParser';
import type { InterviewGenerateRequest } from '../types/interview';

const router = Router();

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

router.post('/generate', async (req, res) => {
  const { analysisId, questionCount } = req.body as InterviewGenerateRequest;
  const count = Math.max(3, Math.min(20, Number(questionCount) || 8));

  if (!analysisId?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'analysisId 不能为空',
    });
  }

  try {
    // 拿取分析记录及相关的岗位和简历信息
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId.trim() },
      include: { job: true, resume: true },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: '分析记录不存在',
      });
    }

    const strengths = toStringArray(analysis.strengths);
    const weaknesses = toStringArray(analysis.weaknesses);
    const suggestions = toStringArray(analysis.suggestions);

    // 调用 AI 服务生成面试题
    const raw = await generateInterviewWithAI({
      jobTitle: analysis.job.jobTitle,
      companyName: analysis.job.companyName,
      jdText: analysis.job.jdText,
      resumeText: analysis.resume.text,
      score: analysis.score,
      strengths,
      weaknesses,
      suggestions,
      questionCount: count,
    });

    // 解析 AI 返回的结果
    const parsed = safeParseInterview(raw, count);

      return res.json({
      success: true,
      data: {
      analysisId: analysis.id,
      ...parsed,
  },
});

  } catch (error) {
    console.error('Interview generate failed:', error);
    return res.status(500).json({
      success: false,
      message: '面试题生成失败',
    });
  }
});

export default router;
