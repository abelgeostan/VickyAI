import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

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
        className={`relative group inline-block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm ${sizeClasses[size]}`}
      >
        <img
          src={url}
          alt={filename}
          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={() => setModalOpen(true)}
        />

        {/* Hover zoom icon */}
        <div
          onClick={() => setModalOpen(true)}
          className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white"
        >
          <ZoomIn className="w-5 h-5" />
        </div>

        {/* Remove button if editing/composing */}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/90 text-white rounded-full transition-colors z-10"
            title="Remove attachment"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Full Size Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={url}
              alt={filename}
              className="max-w-full max-h-[82vh] object-contain rounded-lg mx-auto"
            />
            <p className="mt-2 text-center text-xs text-slate-400 truncate px-4">{filename}</p>
          </div>
        </div>
      )}
    </>
  );
};
