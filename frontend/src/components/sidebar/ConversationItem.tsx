import React, { useState } from 'react';
import { MessageSquare, Edit2, Archive, ArchiveRestore, Trash2, Check, X, MoreHorizontal } from 'lucide-react';
import { Conversation } from '../../types/conversation';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onArchive: (id: string, archived: boolean) => void;
  onDelete: (id: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
  onRename,
  onArchive,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(conversation.title);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveRename = (e?: React.MouseEvent | React.FormEvent) => {
    e?.stopPropagation();
    if (titleInput.trim() && titleInput !== conversation.title) {
      onRename(conversation.id, titleInput.trim());
    }
    setIsEditing(false);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(conversation.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="relative group">
      {isEditing ? (
        // ── Edit Mode ──
        <form
          onSubmit={handleSaveRename}
          className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-vicky-400/60 shadow-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <MessageSquare className="w-3.5 h-3.5 text-vicky-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') setIsEditing(false); }}
            className="flex-1 bg-transparent text-[12px] text-slate-900 dark:text-slate-100 focus:outline-none min-w-0"
          />
          <button type="submit" onClick={handleSaveRename} className="p-0.5 text-slate-400 hover:text-emerald-500 transition-colors shrink-0">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => setIsEditing(false)} className="p-0.5 text-slate-400 hover:text-red-500 transition-colors shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        // ── Normal Mode ──
        <div
          onClick={() => onSelect(conversation.id)}
          className={`
            flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl cursor-pointer text-left w-full
            transition-all duration-150 select-none group
            ${isActive
              ? 'bg-vicky-600/10 dark:bg-vicky-500/10 border border-vicky-500/20 text-vicky-700 dark:text-vicky-300'
              : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-transparent'
            }
          `}
        >
          <MessageSquare className={`w-3.5 h-3.5 shrink-0 transition-colors ${
            isActive ? 'text-vicky-500' : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-500'
          }`} />
          <span className="flex-1 truncate text-[12px] font-medium leading-snug">
            {conversation.title}
          </span>

          {/* Actions button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Context Menu ── */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 shadow-modal overflow-hidden animate-fade-in">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Rename
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onArchive(conversation.id, !conversation.archived); setShowMenu(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {conversation.archived
                ? <><ArchiveRestore className="w-3.5 h-3.5 text-slate-400" /> Unarchive</>
                : <><Archive className="w-3.5 h-3.5 text-slate-400" /> Archive</>
              }
            </button>
            <div className="my-0.5 border-t border-slate-100 dark:border-slate-800" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); setShowMenu(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-modal animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delete Conversation?</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 pl-1 line-clamp-2">
              "<strong className="text-slate-700 dark:text-slate-300">{conversation.title}</strong>" and all its messages will be permanently deleted.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
