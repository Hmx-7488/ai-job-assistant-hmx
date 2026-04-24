export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSendRequest {
  analysisId: string;
  message: string;
  history?: ChatMessage[];
}

export interface ChatSendResult {
  reply: string;
}
