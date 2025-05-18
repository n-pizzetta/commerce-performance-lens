export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
  timestamp?: Date;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GeminiApiOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
} 