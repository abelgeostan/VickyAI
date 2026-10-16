import React from 'react';
import { Archive } from 'lucide-react';
import { Conversation } from '../../types/conversation';
import { ConversationItem } from './ConversationItem';
import { vickyBrand } from '../../assets/vicky';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onArchive: (id: string, archived: boolean) => void;
  onDelete: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
  onRename,
  onArchive,
  onDelete,
}) => {
  // Group conversations by date
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const startOfSevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: {
    today: Conversation[];
    yesterday: Conversation[];
    previous7Days: Conversation[];
    older: Conversation[];
    archived: Conversation[];
  } = {
    today: [],
    yesterday: [],
    previous7Days: [],
    older: [],
    archived: [],
  };

  for (const conv of conversations) {
    if (conv.archived) {
      groups.archived.push(conv);
      continue;
    }

    const convDate = new Date(conv.updated_at || conv.created_at);
    if (convDate >= startOfToday) {
      groups.today.push(conv);
    } else if (convDate >= startOfYesterday) {
      groups.yesterday.push(conv);
    } else if (convDate >= startOfSevenDaysAgo) {
      groups.previous7Days.push(conv);
    } else {
      groups.older.push(conv);
    }
  }

  const renderSection = (title: string, items: Conversation[], isArchived = false) => {
    if (items.length === 0) return null;
    return (
      <div key={title} className="mb-3">
        <div className="flex items-center justify-between px-2.5 py-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            {isArchived && <Archive className="w-3 h-3 text-slate-400" />}
            {title}
          </span>
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.2 rounded-full">
            {items.length}
          </span>
        </div>
        <div className="space-y-0.5 mt-0.5">
          {items.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeId}
              onSelect={onSelect}
              onRename={onRename}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    );
  };

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
        <div className="w-14 h-14 rounded-2xl overflow-hidden mb-3 opacity-60 border border-slate-200 dark:border-slate-800">
          <img src={vickyBrand.avatarCircle} alt="Vicky" className="w-full h-full object-cover" />
        </div>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          No chats yet
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[160px] leading-tight">
          Say hello to Vicky to start your first conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2 scroll-smooth">
      {renderSection('Today', groups.today)}
      {renderSection('Yesterday', groups.yesterday)}
      {renderSection('Previous 7 Days', groups.previous7Days)}
      {renderSection('Older', groups.older)}
      {renderSection('Archived', groups.archived, true)}
    </div>
  );
};
