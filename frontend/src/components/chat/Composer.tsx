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

  // Check if current model supports vision
  const currentModelInfo = models.find((m) => m.id === selectedModel);
  const supportsVision = currentModelInfo?.supports_vision ?? true;
  const hasImagesAttached = attachments.length > 0;
  const showVisionWarning = hasImagesAttached && !supportsVision;

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (isGenerating) {
      onStopGeneration();
      return;
    }

    if (!text.trim() && attachments.length === 0) return;

    if (showVisionWarning) {
      return; // Prevent sending images to non-vision models
    }

    onSendMessage(
      text.trim(),
      attachments.map((a) => a.id)
    );
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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
        const file = files[i];
        const res = await uploadService.upload(file);
        setAttachments((prev) => [...prev, res]);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-3 sm:pb-6 shrink-0">
      {/* Vision Warning Banner if image attached to non-vision model */}
      {showVisionWarning && (
        <div className="mb-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>{currentModelInfo?.name || selectedModel}</strong> does not support image analysis.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectModel('gemma3:4b')}
            className="px-2.5 py-1 rounded-lg bg-vicky-600 hover:bg-vicky-700 text-white font-semibold text-xs whitespace-nowrap shadow-sm transition-colors"
          >
            Switch to Gemma 3 4B
          </button>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="mb-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="font-bold underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Composer Box */}
      <div className="relative rounded-2xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-lg focus-within:border-vicky-500 focus-within:ring-2 focus-within:ring-vicky-500/20 transition-all duration-200 overflow-hidden">
        {/* Attached Images Preview Row */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2.5 p-3 pb-0 border-b border-slate-100 dark:border-slate-800">
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

        {/* Input Text Area */}
        <div className="flex items-end gap-2 p-2.5 sm:p-3">
          {/* Attachment Button */}
          <button
            type="button"
            disabled={isGenerating || isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Attach image (PNG, JPEG, WEBP)"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-vicky-500" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isGenerating
                ? 'Vicky is generating response...'
                : hasImagesAttached
                ? 'Ask a question about this image...'
                : 'Message VickyAI...'
            }
            className="flex-1 max-h-48 resize-none bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none leading-relaxed py-1.5"
          />

          {/* Send / Stop Button */}
          {isGenerating ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-colors"
              title="Stop generation"
            >
              <Square className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline font-bold">STOP</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={(!text.trim() && attachments.length === 0) || showVisionWarning}
              onClick={handleSend}
              className="p-2 rounded-xl bg-vicky-600 hover:bg-vicky-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 shadow-md transition-all duration-150 disabled:shadow-none"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Footer disclaimer */}
      <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500 select-none">
        VickyAI runs locally on your LAN. Always verify critical code and operational guidance.
      </p>
    </div>
  );
};
