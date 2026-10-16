import React from 'react';
import { Plus, Search, Settings, LogOut, X } from 'lucide-react';

import { Conversation } from '../../types/conversation';
import { User } from '../../types/auth';
import { ConversationList } from './ConversationList';
import { vickyBrand } from '../../assets/vicky';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, title: string) => void;
  onArchiveConversation: (id: string, archived: boolean) => void;
  onDeleteConversation: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSettings: () => void;
  user: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onArchiveConversation,
  onDeleteConversation,
  searchQuery,
  onSearchChange,
  onOpenSettings,
  user,
  onLogout,
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 md:w-80 flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header / Brand */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onNewChat}>
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-vicky-400">
              <img
                src={vickyBrand.avatarCircle}
                alt="VickyAI"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Vicky<span className="text-vicky-500">AI</span>
                </span>
                <span className="text-xs">🐾</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block -mt-0.5">
                Local AI Companion
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-vicky-600 hover:bg-vicky-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all duration-150 hover:shadow"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-vicky-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => {
            onSelectConversation(id);
            onClose();
          }}
          onRename={onRenameConversation}
          onArchive={onArchiveConversation}
          onDelete={onDeleteConversation}
        />

        {/* User Profile & Settings Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <div className="w-7 h-7 rounded-full bg-vicky-100 dark:bg-vicky-950 text-vicky-700 dark:text-vicky-300 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                {user?.username?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user?.username || 'Local User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'local@vickyai.internal'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
