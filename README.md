# AI 求职助手

一个面向求职场景的前后端分离项目，帮助用户完成简历上传、岗位信息录入与匹配分析展示。

## 项目简介

AI 求职助手用于模拟“简历 + 岗位 JD”的分析流程，当前已完成从前端页面到后端接口的主流程联调，包括：

- 上传简历（PDF）
- 创建岗位信息（岗位名称、公司名称、JD）
- 触发分析并展示结果（已接入真实 AI 分析）

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
- Multer（文件上传）
- pdf-parse（PDF 文本解析）
- UUID（岗位 ID 生成）
- CORS

## 当前功能

前端页面能力：

- 首页（`/`）：项目介绍与进入分析页
- 分析页（`/analysis`）：支持上传 PDF 简历文件
- 分析页（`/analysis`）：支持录入岗位名称、公司名称、岗位 JD
- 分析页（`/analysis`）：支持一键触发分析流程，展示匹配分数、优势、待提升项、优化建议
- 分析页（`/analysis`）：支持清空输入与结果
- 登录页（`/login`）：占位页

后端接口能力：

- `GET /api/ping`：服务健康检查
- `GET /api/hello`：基础连通性测试
- `POST /api/resume/upload`：接收并解析 PDF 简历文本（限制 10MB）
- `POST /api/job/create`：创建岗位并返回 `jobId`（当前为内存存储）
- `POST /api/analysis/run`：调用真实 AI 服务返回分析结果
- `POST /api/analysis/run`：内置 AI 返回内容的 JSON 解析与结构兜底

当前状态说明：

- 已完成前后端核心流程联调
- 已完成 Day 7：接入真实 AI 分析能力
- 已支持环境变量配置（`DASHSCOPE_API_KEY`）与缺失时错误提示
- 已支持模型异常格式的降级处理，保证前端始终拿到固定结构数据

## 本地启动方式

### 环境要求

- Node.js 20+（建议）
- npm

### 1. 启动后端

```bash
cd ai-job-assistant-server
npm install
npm run dev
```

后端默认地址：`http://localhost:3000`

### 2. 启动前端

```bash
cd ai-job-assistant-web
npm install
npm run dev
```

前端默认地址：`http://localhost:5173`

### 3. 打开页面体验

- 首页：`http://localhost:5173/`
- 分析页：`http://localhost:5173/analysis`
