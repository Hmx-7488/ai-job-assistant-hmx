import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { sendChatWithAI } from '../services/ai';
import type { ChatMessage, ChatSendRequest } from '../types/chat';

const router = Router();

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function normalizeHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): ChatMessage | null => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const row = item as Record<string, unknown>;
      const role = row.role;
      const content = row.content;

      if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') {
        return null;
      }

      const safeContent = content.trim();
      if (!safeContent) {
        return null;
      }

      return {
        role,
        content: safeContent,
      };
    })
    .filter((item): item is ChatMessage => !!item);
}

router.post('/send', async (req, res) => {
  const { analysisId, message, history } = req.body as ChatSendRequest;
  const safeAnalysisId = analysisId?.trim();
  const safeMessage = message?.trim();

  if (!safeAnalysisId) {
    return res.status(400).json({
      success: false,
      message: 'analysisId cannot be empty',
    });
  }

  if (!safeMessage) {
    return res.status(400).json({
      success: false,
      message: 'message cannot be empty',
    });
  }

  if (safeMessage.length > 2000) {
    return res.status(400).json({
      success: false,
      message: 'message is too long',
    });
  }

  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id: safeAnalysisId },
      include: { job: true, resume: true },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'analysis record not found',
      });
    }

    const reply = await sendChatWithAI({
      jobTitle: analysis.job.jobTitle,
      companyName: analysis.job.companyName,
      jdText: analysis.job.jdText,
      resumeText: analysis.resume.text,
      score: analysis.score,
      strengths: toStringArray(analysis.strengths),
      weaknesses: toStringArray(analysis.weaknesses),
      suggestions: toStringArray(analysis.suggestions),
      history: normalizeHistory(history),
      message: safeMessage,
    });

    return res.json({
      success: true,
      data: {
        reply,
      },
    });
  } catch (error) {
    console.error('Chat send failed:', error);

    if (error instanceof Error && error.message.includes('DASHSCOPE_API_KEY')) {
      return res.status(500).json({
        success: false,
        message: error.message,
        errorType: 'CONFIG_ERROR',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'chat reply generation failed',
      errorType: 'AI_SERVICE_ERROR',
    });
  }
});

export default router;
