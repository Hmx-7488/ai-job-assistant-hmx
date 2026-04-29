# AI 求职助手

AI 求职助手是一个面向求职场景的前后端分离项目。它围绕“简历分析 -> 面试题生成 -> 模拟面试聊天”构建完整流程，帮助用户基于目标岗位快速评估简历匹配度、获得优化建议，并进行有上下文的 AI 面试练习。

## 功能概览

- 上传 PDF 简历，后端解析简历文本。
- 填写岗位名称、公司名称和岗位 JD。
- 调用 AI 生成简历与岗位的匹配分析。
- 展示匹配分数、优势项、待提升项和优化建议。
- 支持通过 `analysisId` 回查历史分析结果。
- 基于分析结果生成分类面试题，包括项目题、基础题、场景题和行为题。
- 支持复制分析内容、面试题和聊天消息，方便整理到文档或笔记。
- 基于分析结果进入 AI 模拟面试聊天。
- 支持聊天会话创建、读取、发送消息和清空会话。
- 补充空状态、错误状态和重试按钮，提升接口失败或无数据时的使用体验。

## 技术栈

### 前端

目录：`ai-job-assistant-web`

- Vue 3
- TypeScript
- Vite
- Vue Router
- Axios

### 后端

目录：`ai-job-assistant-server`

- Node.js
- Express 5
- TypeScript
- Prisma
- SQLite
- Multer
- pdf-parse
- mammoth
- Axios
- DashScope API

## 项目结构

```text
ai-job-assistant
├── ai-job-assistant-web       # 前端 Vue 应用
├── ai-job-assistant-server    # 后端 Express 服务
├── docs                       # 项目文档
└── README.md
```

## 核心页面

- `/`：首页入口。
- `/analysis`：简历上传、岗位信息填写、简历分析、面试题生成。
- `/analysis?analysisId=xxx`：按分析 ID 回显历史分析结果。
- `/chat?analysisId=xxx`：进入 AI 模拟面试聊天。
- `/chat?analysisId=xxx&sessionId=xxx`：继续指定聊天会话。

## 后端接口

### 基础接口

- `GET /api/ping`：服务健康检查。
- `GET /api/hello`：连通性测试。

### 简历与岗位

- `POST /api/resume/upload`：上传并解析简历文件，返回 `resumeId`。
- `POST /api/job/create`：创建岗位信息，返回 `jobId`。

### 分析

- `POST /api/analysis/run`：根据 `jobId` 和 `resumeId` 执行 AI 分析。
- `GET /api/analysis/:analysisId`：读取分析详情。

### 面试题

- `POST /api/interview/generate`：根据 `analysisId` 生成分类面试题。

### 聊天

- `POST /api/chat/session`：创建聊天会话。
- `GET /api/chat/session/:sessionId`：读取聊天会话和消息列表。
- `POST /api/chat/send`：发送用户消息并生成 AI 面试官回复。
- `DELETE /api/chat/session/:sessionId`：清空指定聊天会话。

## 数据模型

当前使用 Prisma + SQLite，核心表包括：

- `resumes`：保存简历文件名和解析后的文本。
- `jobs`：保存岗位名称、公司名称和 JD。
- `analyses`：保存匹配分数、优势、待提升项、建议和 AI 原始输出。
- `ChatSession`：保存某次分析下的聊天会话。
- `ChatMessage`：保存聊天消息、角色、顺序和创建时间。

## 本地运行

### 环境要求

- Node.js 20+
- npm
- DashScope API Key

### 1. 启动后端

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

启动服务：

```bash
npm run dev
```

后端默认地址：

```text
http://localhost:3000
```

### 2. 启动前端

```bash
cd ai-job-assistant-web
npm install
npm run dev
```

前端默认地址：

```text
http://localhost:5173
```

## 构建与检查

前端构建：

```bash
cd ai-job-assistant-web
npm run build
```

后端类型检查：

```bash
cd ai-job-assistant-server
npm run typecheck
```

后端构建：

```bash
cd ai-job-assistant-server
npm run build
```

## 推荐测试流程

1. 打开 `http://localhost:5173/analysis`。
2. 上传 PDF 简历。
3. 填写岗位名称、公司名称和 JD。
4. 点击“开始分析”，确认页面展示匹配度、优势项、待提升项和优化建议。
5. 点击“生成面试题”，确认四类面试题正常展示。
6. 点击“开始模拟面试”，进入聊天页。
7. 输入回答并发送，确认 AI 面试官能基于当前分析结果继续追问。
8. 关闭后端或断网测试错误态，确认页面能展示错误信息和重试按钮。

## 项目亮点

- **场景闭环完整**：从简历解析、岗位匹配、建议生成到模拟面试，覆盖求职准备的关键链路。
- **AI 输出结构化**：后端对 AI 返回内容做安全解析，前端以分数、列表、分类题目等方式清晰展示。
- **上下文驱动聊天**：模拟面试不是孤立问答，而是结合岗位 JD、简历内容、分析结果和历史消息生成回复。
- **会话持久化**：聊天会话和消息落库，支持通过 `sessionId` 恢复历史会话。
- **用户体验兜底**：页面补充加载态、空状态、错误态和重试按钮，接口异常时用户能明确知道发生了什么。
- **复制友好**：结果和聊天内容支持复制，方便用户沉淀到简历修改记录、面试准备文档或笔记工具。
- **前后端职责清晰**：前端专注交互和展示，后端负责文件解析、数据持久化、AI 调用和结果规范化。

## 注意事项

- AI 能力依赖 `DASHSCOPE_API_KEY`，未配置时分析、面试题和聊天接口会失败。
- 聊天功能依赖有效的 `analysisId`，需要先完成一次简历分析。
- 当前项目主要面向本地开发和学习演示，尚未实现完整登录、权限隔离和生产级鉴权。
- SQLite 数据库适合本地开发，生产环境建议切换到更稳定的数据库方案。
