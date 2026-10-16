import React from 'react';
import { Conversation } from '../../types/conversation';
import { ConversationItem } from './ConversationItem';

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

  const renderSection = (title: string, items: Conversation[]) => {
    if (items.length === 0) return null;
    return (
      <div key={title} className="mb-4">
        <h4 className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {title}
        </h4>
        <div className="space-y-0.5 mt-1">
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
      <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
        No conversations yet. Start a new chat with Vicky!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2">
      {renderSection('Today', groups.today)}
      {renderSection('Yesterday', groups.yesterday)}
      {renderSection('Previous 7 Days', groups.previous7Days)}
      {renderSection('Older', groups.older)}
      {renderSection('Archived', groups.archived)}
    </div>
  );
};
