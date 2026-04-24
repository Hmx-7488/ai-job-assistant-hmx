# AI 求职助手

一个面向求职场景的前后端分离项目，支持简历上传、岗位录入、AI 匹配分析、分析记录回查、分类面试题生成，以及基于分析结果的 AI 模拟面试聊天。

## 当前进度

主流程已经串通到“分析 -> 面试题 -> 模拟面试聊天”：

1. 上传 PDF 简历并解析文本。
2. 创建岗位信息，包括岗位名称、公司名称和 JD。
3. 调用 AI 进行简历与岗位匹配分析。
4. 将简历、岗位、分析结果写入 SQLite 数据库。
5. 支持通过 `analysisId` 查询分析详情。
6. 支持基于 `analysisId` 生成分类面试题，包括项目题、基础题、场景题和行为题。
7. 前端分析页支持跳转到聊天页，并通过 URL 参数传递 `analysisId`。
8. 后端已实现 `POST /api/chat/send`，可基于分析结果、岗位、简历和历史对话生成模拟面试回复。
9. 前端聊天页已接入 `/api/chat/send`，支持消息列表、输入框、发送按钮、发送中状态和自动滚动。

## 技术栈

前端：`ai-job-assistant-web`

- Vue 3
- TypeScript
- Vite
- Vue Router
- Axios

后端：`ai-job-assistant-server`

- Node.js
- Express 5
- TypeScript
- Prisma
- SQLite，本地开发使用
- Multer，处理文件上传
- pdf-parse，解析 PDF 文本
- Axios，调用 AI 服务
- CORS

## 数据库设计

当前使用 Prisma + SQLite，核心表包括：

- `resumes`：保存简历文件名和解析后的文本内容。
- `jobs`：保存岗位名称、公司名称和 JD。
- `analyses`：保存匹配分数、优势、待提升项、优化建议和原始 AI 文本，并关联 `jobId` 与 `resumeId`。

## 前端功能

- `/`：首页入口。
- `/login`：登录占位页。
- `/analysis`：上传 PDF 简历、填写岗位信息、发起分析。
- `/analysis?analysisId=xxx`：按 `analysisId` 回显历史分析详情。
- `/analysis`：生成并展示分类面试题。
- `/chat?analysisId=xxx`：进入 AI 模拟面试聊天页。

聊天页当前能力：

- 显示用户消息和 AI 消息。
- 输入内容后调用后端 `POST /api/chat/send`。
- 自动携带当前 `analysisId`。
- 将当前消息历史传给后端，支持多轮上下文。
- 发送中禁用输入和按钮。
- 收到回复后自动滚动到底部。

## 后端接口

基础接口：

- `GET /api/ping`：服务健康检查。
- `GET /api/hello`：基础连通性测试。

简历与岗位：

- `POST /api/resume/upload`：上传并解析 PDF，写入 `resumes`，返回 `resumeId`。
- `POST /api/job/create`：创建岗位，写入 `jobs`，返回 `jobId`。

分析：

- `POST /api/analysis/run`：执行 AI 分析，写入 `analyses`，返回 `analysisId` 和结构化分析结果。
- `GET /api/analysis/:analysisId`：按分析 ID 查询分析详情，包含关联岗位和简历。

面试题：

- `POST /api/interview/generate`：按 `analysisId` 生成分类面试题。

聊天：

- `POST /api/chat/send`：按 `analysisId` 和用户消息生成模拟面试回复。

请求示例：

```json
{
  "analysisId": "your-analysis-id",
  "message": "这是我的自我介绍，请继续提问",
  "history": [
    {
      "role": "assistant",
      "content": "你好，请先做一个简单的自我介绍。"
    }
  ]
}
```

响应示例：

```json
{
  "success": true,
  "data": {
    "reply": "好的。请你结合最近一个项目，说明你负责的模块、遇到的难点以及最终效果。"
  }
}
```

## 本地启动

### 环境要求

- Node.js 20+，建议版本
- npm
- DashScope API Key

### 启动后端

```bash
cd ai-job-assistant-server
npm install
```

创建 `ai-job-assistant-server/.env`，可参考 `.env.example`：

```env
DASHSCOPE_API_KEY=your_dashscope_api_key_here
PORT=3000
DATABASE_URL="file:./dev.db"
```

启动后端：

```bash
npm run dev
```

后端地址：

```text
http://localhost:3000
```

### 启动前端

```bash
cd ai-job-assistant-web
npm install
npm run dev
```

前端地址：

```text
http://localhost:5173
```

## 推荐测试流程

1. 打开 `http://localhost:5173/analysis`。
2. 上传 PDF 简历。
3. 填写岗位名称、公司名称和 JD。
4. 点击“开始分析”，确认页面展示匹配分数、优势、待提升项和优化建议。
5. 记录或观察页面中的 `analysisId`。
6. 点击“生成面试题”，确认四类题目正常展示。
7. 点击“开始模拟面试”，进入 `/chat?analysisId=xxx`。
8. 在聊天页输入回答，确认后端返回 AI 面试官回复。

## 开发检查

后端类型检查：

```bash
cd ai-job-assistant-server
npm run typecheck
```

前端类型检查：

```bash
cd ai-job-assistant-web
npx vue-tsc --noEmit -p tsconfig.app.json
```

## 当前注意事项

- AI 能力依赖 `DASHSCOPE_API_KEY`，未配置时分析、面试题和聊天接口都会失败。
- 聊天接口依赖有效的 `analysisId`，需要先完成一次简历分析。
- 当前聊天记录只保存在前端内存中，刷新页面后会丢失。
- 当前未实现用户登录态和权限隔离，`/login` 仍是占位页面。
