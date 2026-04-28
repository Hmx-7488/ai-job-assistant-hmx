import 'dotenv/config';
import cors from 'cors';
import express, { Request, Response } from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import jobRouter from './routes/job';
import analysisRouter from './routes/analysis';
import { prisma } from './lib/prisma';
import interviewRouter from './routes/interview';
import chatRouter from './routes/chat';

// 创建服务
const app = express();
const PORT = Number(process.env.PORT) || 3000;

// 配置 multer 内存存储，用于处理上传文件
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // 生产环境中指定具体的前端域名
}));
app.use(express.json());
app.use('/api/job', jobRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/chat', chatRouter);

app.get('/api/ping', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: '后端服务器正常',
    time: new Date().toISOString(),
  });
});

app.get('/api/hello', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Hello from server',
  });
});

app.post('/api/resume/upload', upload.single('resume'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: '没有接收到文件',
    });
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (req.file.size > MAX_SIZE) {
    return res.status(400).json({
      success: false,
      message: '文件太大，请上传小于 10MB 的文件',
    });
  }

  const fileBuffer = req.file.buffer;
  const originalFileName = req.file.originalname;
  const fileNameForCheck = originalFileName.toLowerCase();

  if (!fileNameForCheck.endsWith('.pdf')) {
    return res.status(400).json({
      success: false,
      message: '文件格式错误，请上传 PDF 格式的简历',
    });
  }

  const parser = new PDFParse({ data: fileBuffer });

  try {
    const data = await parser.getText();
    const text = (data.text ?? '').trim();

    if (!text) {
      return res.status(400).json({
        success: false,
        message: '简历解析后内容为空，请检查文件',
      });
    }

    const resume = await prisma.resume.create({
      data: {
        fileName: originalFileName,
        text,
      },
      select: {
        id: true,
        fileName: true,
        text: true,
        createdAt: true,
      },
    });

    console.log('解析成功，文本内容:', text);

    return res.json({
      success: true,
      message: '解析成功',
      data: {
        resumeId: resume.id,
        fileName: resume.fileName,
        text: resume.text,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error('解析文件时出错:', error);

    return res.status(500).json({
      success: false,
      message: '解析文件时出错',
    });
  } finally {
    await parser.destroy();
  }
});

// 添加错误处理中间件
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`server is running: http://localhost:${PORT}`);
});

export default app;