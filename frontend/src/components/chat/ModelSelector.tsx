import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Eye, Brain, Sparkles } from 'lucide-react';
import { ModelInfo } from '../../types/model';

interface ModelSelectorProps {
  models: ModelInfo[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
}

// Crisp, readable one-line summaries that fit beautifully on mobile without truncation
const getOneLineDescription = (model: ModelInfo): string => {
  const id = model.id?.toLowerCase() || '';
  const name = model.name?.toLowerCase() || '';

  if (id.includes('gemma') || name.includes('gemma')) {
    return 'Fast multimodal model for chat & vision';
  }
  if (id.includes('qwen') || name.includes('qwen')) {
    return 'Deep reasoning for code & complex logic';
  }
  if (id.includes('llama') || name.includes('llama')) {
    return 'Versatile model for general reasoning';
  }
  if (id.includes('deepseek') || name.includes('deepseek')) {
    return 'Deep reasoning & code generation';
  }
  if (id.includes('mistral') || name.includes('mistral')) {
    return 'Fast & agile general assistant';
  }
  if (id.includes('phi') || name.includes('phi')) {
    return 'Compact reasoning & problem solving';
  }

  // Fallback: If description has a concise first sentence, use it
  if (model.description) {
    const firstSentence = model.description.split('.')[0]?.trim();
    if (firstSentence && firstSentence.length > 5 && firstSentence.length <= 50) {
      return firstSentence;
    }
  }

  return model.badge || model.description || 'Local AI model';
};

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelectModel,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const activeModelInfo = models.find((m) => m.id === selectedModel) || {
    id: selectedModel,
    name: selectedModel || 'Gemma 3 4B',
    badge: 'Fast · Vision',
    description: 'Fast multimodal model for chat & vision',
    supports_vision: true,
    supports_thinking: false,
    icon: '⚡',
  };

  const displayModels = models.length > 0 ? models : [activeModelInfo];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button: Sleek, compact pill on mobile, refined full info on desktop */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`
          group inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:py-1.5 rounded-xl text-left
          bg-slate-100/90 dark:bg-slate-900/90 hover:bg-slate-200/70 dark:hover:bg-slate-800/90
          border border-slate-200/90 dark:border-slate-800/90 hover:border-vicky-400/50 dark:hover:border-vicky-500/40
          shadow-2xs hover:shadow-card
          transition-all duration-200 ease-spring
          disabled:opacity-50 disabled:cursor-not-allowed
          h-8.5 sm:h-9 shrink-0
        `}
        title={`Selected Model: ${activeModelInfo.name}`}
      >
        <span className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-lg bg-vicky-500/10 dark:bg-vicky-500/20 text-vicky-600 dark:text-vicky-400 flex items-center justify-center text-xs shrink-0 select-none">
          {activeModelInfo.icon || '🤖'}
        </span>
        <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 group-hover:text-vicky-600 dark:group-hover:text-vicky-400 transition-colors whitespace-nowrap">
          {activeModelInfo.name}
        </span>
        {activeModelInfo.supports_vision && (
          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <Eye className="w-2.5 h-2.5" />
            Vision
          </span>
        )}
        {activeModelInfo.supports_thinking && (
          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
            <Brain className="w-2.5 h-2.5" />
            Reasoning
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-200 shrink-0 ml-0.5 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <>
          {/* Mobile backdrop for tap-outside dismiss */}
          <div
            className="fixed inset-0 z-40 bg-black/25 dark:bg-black/50 backdrop-blur-2xs sm:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            role="listbox"
            className="
              fixed inset-x-3 top-[3.75rem] z-50 max-w-sm mx-auto
              sm:absolute sm:inset-x-auto sm:left-0 sm:top-full sm:mt-2 sm:w-80 sm:max-w-none sm:mx-0
              rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl
              border border-slate-200/90 dark:border-slate-800/90
              shadow-modal p-2
              animate-slide-up origin-top
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800/60 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-vicky-500" />
                Select AI Engine
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100/90 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LAN Ollama
              </span>
            </div>

            {/* Models list */}
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {displayModels.map((model) => {
                const isSelected = model.id === selectedModel;
                return (
                  <button
                    key={model.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelectModel(model.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full text-left p-2.5 sm:p-3 rounded-xl flex items-start gap-2.5 transition-all duration-150 group
                      ${isSelected
                        ? 'bg-vicky-500/10 dark:bg-vicky-500/15 border border-vicky-500/30 text-vicky-950 dark:text-vicky-100 shadow-2xs'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60 border border-transparent text-slate-700 dark:text-slate-200'
                      }
                    `}
                  >
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 select-none mt-0.5 transition-transform group-hover:scale-105 ${
                      isSelected
                        ? 'bg-vicky-600 text-white shadow-glow-sm'
                        : 'bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300'
                    }`}>
                      {model.icon || '🤖'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                            {model.name}
                          </span>
                          {model.supports_vision && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                              <Eye className="w-2.5 h-2.5" />
                              Vision
                            </span>
                          )}
                          {model.supports_thinking && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                              <Brain className="w-2.5 h-2.5" />
                              Reasoning
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <span className="w-4.5 h-4.5 rounded-full bg-vicky-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {getOneLineDescription(model)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
