import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, RotateCw, Edit3, User as UserIcon, Brain, AlertCircle, Sparkles, ChevronDown, Globe, ExternalLink, Loader2 } from 'lucide-react';
import { Message } from '../../types/chat';
import { VickyAvatar } from '../vicky/VickyAvatar';
import { CodeBlock } from './CodeBlock';
import { ImageAttachmentPreview } from './ImageAttachmentPreview';

const extractText = (node: any): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node.props && node.props.children) return extractText(node.props.children);
  return '';
};

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
      className={`
        group w-full py-4 sm:py-5 px-3 sm:px-6 transition-colors animate-fade-in
        ${isAssistant
          ? 'bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-100/80 dark:border-slate-800/40'
          : 'bg-transparent'
        }
      `}
    >
      <div className="max-w-4xl mx-auto flex items-start gap-3.5 sm:gap-4">
        {/* Avatar */}
        {isAssistant ? (
          <div className="shrink-0 mt-0.5">
            <VickyAvatar
              state={avatarState}
              size="md"
              className="shadow-sm"
              showGlow={message.isThinking || message.isStreaming}
            />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs border border-slate-300/40 dark:border-slate-700/50">
            <UserIcon className="w-4 h-4" />
          </div>
        )}

        {/* Message Content Area */}
        <div className="flex-1 min-w-0">
          {/* Header (Role, Model Pill, & Time) */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1">
              {isAssistant ? (
                <>
                  <span>VickyAI</span>
                  <span className="text-[11px]">🐾</span>
                </>
              ) : (
                'You'
              )}
            </span>

            {isAssistant && message.model && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-vicky-500/10 text-vicky-600 dark:text-vicky-400 border border-vicky-500/20 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {message.model}
              </span>
            )}

            {isAssistant && message.sources && message.sources.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1">
                <Globe className="w-2.5 h-2.5" />
                Web Search
              </span>
            )}

            {showTimestamp && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                {formattedTime}
              </span>
            )}
          </div>

          {/* Attached Images */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2.5 my-2.5">
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

          {/* Live Web Searching Status Banner */}
          {message.isSearching && (
            <div className="my-2.5 px-3.5 py-2.5 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 text-xs flex items-center gap-2 animate-pulse shadow-2xs">
              <Loader2 className="w-4 h-4 animate-spin text-sky-500 shrink-0" />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold">Searching the web</span>
                {message.searchQuery && (
                  <span className="text-sky-600 dark:text-sky-400 truncate max-w-xs font-mono text-[11px]">
                    "{message.searchQuery}"
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Web Sources & Citations Section */}
          {message.sources && message.sources.length > 0 && (
            <details className="my-2.5 rounded-2xl bg-sky-50/40 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-900/40 text-xs overflow-hidden group/sources shadow-2xs" open>
              <summary className="cursor-pointer font-semibold p-2.5 select-none text-sky-700 dark:text-sky-300 flex items-center justify-between hover:bg-sky-100/40 dark:hover:bg-sky-900/30 transition-colors">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Web Sources ({message.sources.length})</span>
                </div>
                <ChevronDown className="w-4 h-4 text-sky-500 transition-transform group-open/sources:rotate-180" />
              </summary>
              <div className="p-3 pt-1 border-t border-sky-100 dark:border-sky-900/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {message.sources.map((src, idx) => {
                    let domain = '';
                    try {
                      domain = new URL(src.url).hostname.replace(/^www\./, '');
                    } catch {
                      domain = src.url;
                    }
                    return (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col justify-between p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-xs transition-all group/source text-left no-underline"
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-mono mb-1">
                          <span className="w-4 h-4 rounded-full bg-sky-100 dark:bg-sky-900/70 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-[9px] shrink-0">
                            {idx + 1}
                          </span>
                          <span className="truncate">{domain}</span>
                          <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover/source:opacity-100 transition-opacity text-sky-500 shrink-0" />
                        </div>
                        <span className="text-[12px] font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover/source:text-sky-600 dark:group-hover/source:text-sky-400">
                          {src.title || src.url}
                        </span>
                        {src.snippet && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-snug">
                            {src.snippet}
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            </details>
          )}

          {/* Thinking / Reasoning Accordion (Qwen 3 thinking tokens) */}
          {message.thinkingContent && (
            <details className="my-2.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/50 text-xs overflow-hidden group/thinking shadow-xs">
              <summary className="cursor-pointer font-semibold p-3 select-none text-purple-700 dark:text-purple-300 flex items-center justify-between hover:bg-purple-100/40 dark:hover:bg-purple-900/30 transition-colors">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                  <span>Vicky's Thought Process</span>
                  {message.isThinking && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 animate-pulse">
                      Thinking...
                    </span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-purple-500 transition-transform group-open/thinking:rotate-180" />
              </summary>
              <div className="p-3 pt-1 text-slate-600 dark:text-slate-400 font-mono text-[11px] whitespace-pre-wrap leading-relaxed border-t border-purple-100 dark:border-purple-900/40 bg-purple-50/30 dark:bg-purple-950/10">
                {message.thinkingContent}
              </div>
            </details>
          )}

          {/* User message edit mode */}
          {isEditing ? (
            <div className="mt-2 space-y-2 p-3 rounded-2xl border border-vicky-400/60 bg-white dark:bg-slate-800 shadow-sm">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-vicky-500/40 text-slate-900 dark:text-slate-100 leading-relaxed resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3.5 py-1.5 rounded-xl bg-vicky-600 hover:bg-vicky-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Save & Resend
                </button>
              </div>
            </div>
          ) : (
            /* Rendered Markdown or Text */
            <div className="prose dark:prose-invert max-w-none text-[14px] text-slate-800 dark:text-slate-200 leading-relaxed break-words">
              {message.error ? (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5 shadow-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-200">{message.content}</p>
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 font-mono">{message.error}</p>
                  </div>
                </div>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    pre({ children }: any) {
                      const child = React.isValidElement(children)
                        ? children
                        : Array.isArray(children)
                        ? children[0]
                        : null;
                      const childProps: any = (child as any)?.props || {};
                      const className = childProps.className || '';
                      const match = /language-(\w+)/.exec(className);
                      const lang = match ? match[1] : 'text';
                      const rawCode = extractText(childProps.children).replace(/\n$/, '');
                      return <CodeBlock language={lang} value={rawCode} />;
                    },
                    code({ className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      if (match) {
                        const raw = extractText(children).replace(/\n$/, '');
                        return <CodeBlock language={match[1]} value={raw} />;
                      }
                      return (
                        <code
                          className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-vicky-600 dark:text-vicky-400 font-mono text-xs font-medium border border-slate-200/50 dark:border-slate-700/50"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    table({ children }) {
                      return (
                        <div className="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                          <table className="w-full text-left text-xs border-collapse">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800/50 text-slate-700 dark:text-slate-300">
                          {children}
                        </td>
                      );
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="my-3 pl-4 border-l-3 border-vicky-500 italic text-slate-600 dark:text-slate-400 bg-vicky-500/5 py-1 rounded-r-lg">
                          {children}
                        </blockquote>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}

              {/* Streaming Cursor */}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1.5 bg-vicky-500 rounded-xs align-middle cursor-blink shadow-glow-sm" />
              )}
            </div>
          )}

          {/* Bottom Action Toolbar & Metrics */}
          <div className="flex items-center justify-between mt-2 pt-1 text-xs text-slate-400 dark:text-slate-500">
            {/* Generation Metrics */}
            <div className="flex items-center gap-3 text-[11px] font-mono">
              {message.generation_time && (
                <span className="flex items-center gap-1 text-slate-400">
                  <span>⚡</span> {message.generation_time}s
                </span>
              )}
              {message.token_count && (
                <span className="flex items-center gap-1 text-slate-400">
                  <span>📝</span> {message.token_count} tokens
                </span>
              )}
            </div>

            {/* Actions: Copy, Edit, Regenerate */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                title="Copy message"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {!isAssistant && onEdit && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  title="Edit message"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}

              {isAssistant && isLastAssistantMessage && onRegenerate && !message.isStreaming && (
                <button
                  type="button"
                  onClick={() => onRegenerate(message.id)}
                  className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
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
