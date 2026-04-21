# AI 求职助手

一个面向求职场景的前后端分离项目，支持简历上传、岗位录入、AI 匹配分析、分析记录回查与分类面试题生成。

## 项目进度（当前）

已完成主流程联调与数据落库：

1. 上传简历（PDF）并解析文本
2. 创建岗位信息
3. 调用 AI 进行简历-岗位匹配分析
4. 将简历、岗位、分析结果写入数据库
5. 支持通过 `analysisId` 查询分析详情
6. 支持基于 `analysisId` 生成分类面试题（项目题、基础题、场景题、行为题）
7. 前端在分析页下方新增“模拟面试题”模块

## 技术栈

前端（`ai-job-assistant-web`）：

- Vue 3
- TypeScript
- Vite
- Vue Router
- Axios

后端（`ai-job-assistant-server`）：

- Node.js
- Express 5
- TypeScript
- Prisma
- SQLite（本地开发）
- Multer（文件上传）
- pdf-parse（PDF 文本解析）
- Axios（AI API 调用）
- CORS

## 数据库设计

当前使用 Prisma + SQLite，核心三张表：

1. `resumes`：简历文件名与文本内容
2. `jobs`：岗位信息（岗位名、公司名、JD）
3. `analyses`：分析结果（分数、优势、待提升项、建议、原始 AI 文本），并关联 `jobId` 与 `resumeId`

## 前端功能

- 首页（`/`）：项目入口
- 登录页（`/login`）：占位页
- 分析页（`/analysis`）：上传 PDF 简历
- 分析页（`/analysis`）：填写岗位信息并发起分析
- 分析页（`/analysis`）：展示匹配分数、优势、待提升项、优化建议
- 分析页（`/analysis`）：支持通过 URL 参数 `analysisId` 回显分析详情
- 分析页（`/analysis`）：在页面下方生成并展示分类面试题（项目题/基础题/场景题/行为题）

## 后端接口

- `GET /api/ping`：服务健康检查
- `GET /api/hello`：基础连通性测试
- `POST /api/resume/upload`：上传并解析 PDF，写入 `resumes`，返回 `resumeId`
- `POST /api/job/create`：创建岗位，写入 `jobs`，返回 `jobId`
- `POST /api/analysis/run`：执行 AI 分析，写入 `analyses`，返回 `analysisId` 与结构化分析结果
- `GET /api/analysis/:analysisId`：按分析 ID 查询分析详情（含关联岗位与简历）
- `POST /api/interview/generate`：按 `analysisId` 生成分类面试题

## 本地启动

### 环境要求

- Node.js 20+（建议）
- npm

### 1. 启动后端

```bash
cd ai-job-assistant-server
npm install
```

创建 `ai-job-assistant-server/.env`（可参考 `.env.example`）：

```env
DASHSCOPE_API_KEY=your_dashscope_api_key_here
PORT=3000
DATABASE_URL="file:./dev.db"
```

启动后端：

```bash
npm run dev
```

后端地址：`http://localhost:3000`

### 2. 启动前端

```bash
cd ai-job-assistant-web
npm install
npm run dev
```

前端地址：`http://localhost:5173`

### 3. 页面入口

- 首页：`http://localhost:5173/`
- 分析页：`http://localhost:5173/analysis`

## 建议测试流程

1. 上传简历并创建岗位
2. 点击“开始分析”获取 `analysisId`
3. 确认分析结果正常展示
4. 在同页点击“生成面试题”，验证四类题目是否返回
