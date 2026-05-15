import { Router } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { generateInterviewWithAI } from '../services/ai';
import { safeParseInterview } from '../services/interviewParser';
import type { InterviewGenerateRequest } from '../types/interview';
import {
  formatRetrievedKnowledge,
  retrieveKnowledge,
} from '../rag/retriever';

const router = Router();

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

router.get('/latest', async (req, res) => {
  const analysisId =
    typeof req.query.analysisId === 'string' ? req.query.analysisId.trim() : '';

  if (!analysisId) {
    return res.status(400).json({
      success: false,
      message: 'analysisId 不能为空',
    });
  }

  try {
    const questionSet = await prisma.interviewQuestionSet.findFirst({
      where: { analysisId },
      orderBy: { updatedAt: 'desc' },
    });

    if (!questionSet) {
      return res.status(404).json({
        success: false,
        message: '暂无已保存的面试题',
      });
    }

    return res.json({
      success: true,
      data: {
        interviewQuestionSetId: questionSet.id,
        analysisId: questionSet.analysisId,
        questionCount: questionSet.questionCount,
        summary: questionSet.summary,
        projectQuestions: questionSet.projectQuestions,
        fundamentalQuestions: questionSet.fundamentalQuestions,
        scenarioQuestions: questionSet.scenarioQuestions,
        behavioralQuestions: questionSet.behavioralQuestions,
        createdAt: questionSet.createdAt,
        updatedAt: questionSet.updatedAt,
      },
    });
  } catch (error) {
    console.error('Load latest interview questions failed:', error);
    return res.status(500).json({
      success: false,
      message: '读取面试题失败',
    });
  }
});

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

    const retrievalQuery = [
      analysis.job.jobTitle,
      analysis.job.jdText,
      ...toStringArray(analysis.strengths),
      ...toStringArray(analysis.weaknesses),
      ...toStringArray(analysis.suggestions),
    ].join('\n');

    const retrievedKnowledge = formatRetrievedKnowledge(
      retrieveKnowledge(retrievalQuery, 4)
    );

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
      retrievedKnowledge,
    });

    // 解析 AI 返回的结果
    const parsed = safeParseInterview(raw, count);
    const questionSet = await prisma.interviewQuestionSet.create({
      data: {
        analysisId: analysis.id,
        questionCount: count,
        summary: parsed.summary,
        projectQuestions: toJsonValue(parsed.projectQuestions),
        fundamentalQuestions: toJsonValue(parsed.fundamentalQuestions),
        scenarioQuestions: toJsonValue(parsed.scenarioQuestions),
        behavioralQuestions: toJsonValue(parsed.behavioralQuestions),
        rawResult: raw,
      },
    });

    return res.json({
      success: true,
      data: {
        interviewQuestionSetId: questionSet.id,
        analysisId: analysis.id,
        questionCount: count,
        createdAt: questionSet.createdAt,
        updatedAt: questionSet.updatedAt,
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
