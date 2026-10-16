import React, { useEffect, useRef } from 'react';
import { Message } from '../../types/chat';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  onRegenerate?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  showTimestamps?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onRegenerate,
  onEdit,
  showTimestamps = true,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages or streaming tokens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messages[messages.length - 1]?.content]);

  // Find the last assistant message index for regenerate button
  let lastAssistantIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      lastAssistantIndex = i;
      break;
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto w-full scroll-smooth"
    >
      <div className="py-4 space-y-1">
        {messages.map((msg, idx) => (
          <MessageItem
            key={msg.id || idx}
            message={msg}
            isLastAssistantMessage={idx === lastAssistantIndex}
            onRegenerate={onRegenerate}
            onEdit={onEdit}
            showTimestamp={showTimestamps}
          />
        ))}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};
