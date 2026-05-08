import 'dotenv/config';
import { runResumeAnalysisChain } from './resumeAnalysisChain';

async function main() {
  const result = await runResumeAnalysisChain({
    jobTitle: 'AI应用开发实习生',
    jdText: [
      '岗位职责：',
      '1. 参与 AI 应用产品的前后端开发。',
      '2. 基于大模型能力实现简历分析、内容生成、智能问答等功能。',
      '3. 配合产品需求完成接口联调、页面展示和异常处理。',
      '',
      '岗位要求：',
      '1. 熟悉 Vue3、TypeScript、Node.js。',
      '2. 了解 Prompt Engineering、LangChain 或 RAG。',
      '3. 有 AI 应用项目经验优先。',
    ].join('\n'),
    resumeText: [
      '候选人：候茂雄，27届软件工程本科。',
      '技能：Vue3、TypeScript、Express、Prisma、SQLite、Axios。',
      '项目：AI求职助手，支持 PDF 简历解析、岗位 JD 输入、AI 匹配分析、面试题生成和模拟面试聊天。',
      '项目中实现了 Prompt 约束、JSON 解析兜底、analysisId 历史回查和聊天记录持久化。',
    ].join('\n'),
  });

  console.log('LangChain resume analysis result:');
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error('Demo failed:', error);
  process.exit(1);
});
