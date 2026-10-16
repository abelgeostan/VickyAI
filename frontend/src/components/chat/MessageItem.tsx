import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, RotateCw, Edit3, User as UserIcon, Brain, AlertCircle } from 'lucide-react';
import { Message } from '../../types/chat';
import { VickyAvatar } from '../vicky/VickyAvatar';
import { CodeBlock } from './CodeBlock';
import { ImageAttachmentPreview } from './ImageAttachmentPreview';

interface MessageItemProps {
  message: Message;
  isLastAssistantMessage?: boolean;
  onRegenerate?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  showTimestamp?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLastAssistantMessage = false,
  onRegenerate,
  onEdit,
  showTimestamp = true,
}) => {
  const isAssistant = message.role === 'assistant';

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  // Determine Vicky Avatar state
  let avatarState: any = 'happy';
  if (message.error) {
    avatarState = 'sad';
  } else if (message.isThinking) {
    avatarState = 'thinking';
  } else if (message.isStreaming) {
    avatarState = 'happy';
  }

  const formattedTime = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`group w-full py-4 sm:py-5 px-3 sm:px-6 transition-colors ${
        isAssistant
          ? 'bg-slate-50/60 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800/40'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-start gap-3 sm:gap-4">
        {/* Avatar */}
        {isAssistant ? (
          <VickyAvatar
            state={avatarState}
            size="md"
            className="mt-0.5 shadow-sm"
            showGlow={message.isThinking || message.isStreaming}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 shadow-sm">
            <UserIcon className="w-5 h-5" />
          </div>
        )}

        {/* Message Content Area */}
        <div className="flex-1 min-w-0">
          {/* Header (Role & Time) */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
              {isAssistant ? 'VickyAI' : 'You'}
            </span>
            {isAssistant && message.model && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-vicky-100 dark:bg-vicky-950/60 text-vicky-700 dark:text-vicky-300">
                {message.model}
              </span>
            )}
            {showTimestamp && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {formattedTime}
              </span>
            )}
          </div>

          {/* Attached Images */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2.5 my-2">
              {message.attachments.map((att) => (
                <ImageAttachmentPreview
                  key={att.id}
                  url={att.url}
                  filename={att.original_filename}
                  size="md"
                />
              ))}
            </div>
          )}

          {/* Thinking / Reasoning Accordion (Qwen 3 thinking tokens) */}
          {message.thinkingContent && (
            <details className="my-2 p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/60 text-xs text-purple-900 dark:text-purple-200">
              <summary className="cursor-pointer font-semibold flex items-center gap-1.5 select-none text-purple-700 dark:text-purple-300">
                <Brain className="w-3.5 h-3.5" />
                🐾 Vicky's Thought Process
              </summary>
              <div className="mt-2 text-slate-600 dark:text-slate-400 font-mono text-[11px] whitespace-pre-wrap pl-4 border-l-2 border-purple-300 dark:border-purple-800">
                {message.thinkingContent}
              </div>
            </details>
          )}

          {/* User message edit mode */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-vicky-500"
                rows={3}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 rounded-lg bg-vicky-600 hover:bg-vicky-700 text-white text-xs font-semibold"
                >
                  Save & Resend
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Rendered Markdown or Text */
            <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-words">
              {message.error ? (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{message.content}</p>
                    <p className="text-[11px] text-rose-500 mt-1">{message.error}</p>
                  </div>
                </div>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code({ inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeValue = String(children).replace(/\n$/, '');
                      if (!inline && match) {
                        return <CodeBlock language={match[1]} value={codeValue} />;
                      }
                      if (!inline && codeValue.includes('\n')) {
                        return <CodeBlock language="text" value={codeValue} />;
                      }
                      return (
                        <code
                          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-vicky-600 dark:text-vicky-400 font-mono text-xs"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}

              {/* Streaming Cursor */}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-vicky-500 animate-pulse rounded-sm align-middle" />
              )}
            </div>
          )}

          {/* Bottom Action Toolbar & Metrics */}
          <div className="flex items-center justify-between mt-2 pt-1 text-xs text-slate-400 dark:text-slate-500">
            {/* Generation Metrics */}
            <div className="flex items-center gap-3 text-[11px]">
              {message.generation_time && (
                <span>⚡ {message.generation_time}s</span>
              )}
              {message.token_count && (
                <span>📝 {message.token_count} tokens</span>
              )}
            </div>

            {/* Actions: Copy, Edit, Regenerate */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                title="Copy message"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {!isAssistant && onEdit && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  title="Edit message"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}

              {isAssistant && isLastAssistantMessage && onRegenerate && !message.isStreaming && (
                <button
                  type="button"
                  onClick={() => onRegenerate(message.id)}
                  className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  title="Regenerate response"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
