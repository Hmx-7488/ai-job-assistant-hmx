export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSessionSummary {
  id: string;
  analysisId: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageDTO {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  sequence: number;
  createdAt: string;
}

export interface CreateChatSessionRequest {
  analysisId: string;
  title?: string;
}

export interface CreateChatSessionResult {
  session: ChatSessionSummary;
  messages: ChatMessageDTO[];
}

export interface GetChatSessionResult {
  session: ChatSessionSummary;
  messages: ChatMessageDTO[];
}

export interface ChatSendRequest {
  analysisId: string;
  sessionId: string;
  message: string;
}

export interface ChatSendResult {
  reply: string;
  userMessage: ChatMessageDTO;
  assistantMessage: ChatMessageDTO;
}

export interface ChatHistoryResponse {
  history: ChatMessageDTO[];
}
