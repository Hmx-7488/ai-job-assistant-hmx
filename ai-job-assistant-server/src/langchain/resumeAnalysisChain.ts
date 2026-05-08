import {
  ResumeAnalysisPromptInput,
  resumeAnalysisPrompt,
} from './resumeAnalysisPrompt'
import {getChatModel} from './model'
import {
  ResumeAnalysisResult,
  resumeAnalysisParser,
  validateResumeAnalysisResult,
} from './resumeAnalysisParser'

export type ResumeAnalysisChainInput = ResumeAnalysisPromptInput;

export async function runResumeAnalysisChain(
  input: ResumeAnalysisChainInput
): Promise<ResumeAnalysisResult> {
  const model = getChatModel();

  const chain = resumeAnalysisPrompt
  .pipe(model)
  .pipe(resumeAnalysisParser)

  const parsedResult =  await chain.invoke(
    {
      jobTitle: input.jobTitle,
      jdText: input.jdText,
      resumeText: input.resumeText,
    }
  )
  return validateResumeAnalysisResult(parsedResult);
}