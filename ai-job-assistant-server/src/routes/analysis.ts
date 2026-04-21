import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { analyzeResumeWithAI } from '../services/ai';
import { safeParseAnalysis } from '../services/parser';

const router = Router();

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

router.post('/run', async (req, res) => {
  const { jobId, resumeId } = req.body as {
    jobId?: string;
    resumeId?: string;
  };

  if (!jobId?.trim() || !resumeId?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'jobId 和 resumeId 不能为空',
    });
  }

  try {
    const [job, resume] = await Promise.all([
      prisma.job.findUnique({
        where: { id: jobId },
      }),
      prisma.resume.findUnique({
        where: { id: resumeId },
      }),
    ]);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: '岗位不存在',
      });
    }

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: '简历不存在',
      });
    }

    const rawResult = await analyzeResumeWithAI({
      jobTitle: job.jobTitle,
      jdText: job.jdText,
      resumeText: resume.text,
    });

    const safeResult = safeParseAnalysis(rawResult);

    const analysis = await prisma.analysis.create({
      data: {
        jobId: job.id,
        resumeId: resume.id,
        score: safeResult.score,
        strengths: safeResult.strengths,
        weaknesses: safeResult.weaknesses,
        suggestions: safeResult.suggestions,
        rawResult,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return res.json({
      success: true,
      data: {
        analysisId: analysis.id,
        createdAt: analysis.createdAt,
        ...safeResult,
      },
    });
  } catch (error) {
    console.error('Analysis failed:', error);

    if (error instanceof Error) {
      const errorMessage = error.message;

      if (
        errorMessage.includes('DASHSCOPE_API_KEY') ||
        errorMessage.includes('环境变量') ||
        errorMessage.includes('配置')
      ) {
        return res.status(500).json({
          success: false,
          message: `配置错误：${errorMessage}`,
          errorType: 'CONFIG_ERROR',
        });
      }

      if (
        errorMessage.includes('AI 分析服务异常') ||
        errorMessage.includes('AI 服务未返回有效内容')
      ) {
        return res.status(500).json({
          success: false,
          message: 'AI 服务调用失败，请稍后重试或检查网络连接',
          errorType: 'AI_SERVICE_ERROR',
        });
      }

      return res.status(500).json({
        success: false,
        message: `分析失败：${errorMessage}`,
        errorType: 'UNKNOWN_ERROR',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'AI 分析失败，请稍后重试',
      errorType: 'UNKNOWN_ERROR',
    });
  }
});

router.get('/:analysisId', async (req, res) => {
  const { analysisId } = req.params;

  if (!analysisId?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'analysisId 不能为空',
    });
  }

  try {
    const analysis = await prisma.analysis.findUnique({
      where: {
        id: analysisId,
      },
      include: {
        job: true,
        resume: true,
      },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: '分析记录不存在',
      });
    }

    return res.json({
      success: true,
      data: {
        analysisId: analysis.id,
        score: analysis.score,
        strengths: toStringArray(analysis.strengths),
        weaknesses: toStringArray(analysis.weaknesses),
        suggestions: toStringArray(analysis.suggestions),
        rawResult: analysis.rawResult,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
        job: {
          id: analysis.job.id,
          jobTitle: analysis.job.jobTitle,
          companyName: analysis.job.companyName,
          jdText: analysis.job.jdText,
          createdAt: analysis.job.createdAt,
          updatedAt: analysis.job.updatedAt,
        },
        resume: {
          id: analysis.resume.id,
          fileName: analysis.resume.fileName,
          text: analysis.resume.text,
          createdAt: analysis.resume.createdAt,
          updatedAt: analysis.resume.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Failed to read analysis detail:', error);
    return res.status(500).json({
      success: false,
      message: '读取分析详情失败',
    });
  }
});

export default router;
