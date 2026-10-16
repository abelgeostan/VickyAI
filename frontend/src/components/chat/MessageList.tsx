import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowDown } from 'lucide-react';
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
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // Auto-scroll on new messages or streaming tokens
  useEffect(() => {
    // Only auto scroll if already near bottom or initial
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (isNearBottom) {
        scrollToBottom(true);
      }
    } else {
      scrollToBottom(true);
    }
  }, [messages, messages[messages.length - 1]?.content, scrollToBottom]);

  // Track scroll position to show/hide scroll-to-bottom button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 250;
    setShowScrollBottom(isScrolledUp);
  };

  // Find the last assistant message index for regenerate button
  let lastAssistantIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      lastAssistantIndex = i;
      break;
    }
  }

  return (
    <div className="relative flex-1 min-h-0 w-full overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto w-full scroll-smooth"
      >
        <div className="py-4 space-y-0.5">
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
          <div ref={bottomRef} className="h-6" />
        </div>
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-4 right-6 z-20 p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-modal hover:shadow-glow-sm hover:scale-105 transition-all duration-200 ease-spring animate-slide-up flex items-center gap-1.5 text-xs font-semibold"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4 text-vicky-500" />
          <span className="hidden sm:inline text-[11px] pr-1">Latest</span>
        </button>
      )}
    </div>
  );
};
