import { runResumeAnalysisChain } from '../langchain/resumeAnalysisChain';

export interface LangChainAnalyzeParams {
  jobTitle: string;
  jdText: string;
  resumeText: string;
}

export async function analyzeResumeWithLangChain(
  params: LangChainAnalyzeParams
) {
  return runResumeAnalysisChain({
    jobTitle: params.jobTitle,
    jdText: params.jdText,
    resumeText: params.resumeText,
  });
}
