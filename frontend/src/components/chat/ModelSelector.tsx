import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Eye, Brain, Sparkles } from 'lucide-react';
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
    badge: 'Fast · Vision',
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
        className={`
          group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-left
          bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/90
          border border-slate-200/90 dark:border-slate-800/90 hover:border-vicky-400/50 dark:hover:border-vicky-500/40
          shadow-xs hover:shadow-card
          transition-all duration-200 ease-spring
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <span className="w-6 h-6 rounded-lg bg-vicky-500/10 dark:bg-vicky-500/20 text-vicky-600 dark:text-vicky-400 flex items-center justify-center text-xs shrink-0 select-none">
          {activeModelInfo.icon || '🤖'}
        </span>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-vicky-600 dark:group-hover:text-vicky-400 transition-colors">
              {activeModelInfo.name}
            </span>
            {activeModelInfo.supports_vision && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Eye className="w-2.5 h-2.5" />
                Vision
              </span>
            )}
            {activeModelInfo.supports_thinking && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Brain className="w-2.5 h-2.5" />
                Reasoning
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            {activeModelInfo.badge}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-200 ml-0.5 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-modal p-1.5 z-50 animate-slide-up">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800/60 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-vicky-500" />
              Select AI Engine
            </span>
            <span className="text-[10px] text-slate-400 font-mono">LAN Ollama</span>
          </div>

          <div className="space-y-1">
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
                  className={`
                    w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-all duration-150
                    ${isSelected
                      ? 'bg-vicky-500/10 dark:bg-vicky-500/15 border border-vicky-500/30 text-vicky-950 dark:text-vicky-100 shadow-xs'
                      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60 border border-transparent text-slate-700 dark:text-slate-200'
                    }
                  `}
                >
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 mt-0.5 select-none ${
                    isSelected
                      ? 'bg-vicky-600 text-white shadow-glow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {model.icon || '🤖'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {model.name}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-vicky-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {model.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      {model.supports_vision ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Eye className="w-2.5 h-2.5" /> Vision Ready
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          Text Only
                        </span>
                      )}
                      {model.supports_thinking && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          <Brain className="w-2.5 h-2.5" /> Deep Reasoning
                        </span>
                      )}
                      <span className="ml-auto text-[10px] text-slate-400 font-mono">
                        {model.badge}
                      </span>
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
