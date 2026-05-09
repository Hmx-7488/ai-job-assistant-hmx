// src/rag/interviewKnowledgeBase.ts
export const interviewKnowledgeBase = [
  {
    id: 'frontend-vue-001',
    title: 'Vue3 Composition API',
    content:
      'Vue3 Composition API 适合在复杂组件中按逻辑组织代码。面试中可以结合 ref、reactive、computed、watch、生命周期和自定义 hook 说明项目实践。',
  },
  {
    id: 'frontend-ts-001',
    title: 'TypeScript 类型约束',
    content:
      'TypeScript 可以通过接口、联合类型、泛型和类型推导提升前端代码可维护性。项目中常用于接口响应类型、组件 props、表单数据和业务模型约束。',
  },
  {
    id: 'backend-express-001',
    title: 'Express 接口设计',
    content:
      'Express 项目中需要关注路由拆分、参数校验、错误处理中间件、环境变量管理和 service 分层，避免所有逻辑堆在入口文件中。',
  },
  {
    id: 'database-prisma-001',
    title: 'Prisma 数据持久化',
    content:
      'Prisma 通过 schema 定义数据模型，并提供类型安全的数据库访问。适合保存简历、岗位、分析结果、聊天会话和聊天消息等业务数据。',
  },
  {
    id: 'ai-prompt-001',
    title: 'Prompt 结构化输出',
    content:
      'AI 应用中不能假设模型一定返回稳定 JSON。可以通过 Prompt 约束输出格式，再用 OutputParser 和 zod 校验字段，失败时进入 fallback。',
  },
  {
    id: 'ai-langchain-001',
    title: 'LangChain 链路编排',
    content:
      'LangChain 可以把 PromptTemplate、ChatModel、OutputParser 串成可组合的 Chain，让 AI 调用链路更清晰，也方便后续接入 RAG 或 Agent 工作流。',
  },
  {
    id: 'ai-rag-001',
    title: 'RAG 检索增强生成',
    content:
      'RAG 的核心思想是先从知识库检索相关资料，再把检索结果作为上下文交给模型生成答案。它可以减少泛化回答，让结果更贴近知识库和岗位要求。',
  },
  {
    id: 'ai-error-001',
    title: 'AI 输出稳定性',
    content:
      '大模型可能返回空内容、非 JSON、字段缺失或超时。工程上需要通过 Prompt 约束、Parser、schema 校验、timeout、retry 和 fallback 提高稳定性。',
  },
  {
    id: 'project-ai-job-001',
    title: 'AI 求职助手项目讲解',
    content:
      'AI 求职助手不是简单调用接口，而是包含 PDF 简历解析、岗位 JD 输入、AI 结构化分析、结果落库、历史回查、面试题生成和模拟面试聊天的完整应用链路。',
  },
];
