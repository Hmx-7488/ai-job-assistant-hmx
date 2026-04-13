import cors from 'cors';
import express, { Request, Response } from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import jobRouter from './routes/job';

// 创建服务
const app = express();
const PORT = Number(process.env.PORT) || 3000;

// 配置 multer 内存存储，用于处理上传文件
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use('/api/job', jobRouter);

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
  const fileName = req.file.originalname.toLowerCase();

  if (!fileName.endsWith('.pdf')) {
    return res.status(400).json({
      success: false,
      message: '文件格式错误，请上传 PDF 格式的简历',
    });
  }

  const parser = new PDFParse({ data: fileBuffer });

  try {
    const data = await parser.getText();
    const text = data.text ?? '';

    console.log('解析成功，文本内容:', text);

    return res.json({
      success: true,
      message: '解析成功',
      text,
      fileName: req.file.originalname,
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

app.listen(PORT, () => {
  console.log(`server is running: http://localhost:${PORT}`);
});

export default app;
