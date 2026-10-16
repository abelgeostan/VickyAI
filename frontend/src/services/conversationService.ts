import { apiFetch } from './api';
import { Conversation, ConversationDetail } from '../types/conversation';

export const conversationService = {
  async list(includeArchived = false): Promise<Conversation[]> {
    return apiFetch<Conversation[]>(`/conversations?include_archived=${includeArchived}`);
  },

  async get(id: string): Promise<ConversationDetail> {
    return apiFetch<ConversationDetail>(`/conversations/${id}`);
  },

  async create(title?: string, model?: string): Promise<Conversation> {
    return apiFetch<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title, model }),
    });
  },

  async update(
    id: string,
    updates: { title?: string; model?: string; archived?: boolean }
  ): Promise<Conversation> {
    return apiFetch<Conversation>(`/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<void> {
    return apiFetch<void>(`/conversations/${id}`, {
      method: 'DELETE',
    });
  },

  async search(query: string): Promise<Conversation[]> {
    return apiFetch<Conversation[]>(`/conversations/search?q=${encodeURIComponent(query)}`);
  },
};
