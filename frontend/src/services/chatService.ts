import { getAuthToken } from './api';

export interface StreamChatParams {
  conversationId?: string;
  message: string;
  model: string;
  attachmentIds?: string[];
  regenerateMessageId?: string;
  signal?: AbortSignal;
  onStart?: (data: {
    conversation_id: string;
    user_message_id: string;
    assistant_message_id: string;
    model: string;
  }) => void;
  onReasoning?: (data: { status: string; token: string }) => void;
  onToken?: (data: { token: string }) => void;
  onComplete?: (data: {
    conversation_id: string;
    assistant_message_id: string;
    title: string;
    token_count?: number;
    generation_time?: number;
  }) => void;
  onError?: (error: string, code?: string) => void;
  onCancelled?: () => void;
}

export const chatService = {
  async streamChat(params: StreamChatParams): Promise<void> {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = {
      conversation_id: params.conversationId,
      message: params.message,
      model: params.model,
      attachment_ids: params.attachmentIds || [],
      regenerate_message_id: params.regenerateMessageId,
    };

    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: params.signal,
    });

    if (!response.ok) {
      let errText = `HTTP Error ${response.status}`;
      try {
        const errJson = await response.json();
        errText = errJson.detail || errJson.message || errText;
      } catch {
        // ignore
      }
      params.onError?.(errText);
      return;
    }

    if (!response.body) {
      params.onError?.('Empty response body received from server.');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          if (!block.trim()) continue;

          let eventType = 'message';
          let eventData = '';

          const blockLines = block.split('\n');
          for (const line of blockLines) {
            if (line.startsWith('event:')) {
              eventType = line.substring(6).trim();
            } else if (line.startsWith('data:')) {
              eventData = line.substring(5).trim();
            }
          }

          if (!eventData) continue;

          try {
            const parsed = JSON.parse(eventData);

            switch (eventType) {
              case 'start':
                params.onStart?.(parsed);
                break;
              case 'reasoning':
                params.onReasoning?.(parsed);
                break;
              case 'token':
                params.onToken?.(parsed);
                break;
              case 'complete':
                params.onComplete?.(parsed);
                break;
              case 'cancelled':
                params.onCancelled?.();
                break;
              case 'error':
                params.onError?.(parsed.detail || parsed.error || 'Generation error', parsed.code);
                break;
            }
          } catch (e) {
            console.warn('Error parsing SSE json block:', block, e);
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        params.onCancelled?.();
      } else {
        params.onError?.(err.message || 'Stream connection error');
      }
    }
  },
};
