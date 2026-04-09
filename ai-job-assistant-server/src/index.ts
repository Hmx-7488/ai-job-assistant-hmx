import cors from 'cors';
import express, { Request, Response } from 'express';
import multer from 'multer';
// express创建服务，用cors结解决前后端跨域问题

// 创建服务
const app = express()
const PORT = Number(process.env.PORT) || 3000;

// 配置 multer 存储引擎 (这里使用内存存储，方便后续处理；也可以配置磁盘存储)
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.get('/api/ping', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: '后端服务器正常',
    time: new Date().toISOString(),
  });
});

app.get('/api/hello', (_req: Request, res: Response) => {
  res.json({
    success:true,
    message: 'Hello from server',
  })
});

app.post('/api/resume/upload', upload.single('resume'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: '没有接收到文件',
    });
  }
  console.log('接收到文件:', req.file.originalname);
  console.log('文件大小:', req.file.size);
  console.log('其他表单数据:', req.body);

  res.json({
    success: true,
    message: '文件上传成功',
    file: req.file,
  });
});

app.listen(PORT, () => {
  console.log(`server is running: http://localhost:${PORT}`);
});

export default app;
