import { runResumeAnalysisChain } from '../langchain/resumeAnalysisChain';

export interface LangChainAnalyzeParams {
  jobTitle: string;
  jdText: string;
  resumeText: string;
}

export async function analyzeResumeWithLangChain(
  params: LangChainAnalyzeParams
){
  try {
    return await runResumeAnalysisChain({
      jobTitle: params.jobTitle,
      jdText: params.jdText,
      resumeText: params.resumeText,
    });
  } catch (error) {
    console.error('LangChain analysis failed:', error);
    throw error;
  }
}
