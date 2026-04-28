import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { sendChatWithAI } from '../services/ai';
import type {
  ChatMessage,
  ChatSendRequest,
  CreateChatSessionRequest,
} from '../types/chat';

const router = Router();

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function normalizeRole(value: unknown): 'user' | 'assistant' | null {
  if (value === 'user' || value === 'assistant') {
    return value;
  }

  return null;
}

function buildSessionDTO(session: {
  id: string;
  analysisId: string;
  title: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: session.id,
    analysisId: session.analysisId,
    title: session.title,
    status: session.status,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

function buildMessageDTO(message: {
  id: string;
  sessionId: string;
  role: unknown;
  content: string;
  sequence: number;
  createdAt: Date;
}) {
  const role = normalizeRole(message.role) ?? 'assistant';

  return {
    id: message.id,
    sessionId: message.sessionId,
    role,
    content: message.content,
    sequence: message.sequence,
    createdAt: message.createdAt.toISOString(),
  };
}

function buildPromptHistory(
  messages: Array<{
    role: unknown;
    content: string;
  }>
): ChatMessage[] {
  return messages
    .map((item): ChatMessage | null => {
      const role = normalizeRole(item.role);
      if (!role) {
        return null;
      }

      return {
        role,
        content: item.content,
      };
    })
    .filter((item): item is ChatMessage => !!item);
}

router.post('/session', async (req, res) => {
  const { analysisId, title } = req.body as CreateChatSessionRequest;
  const safeAnalysisId = analysisId?.trim();

  if (!safeAnalysisId) {
    return res.status(400).json({
      success: false,
      message: 'analysisId cannot be empty',
    });
  }

  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id: safeAnalysisId },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'analysis record not found',
      });
    }

    const welcomeText = '你好，我是 AI 面试官。请先做一个简短的自我介绍。';

    const result = await prisma.$transaction(async (tx) => {
      const session = await tx.chatSession.create({
        data: {
          analysisId: safeAnalysisId,
          title: title?.trim() || '模拟面试会话',
          status: 'active',
        },
      });

      const welcomeMessage = await tx.chatMessage.create({
        data: {
          sessionId: session.id,
          role: 'assistant',
          content: welcomeText,
          sequence: 1,
        },
      });

      return { session, welcomeMessage };
    });

    return res.json({
      success: true,
      data: {
        session: buildSessionDTO(result.session),
        messages: [buildMessageDTO(result.welcomeMessage)],
      },
    });
  } catch (error) {
    console.error('Create chat session failed:', error);
    return res.status(500).json({
      success: false,
      message: 'create chat session failed',
    });
  }
});

router.get('/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const safeSessionId = sessionId?.trim();

  if (!safeSessionId) {
    return res.status(400).json({
      success: false,
      message: 'sessionId cannot be empty',
    });
  }

  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: safeSessionId },
      include: {
        messages: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'chat session not found',
      });
    }

    return res.json({
      success: true,
      data: {
        session: buildSessionDTO(session),
        messages: session.messages.map(buildMessageDTO),
      },
    });
  } catch (error) {
    console.error('Get chat session failed:', error);
    return res.status(500).json({
      success: false,
      message: 'get chat session failed',
    });
  }
});

router.post('/send', async (req, res) => {
  const { analysisId, sessionId, message } = req.body as ChatSendRequest;
  const safeAnalysisId = analysisId?.trim();
  const safeSessionId = sessionId?.trim();
  const safeMessage = message?.trim();

  if (!safeAnalysisId) {
    return res.status(400).json({
      success: false,
      message: 'analysisId cannot be empty',
    });
  }

  if (!safeSessionId) {
    return res.status(400).json({
      success: false,
      message: 'sessionId cannot be empty',
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

    const session = await prisma.chatSession.findUnique({
      where: { id: safeSessionId },
      include: {
        messages: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'chat session not found',
      });
    }

    if (session.analysisId !== safeAnalysisId) {
      return res.status(400).json({
        success: false,
        message: 'session does not belong to analysis',
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
      history: buildPromptHistory(session.messages),
      message: safeMessage,
    });

    const nextSequence = session.messages.length + 1;

    const saved = await prisma.$transaction(async (tx) => {
      const userMessage = await tx.chatMessage.create({
        data: {
          sessionId: session.id,
          role: 'user',
          content: safeMessage,
          sequence: nextSequence,
        },
      });

      const assistantMessage = await tx.chatMessage.create({
        data: {
          sessionId: session.id,
          role: 'assistant',
          content: reply,
          sequence: nextSequence + 1,
        },
      });

      await tx.chatSession.update({
        where: { id: session.id },
        data: {
          updatedAt: new Date(),
        },
      });

      return {
        userMessage,
        assistantMessage,
      };
    });

    return res.json({
      success: true,
      data: {
        reply,
        userMessage: buildMessageDTO(saved.userMessage),
        assistantMessage: buildMessageDTO(saved.assistantMessage),
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

router.delete('/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const analysisId = typeof req.query.analysisId === 'string' ? req.query.analysisId.trim() : '';
  const safeSessionId = sessionId?.trim();

  if (!safeSessionId) {
    return res.status(400).json({
      success: false,
      message: 'sessionId cannot be empty',
    });
  }

  if (!analysisId) {
    return res.status(400).json({
      success: false,
      message: 'analysisId cannot be empty',
    });
  }

  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: safeSessionId },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'chat session not found',
      });
    }

    if (session.analysisId !== analysisId) {
      return res.status(400).json({
        success: false,
        message: 'session does not belong to analysis',
      });
    }

    await prisma.chatSession.delete({
      where: { id: safeSessionId },
    });

    return res.json({
      success: true,
      data: {
        sessionId: safeSessionId,
      },
    });
  } catch (error) {
    console.error('Delete chat session failed:', error);
    return res.status(500).json({
      success: false,
      message: 'delete chat session failed',
    });
  }
});

export default router;
