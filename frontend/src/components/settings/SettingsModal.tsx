import React, { useState, useEffect } from 'react';
import { X, Sun, Moon, Laptop, Bot, MessageSquare, User, Info, CheckCircle, XCircle } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Settings</span>
            <span className="text-xs">🐾</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Tabs + Panel) */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* Tabs Sidebar */}
          <div className="sm:w-44 p-2 sm:p-3 bg-slate-50 dark:bg-slate-950/40 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible">
            <button
              type="button"
              onClick={() => setActiveTab('appearance')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'appearance'
                  ? 'bg-vicky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Appearance</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'ai'
                  ? 'bg-vicky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Engine</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'chat'
                  ? 'bg-vicky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat Prefs</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'account'
                  ? 'bg-vicky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Account</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'about'
                  ? 'bg-vicky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>About</span>
            </button>
          </div>

          {/* Tab Panel */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto">
            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    Theme Mode
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Choose how VickyAI appears on your device.
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleThemeChange('light')}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                        settings.theme === 'light'
                          ? 'border-vicky-500 bg-vicky-50/50 dark:bg-vicky-950/40 text-vicky-700 dark:text-vicky-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Sun className="w-5 h-5 text-amber-500" />
                      <span className="text-xs">Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleThemeChange('dark')}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                        settings.theme === 'dark'
                          ? 'border-vicky-500 bg-vicky-50/50 dark:bg-vicky-950/40 text-vicky-700 dark:text-vicky-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Moon className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs">Dark</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleThemeChange('system')}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                        settings.theme === 'system'
                          ? 'border-vicky-500 bg-vicky-50/50 dark:bg-vicky-950/40 text-vicky-700 dark:text-vicky-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Laptop className="w-5 h-5 text-slate-400" />
                      <span className="text-xs">System</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AI Settings */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    Default AI Model
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Selected model for new conversations.
                  </p>
                  <div className="space-y-2">
                    {models.map((m) => (
                      <label
                        key={m.id}
                        className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${
                          settings.defaultModel === m.id
                            ? 'border-vicky-500 bg-vicky-50/40 dark:bg-vicky-950/30'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="defaultModel"
                          value={m.id}
                          checked={settings.defaultModel === m.id}
                          onChange={(e) => handleSettingToggle('defaultModel', e.target.value)}
                          className="mt-1 text-vicky-600 focus:ring-vicky-500"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-slate-100">
                            <span>{m.icon}</span>
                            <span>{m.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({m.badge})</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{m.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Preferences */}
            {activeTab === 'chat' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Enter to Send
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Press Enter to send, Shift+Enter for new line.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enterToSend}
                    onChange={(e) => handleSettingToggle('enterToSend', e.target.checked)}
                    className="w-4 h-4 rounded text-vicky-600 focus:ring-vicky-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Show Timestamps
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Display message sending time.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showTimestamps}
                    onChange={(e) => handleSettingToggle('showTimestamps', e.target.checked)}
                    className="w-4 h-4 rounded text-vicky-600 focus:ring-vicky-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Account */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Username:</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {user?.username || 'Guest'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Email:</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {user?.email || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Account ID:</span>
                    <span className="text-[10px] font-mono text-slate-400">
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
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                >
                  Log out of VickyAI
                </button>
              </div>
            )}

            {/* About */}
            {activeTab === 'about' && (
              <div className="space-y-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md border-2 border-vicky-400 shrink-0">
                    <img
                      src={vickyScenes.coding}
                      alt="Vicky Coding"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      VickyAI 🐾
                    </h3>
                    <p className="text-xs text-vicky-600 dark:text-vicky-400 font-semibold">
                      Version 1.0.0 (Production Local Stack)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Named after Vicky the yellow Labrador. Master reference with headset and blue glowing paw.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">PostgreSQL Database:</span>
                    <span className="font-semibold flex items-center gap-1">
                      {systemHealth?.database === 'connected' ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Connected</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span className="text-rose-600">Checking...</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Ollama LAN Service:</span>
                    <span className="font-semibold flex items-center gap-1">
                      {systemHealth?.ollama === 'connected' ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Connected (LAN)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span className="text-rose-600">Reaching...</span>
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
