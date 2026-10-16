import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Eye, Brain } from 'lucide-react';

import { ModelInfo } from '../../types/model';

interface ModelSelectorProps {
  models: ModelInfo[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelectModel,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeModelInfo = models.find((m) => m.id === selectedModel) || {
    id: selectedModel,
    name: selectedModel || 'Gemma 3 4B',
    badge: 'Fast • Vision',
    description: 'Fast local general model',
    supports_vision: true,
    supports_thinking: false,
    icon: '⚡',
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-sm font-medium text-slate-800 dark:text-slate-100 shadow-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-base select-none">{activeModelInfo.icon || '🤖'}</span>
        <div className="flex flex-col text-left">
          <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            {activeModelInfo.name}
            {activeModelInfo.supports_vision && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                <Eye className="w-2.5 h-2.5" />
                Vision
              </span>
            )}
            {activeModelInfo.supports_thinking && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[10px] font-medium bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
                <Brain className="w-2.5 h-2.5" />
                Reasoning
              </span>
            )}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
            {activeModelInfo.badge}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800/60 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Select AI Engine
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto px-1 space-y-1">
            {models.map((model) => {
              const isSelected = model.id === selectedModel;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                    isSelected
                      ? 'bg-vicky-50 dark:bg-vicky-950/40 text-vicky-900 dark:text-vicky-200 border border-vicky-200 dark:border-vicky-800/60'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5 select-none">{model.icon || '🤖'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs truncate">{model.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-vicky-600 dark:text-vicky-400" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {model.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {model.supports_vision ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                          <Eye className="w-3 h-3" /> Vision Supported
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          Text Only
                        </span>
                      )}
                      {model.supports_thinking && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900">
                          <Brain className="w-3 h-3" /> Thinking
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
