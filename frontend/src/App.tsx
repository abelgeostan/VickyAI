import React, { useState, useEffect, useRef } from 'react';
import { Menu, Plus } from 'lucide-react';
import { authService } from './services/authService';
import { conversationService } from './services/conversationService';
import { modelService } from './services/modelService';
import { chatService } from './services/chatService';
import { User } from './types/auth';
import { Conversation } from './types/conversation';
import { Message } from './types/chat';
import { ModelInfo } from './types/model';
import { AppSettings, loadSettings, applyTheme } from './stores/settingsStore';

import { Sidebar } from './components/sidebar/Sidebar';
import { ModelSelector } from './components/chat/ModelSelector';
import { MessageList } from './components/chat/MessageList';
import { Composer } from './components/chat/Composer';
import { WelcomeScreen } from './components/chat/WelcomeScreen';
import { SettingsModal } from './components/settings/SettingsModal';
import { AuthModal } from './components/common/AuthModal';


export const App: React.FC = () => {
  // App state
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gemma3:4b');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);
  const activeConvIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  // Initialize theme and load auth on mount
  useEffect(() => {
    applyTheme(settings.theme);

    // Listen for 401 unauthorized events
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    // Initial user check
    authService
      .getMe()
      .then((me) => setUser(me))
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  // Fetch models
  useEffect(() => {
    modelService
      .list()
      .then((res) => {
        setModels(res.models);
        if (res.default_model) {
          setSelectedModel(res.default_model);
        }
      })
      .catch((err) => console.error('Failed to load models:', err));
  }, []);

  // Fetch conversations when user is logged in
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setActiveConvId(null);
      activeConvIdRef.current = null;
      setMessages([]);
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      const list = await conversationService.list(true);
      setConversations(list);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  // Load active conversation messages when user selects a conversation
  const loadConversationMessages = async (id: string) => {
    try {
      const detail = await conversationService.get(id);
      setMessages(detail.messages || []);
      if (detail.model) {
        setSelectedModel(detail.model);
      }
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    }
  };

  // Handle New Chat
  const handleNewChat = () => {
    if (isGeneratingRef.current && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
    isGeneratingRef.current = false;
    setActiveConvId(null);
    activeConvIdRef.current = null;
    setMessages([]);
    setSelectedModel(settings.defaultModel || 'gemma3:4b');
  };

  // Select conversation
  const handleSelectConversation = (id: string) => {
    if (id === activeConvIdRef.current && messages.length > 0) return;
    if (isGeneratingRef.current && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
    setActiveConvId(id);
    activeConvIdRef.current = id;
    loadConversationMessages(id);
  };


  // Rename conversation
  const handleRename = async (id: string, newTitle: string) => {
    try {
      await conversationService.update(id, { title: newTitle });
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
      );
    } catch (err) {
      console.error('Rename failed:', err);
    }
  };

  // Archive conversation
  const handleArchive = async (id: string, archived: boolean) => {
    try {
      await conversationService.update(id, { archived });
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, archived } : c))
      );
    } catch (err) {
      console.error('Archive failed:', err);
    }
  };

  // Delete conversation
  const handleDelete = async (id: string) => {
    try {
      await conversationService.delete(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Send message and handle streaming
  const handleSendMessage = async (
    textContent: string,
    attachmentIds: string[],
    regenerateMsgId?: string
  ) => {
    if (!textContent.trim() && attachmentIds.length === 0) return;

    setIsGenerating(true);
    isGeneratingRef.current = true;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentConvId = activeConvIdRef.current;

    // Temporary optimistic user message
    const tempUserMsgId = `temp-${Date.now()}`;
    const userMsg: Message = {
      id: tempUserMsgId,
      conversation_id: currentConvId || '',
      role: 'user',
      content: textContent,
      model: selectedModel,
      created_at: new Date().toISOString(),
    };

    // Temporary optimistic assistant placeholder
    const tempAssistantMsgId = `temp-assist-${Date.now()}`;
    const assistantPlaceholder: Message = {
      id: tempAssistantMsgId,
      conversation_id: currentConvId || '',
      role: 'assistant',
      content: '',
      model: selectedModel,
      created_at: new Date().toISOString(),
      isStreaming: true,
      isThinking: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);

    await chatService.streamChat({
      conversationId: currentConvId || undefined,
      message: textContent,
      model: selectedModel,
      attachmentIds,
      regenerateMessageId: regenerateMsgId,
      signal: controller.signal,
      onStart: (data) => {
        activeConvIdRef.current = data.conversation_id;
        setActiveConvId(data.conversation_id);
        loadConversations();
      },

      onReasoning: (data) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempAssistantMsgId
              ? {
                  ...m,
                  isThinking: true,
                  thinkingContent: (m.thinkingContent || '') + data.token,
                }
              : m
          )
        );
      },
      onToken: (data) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempAssistantMsgId
              ? {
                  ...m,
                  isThinking: false,
                  content: m.content + data.token,
                }
              : m
          )
        );
      },
      onComplete: (data) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempAssistantMsgId
              ? {
                  ...m,
                  id: data.assistant_message_id,
                  isStreaming: false,
                  isThinking: false,
                  token_count: data.token_count,
                  generation_time: data.generation_time,
                }
              : m
          )
        );
        setIsGenerating(false);
        isGeneratingRef.current = false;
        abortControllerRef.current = null;
        loadConversations();
      },
      onCancelled: () => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempAssistantMsgId
              ? {
                  ...m,
                  isStreaming: false,
                  isThinking: false,
                  content: m.content ? m.content + ' [Generation stopped]' : 'Generation stopped.',
                }
              : m
          )
        );
        setIsGenerating(false);
        isGeneratingRef.current = false;
        abortControllerRef.current = null;
      },
      onError: (errMsg) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempAssistantMsgId
              ? {
                  ...m,
                  isStreaming: false,
                  isThinking: false,
                  error: errMsg,
                  content: 'Woof... I encountered an issue reaching my AI brain.',
                }
              : m
          )
        );
        setIsGenerating(false);
        isGeneratingRef.current = false;
        abortControllerRef.current = null;
      },

    });
  };

  // Stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last assistant response
  const handleRegenerate = (messageId: string) => {
    // Find prior user message
    const msgIdx = messages.findIndex((m) => m.id === messageId);
    if (msgIdx <= 0) return;

    let priorUserMsg: Message | null = null;
    for (let i = msgIdx - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        priorUserMsg = messages[i];
        break;
      }
    }

    if (priorUserMsg) {
      handleSendMessage(
        priorUserMsg.content,
        (priorUserMsg.attachments || []).map((a) => a.id),
        messageId
      );
    }
  };

  // Edit user message
  const handleEditUserMessage = (messageId: string, newContent: string) => {
    handleSendMessage(newContent, [], messageId);
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) =>
    searchQuery.trim()
      ? c.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="flex h-screen h-[100dvh] w-screen overflow-hidden bg-white dark:bg-slate-950 font-sans">
      {/* Auth Modal if unauthenticated */}
      {authChecked && !user && (
        <AuthModal onSuccess={(authenticatedUser) => setUser(authenticatedUser)} />
      )}

      {/* Sidebar (Desktop fixed, Mobile drawer) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        conversations={filteredConversations}
        activeId={activeConvId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={handleRename}
        onArchiveConversation={handleArchive}
        onDeleteConversation={handleDelete}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSettings={() => setIsSettingsOpen(true)}
        user={user}
        onLogout={() => {
          authService.logout();
          setUser(null);
        }}
      />

      {/* Main Chat View */}
      <main className="flex-1 flex flex-col h-full min-h-0 min-w-0 bg-white dark:bg-slate-950 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800/80 px-3 sm:px-6 flex items-center justify-between shrink-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Hamburger on mobile */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Model Selector */}
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              disabled={isGenerating}
            />

            {/* Active conversation title */}
            {activeConversation && (
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-400 dark:text-slate-500 truncate max-w-xs pl-2 border-l border-slate-200 dark:border-slate-800">
                {activeConversation.title}
              </span>
            )}
          </div>

          {/* New Chat Top Button */}
          <button
            type="button"
            onClick={handleNewChat}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Start new conversation"
          >
            <Plus className="w-5 h-5" />
          </button>
        </header>

        {/* Content: Welcome Screen or Message List */}
        {messages.length === 0 ? (
          <WelcomeScreen
            onSelectPrompt={(promptText) => handleSendMessage(promptText, [])}
          />
        ) : (
          <MessageList
            messages={messages}
            onRegenerate={handleRegenerate}
            onEdit={handleEditUserMessage}
            showTimestamps={settings.showTimestamps}
          />
        )}

        {/* Bottom Composer */}
        <Composer
          onSendMessage={(msg, atts) => handleSendMessage(msg, atts)}
          onStopGeneration={handleStopGeneration}
          isGenerating={isGenerating}
          selectedModel={selectedModel}
          models={models}
          onSelectModel={setSelectedModel}
          enterToSend={settings.enterToSend}
        />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        models={models}
        user={user}
        onLogout={() => {
          authService.logout();
          setUser(null);
        }}
      />
    </div>
  );
};

export default App;
