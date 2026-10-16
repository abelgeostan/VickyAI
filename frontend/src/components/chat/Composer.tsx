import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip, AlertTriangle, Loader2 } from 'lucide-react';
import { uploadService } from '../../services/uploadService';
import { AttachmentUploadResult } from '../../types/chat';
import { ImageAttachmentPreview } from './ImageAttachmentPreview';
import { ModelInfo } from '../../types/model';

interface ComposerProps {
  onSendMessage: (message: string, attachmentIds: string[]) => void;
  onStopGeneration: () => void;
  isGenerating: boolean;
  selectedModel: string;
  models: ModelInfo[];
  onSelectModel: (modelId: string) => void;
  enterToSend?: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  onStopGeneration,
  isGenerating,
  selectedModel,
  models,
  onSelectModel,
  enterToSend = true,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<AttachmentUploadResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentModelInfo = models.find((m) => m.id === selectedModel);
  const supportsVision = currentModelInfo?.supports_vision ?? true;
  const hasImagesAttached = attachments.length > 0;
  const showVisionWarning = hasImagesAttached && !supportsVision;
  const canSend = (text.trim() || attachments.length > 0) && !showVisionWarning;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (isGenerating) { onStopGeneration(); return; }
    if (!canSend) return;
    onSendMessage(text.trim(), attachments.map((a) => a.id));
    setText('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (enterToSend && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      for (let i = 0; i < files.length; i++) {
        const res = await uploadService.upload(files[i]);
        setAttachments((prev) => [...prev, res]);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 pb-3 sm:pb-5 pt-2 shrink-0">

      {/* Vision Warning Banner */}
      {showVisionWarning && (
        <div className="mb-2 px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span><strong className="font-semibold">{currentModelInfo?.name || selectedModel}</strong> doesn't support vision.</span>
          </div>
          <button
            type="button"
            onClick={() => onSelectModel('gemma3:4b')}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[11px] transition-colors"
          >
            Use Gemma 3 4B
          </button>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="mb-2 px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-2 animate-fade-in">
          <span>{uploadError}</span>
          <button type="button" onClick={() => setUploadError(null)} className="font-semibold underline underline-offset-2 shrink-0">
            Dismiss
          </button>
        </div>
      )}

      {/* ── Composer Box ── */}
      <div className={`
        relative rounded-2xl border bg-white dark:bg-slate-900 shadow-card overflow-hidden
        transition-all duration-200
        ${text || attachments.length > 0 || isGenerating
          ? 'border-vicky-400/60 dark:border-vicky-600/40 shadow-glow-sm ring-1 ring-vicky-500/20'
          : 'border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600/60'
        }
      `}>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">
            {attachments.map((att) => (
              <ImageAttachmentPreview
                key={att.id}
                url={att.url}
                filename={att.original_filename}
                onRemove={() => handleRemoveAttachment(att.id)}
                size="sm"
              />
            ))}
          </div>
        )}

        {/* Input Row */}
        <div className="flex items-end gap-2 p-2 sm:p-2.5">
          {/* Attach button */}
          <button
            type="button"
            disabled={isGenerating || isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all disabled:opacity-40"
            title="Attach image"
          >
            {isUploading
              ? <Loader2 className="w-5 h-5 animate-spin text-vicky-500" />
              : <Paperclip className="w-5 h-5" />
            }
          </button>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileChange} />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            placeholder={
              isGenerating
                ? 'Vicky is thinking...'
                : hasImagesAttached
                ? 'Ask about this image...'
                : 'Message VickyAI...'
            }
            className="flex-1 min-h-[36px] max-h-48 resize-none bg-transparent text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none leading-relaxed py-2 disabled:opacity-60"
          />

          {/* Send / Stop Button */}
          {isGenerating ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-sm transition-all"
              title="Stop generation"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!canSend}
              onClick={handleSend}
              className={`
                shrink-0 p-2 rounded-xl transition-all duration-150 shadow-sm
                ${canSend
                  ? 'bg-vicky-600 hover:bg-vicky-700 text-white shadow-glow-sm hover:shadow-glow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 shadow-none cursor-not-allowed'
                }
              `}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-1.5 text-center text-[10px] text-slate-400 dark:text-slate-600 select-none">
        VickyAI · Local LAN · Always verify critical information
      </p>
    </div>
  );
};
