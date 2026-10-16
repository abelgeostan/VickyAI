import React, { useState, useEffect } from 'react';
import { X, Sun, Moon, Laptop, Bot, MessageSquare, User, Info, Server, Database } from 'lucide-react';
import { AppSettings, applyTheme, saveSettings } from '../../stores/settingsStore';
import { User as UserType } from '../../types/auth';
import { ModelInfo } from '../../types/model';
import { vickyScenes } from '../../assets/vicky';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  models: ModelInfo[];
  user: UserType | null;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  models,
  user,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'ai' | 'chat' | 'account' | 'about'>('appearance');
  const [systemHealth, setSystemHealth] = useState<{ database: string; ollama: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/health')
        .then((res) => res.json())
        .then((data) => setSystemHealth(data))
        .catch(() => setSystemHealth({ database: 'error', ollama: 'error' }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    const next = { ...settings, theme };
    onUpdateSettings(next);
    saveSettings(next);
    applyTheme(theme);
  };

  const handleSettingToggle = (key: keyof AppSettings, val: any) => {
    const next = { ...settings, [key]: val };
    onUpdateSettings(next);
    saveSettings(next);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-modal overflow-hidden flex flex-col max-h-[85vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Settings</h2>
            <span className="text-xs">🐾</span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Tabs + Panel) */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* Tabs Sidebar */}
          <div className="sm:w-48 p-2.5 bg-slate-50/80 dark:bg-slate-950/60 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800/80 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible shrink-0">
            {[
              { id: 'appearance', label: 'Appearance', icon: Sun },
              { id: 'ai', label: 'AI Engine', icon: Bot },
              { id: 'chat', label: 'Chat Prefs', icon: MessageSquare },
              { id: 'account', label: 'Account', icon: User },
              { id: 'about', label: 'About VickyAI', icon: Info },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 whitespace-nowrap transition-all duration-150
                    ${isActive
                      ? 'bg-vicky-600 text-white shadow-glow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Panel */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto">
            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                    Theme Mode
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3.5">
                    Customize the interface appearance on your device.
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'light', label: 'Light', icon: Sun, color: 'text-amber-500' },
                      { id: 'dark', label: 'Dark', icon: Moon, color: 'text-purple-400' },
                      { id: 'system', label: 'System', icon: Laptop, color: 'text-slate-400' },
                    ].map((themeOpt) => {
                      const Icon = themeOpt.icon;
                      const isSelected = settings.theme === themeOpt.id;
                      return (
                        <button
                          key={themeOpt.id}
                          type="button"
                          onClick={() => handleThemeChange(themeOpt.id as any)}
                          className={`
                            p-3.5 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all duration-150
                            ${isSelected
                              ? 'border-vicky-500 bg-vicky-500/10 text-vicky-600 dark:text-vicky-400 font-bold shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                            }
                          `}
                        >
                          <Icon className={`w-5 h-5 ${themeOpt.color}`} />
                          <span className="text-xs font-semibold">{themeOpt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* AI Settings */}
            {activeTab === 'ai' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                    Default AI Model
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3.5">
                    Preferred model automatically selected for new conversations.
                  </p>
                  <div className="space-y-2">
                    {models.map((m) => {
                      const isSelected = settings.defaultModel === m.id;
                      return (
                        <label
                          key={m.id}
                          className={`
                            flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-150
                            ${isSelected
                              ? 'border-vicky-500/60 bg-vicky-500/10 text-vicky-950 dark:text-vicky-100 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="defaultModel"
                            value={m.id}
                            checked={isSelected}
                            onChange={(e) => handleSettingToggle('defaultModel', e.target.value)}
                            className="mt-1 text-vicky-600 focus:ring-vicky-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-slate-100">
                              <span>{m.icon}</span>
                              <span>{m.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal">({m.badge})</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {m.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Preferences */}
            {activeTab === 'chat' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Enter to Send
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Press Enter to send messages immediately.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enterToSend}
                      onChange={(e) => handleSettingToggle('enterToSend', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vicky-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Show Timestamps
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Display message sending time in chat bubbles.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showTimestamps}
                      onChange={(e) => handleSettingToggle('showTimestamps', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vicky-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Account */}
            {activeTab === 'account' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                    <div className="w-10 h-10 rounded-xl bg-gradient-brand text-white font-bold text-sm flex items-center justify-center uppercase shrink-0 shadow-sm">
                      {user?.username?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {user?.username || 'Guest'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user?.email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">Account ID:</span>
                    <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px]">
                      {user?.id || 'local'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 font-semibold text-xs hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors shadow-xs"
                >
                  Log out of VickyAI
                </button>
              </div>
            )}

            {/* About */}
            {activeTab === 'about' && (
              <div className="space-y-4 animate-fade-in text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-2xl bg-vicky-500/5 border border-vicky-500/15">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md ring-2 ring-vicky-500/30 shrink-0">
                    <img
                      src={vickyScenes.coding}
                      alt="Vicky Coding"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1">
                      <span>VickyAI</span>
                      <span className="text-sm">🐾</span>
                    </h3>
                    <p className="text-xs text-vicky-600 dark:text-vicky-400 font-semibold">
                      v1.0.0 · Production Local AI Stack
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Personal ChatGPT-style service inspired by Vicky the yellow Labrador mascot.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-slate-400" />
                      PostgreSQL Persistence:
                    </span>
                    <span className="font-semibold flex items-center gap-1.5">
                      {systemHealth?.database === 'connected' ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-emerald-600 dark:text-emerald-400">Connected</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-red-500">Checking...</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-slate-400" />
                      Ollama External LAN:
                    </span>
                    <span className="font-semibold flex items-center gap-1.5">
                      {systemHealth?.ollama === 'connected' ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-emerald-600 dark:text-emerald-400">Active (192.168.1.24)</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-red-500">Connecting...</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
