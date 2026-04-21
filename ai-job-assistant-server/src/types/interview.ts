export interface InterviewGenerateRequest {
  analysisId: string;
  questionCount?: number;
}

export interface InterviewQuestion {
  category: string;
  question: string;
  intent: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answerPoints: string[];
  followUps: string[];
}

export interface InterviewGenerateResult {
  summary: string;
  projectQuestions: InterviewQuestion[];
  fundamentalQuestions: InterviewQuestion[];
  scenarioQuestions: InterviewQuestion[];
  behavioralQuestions: InterviewQuestion[];}