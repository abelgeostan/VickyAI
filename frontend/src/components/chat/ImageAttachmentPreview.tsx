import React, { useState } from 'react';
import { X, ZoomIn, ExternalLink } from 'lucide-react';

interface ImageAttachmentPreviewProps {
  url: string;
  filename?: string;
  onRemove?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const ImageAttachmentPreview: React.FC<ImageAttachmentPreviewProps> = ({
  url,
  filename = 'Attached image',
  onRemove,
  size = 'md',
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
  };

  return (
    <>
      <div
        className={`relative group inline-block rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800 shadow-xs hover:shadow-card transition-all duration-200 ease-spring ${sizeClasses[size]}`}
      >
        <img
          src={url}
          alt={filename}
          className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
          onClick={() => setModalOpen(true)}
        />

        {/* Hover zoom overlay */}
        <div
          onClick={() => setModalOpen(true)}
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-200 text-white"
        >
          <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-md">
            <ZoomIn className="w-4 h-4" />
          </div>
        </div>

        {/* Remove button if editing/composing */}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors z-10 shadow-sm"
            title="Remove attachment"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Full Size Lightbox Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden bg-white/10 dark:bg-slate-900/90 border border-white/20 dark:border-slate-700/60 shadow-modal p-3 animate-slide-up flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 px-2 text-white">
              <span className="text-xs font-medium truncate max-w-xs text-slate-300">{filename}</span>
              <div className="flex items-center gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  download={filename}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
                  title="Open original"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <img
              src={url}
              alt={filename}
              className="max-w-full max-h-[78vh] object-contain rounded-2xl mx-auto shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};
