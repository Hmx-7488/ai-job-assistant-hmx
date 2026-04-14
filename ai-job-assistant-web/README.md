# AI 求职助手前端

`ai-job-assistant-web` 是 AI 求职助手的前端项目，基于 Vue 3 + TypeScript + Vite 实现。

## 项目说明

当前前端已完成核心页面与分析主流程联调：

- 首页（`/`）
- 分析页（`/analysis`）：上传简历、填写岗位信息、发起分析、展示结果
- 登录页（`/login`）：占位页

分析流程如下：

1. 上传 PDF 简历到后端 `/api/resume/upload`
2. 提交岗位信息到后端 `/api/job/create` 获取 `jobId`
3. 提交 `jobId + jdText + resumeText` 到 `/api/analysis/run`
4. 渲染匹配度、优势项、待提升项、优化建议

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Axios

## 本地启动

```bash
npm install
npm run dev
```

默认访问地址：

- `http://localhost:5173`

## 构建生产包

```bash
npm run build
```

