import { Message } from './chat';

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  model: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}
