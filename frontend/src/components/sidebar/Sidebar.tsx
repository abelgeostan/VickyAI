import React from 'react';
import { Plus, Search, Settings, LogOut, X, Shield } from 'lucide-react';
import { Conversation } from '../../types/conversation';
import { User, isUserAdmin } from '../../types/auth';
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
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
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
  isAdmin,
  onOpenAdmin,
}) => {
  const adminActive = isAdmin ?? isUserAdmin(user);
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-72
          flex flex-col h-full
          bg-surface-50 dark:bg-[#0c111d]
          border-r border-slate-200/80 dark:border-slate-800/60
          transition-transform duration-300 ease-spring
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >

        {/* ── Brand Header ── */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200/60 dark:border-slate-800/60 shrink-0">
          <button
            type="button"
            onClick={() => { onNewChat(); onClose(); }}
            className="flex items-center gap-3 group"
          >
            {/* Vicky avatar */}
            <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-2 ring-vicky-500/30 shadow-glow-sm shrink-0">
              <img src={vickyBrand.avatarCircle} alt="VickyAI" className="w-full h-full object-cover" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-[15px] tracking-tight text-slate-900 dark:text-white leading-none">
                  Vicky<span className="text-vicky-500">AI</span>
                </span>
                <span className="text-xs leading-none">🐾</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Local AI Companion
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── New Chat Button ── */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <button
            type="button"
            onClick={() => { onNewChat(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-vicky-600 hover:bg-vicky-700 text-white text-[13px] font-semibold shadow-glow-sm hover:shadow-glow transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* ── Search ── */}
        <div className="px-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-8 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-[12px] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-vicky-500/40 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* ── Conversation List ── */}
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => { onSelectConversation(id); onClose(); }}
          onRename={onRenameConversation}
          onArchive={onArchiveConversation}
          onDelete={onDeleteConversation}
        />

        {/* ── Admin Dashboard Button (Only for Admin) ── */}
        {adminActive && (
          <div className="px-3 pt-2 pb-1 shrink-0">
            <button
              type="button"
              onClick={() => { onOpenAdmin?.(); onClose(); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 text-xs font-semibold shadow-xs transition-all duration-150 group"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                <span>Admin Dashboard</span>
              </div>
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-md bg-purple-200/80 dark:bg-purple-900/80 text-purple-800 dark:text-purple-200">
                Admin
              </span>
            </button>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="shrink-0 px-3 py-3 border-t border-slate-200/60 dark:border-slate-800/60 bg-surface-50/80 dark:bg-[#0c111d]/80">
          <div className="flex items-center gap-2">
            {/* User avatar */}
            <div className="w-8 h-8 rounded-lg bg-gradient-brand text-white font-bold text-xs flex items-center justify-center uppercase shrink-0 shadow-sm select-none">
              {user?.username?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
                {user?.username || 'Local User'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || ''}
              </p>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              {adminActive && (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-100/60 dark:hover:bg-purple-900/40 transition-colors"
                  title="Admin Dashboard"
                >
                  <Shield className="w-4 h-4" />
                </button>
              )}
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
