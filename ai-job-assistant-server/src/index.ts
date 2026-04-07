import cors from 'cors';
import express, { Request, Response } from 'express';
import { time } from 'node:console';
// express创建服务，用cors结解决前后端跨域问题

// 创建服务
const app = express()
const PORT = Number(process.env.PORT) || 3000;

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

app.listen(PORT, () => {
  console.log(`server is running: http://localhost:${PORT}`);
});

export default app;
