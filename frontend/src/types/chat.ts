export interface Attachment {
  id: string;
  message_id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  size: number;
  url: string;
  created_at: string;
}

export interface WebSearchSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  token_count?: number;
  generation_time?: number;
  sources?: WebSearchSource[];
  created_at: string;
  updated_at?: string;
  attachments?: Attachment[];
  // Temporary client streaming fields
  isStreaming?: boolean;
  isThinking?: boolean;
  thinkingContent?: string;
  isSearching?: boolean;
  searchQuery?: string;
  error?: string;
}

export interface AttachmentUploadResult {
  id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  size: number;
  url: string;
}
