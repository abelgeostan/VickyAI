import React, { useState } from 'react';
import { MessageSquare, Edit2, Archive, Trash2, Check, X } from 'lucide-react';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveRename = (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
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
        <form
          onSubmit={handleSaveRename}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-vicky-500"
        >
          <input
            type="text"
            autoFocus
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
          />
          <button
            type="submit"
            className="p-1 hover:text-emerald-500 transition-colors"
            title="Save title"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(false);
            }}
            className="p-1 hover:text-rose-500 transition-colors"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <div
          onClick={() => onSelect(conversation.id)}
          className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all duration-150 select-none ${
            isActive
              ? 'bg-vicky-100/80 dark:bg-vicky-950/60 text-vicky-900 dark:text-vicky-100 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5 truncate min-w-0 pr-2">
            <MessageSquare
              className={`w-4 h-4 shrink-0 ${
                isActive
                  ? 'text-vicky-600 dark:text-vicky-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            />
            <span className="truncate">{conversation.title}</span>
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="Rename"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(conversation.id, !conversation.archived);
              }}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title={conversation.archived ? 'Unarchive' : 'Archive'}
            >
              <Archive className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal / Popover */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
              Delete Conversation?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              This will permanently delete "<strong>{conversation.title}</strong>" and its messages. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
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
