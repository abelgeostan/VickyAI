import React from 'react';
import { Sparkles, Terminal, Code, Eye, BookOpen, MessageSquare, Zap } from 'lucide-react';
import { vickyScenes } from '../../assets/vicky';

interface WelcomeScreenProps {
  onSelectPrompt: (promptText: string) => void;
}

const SUGGESTIONS = [
  {
    title: 'Explain Docker to me',
    subtitle: 'Containers, volumes, networking & compose',
    icon: Terminal,
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10 dark:bg-blue-500/10',
    border: 'border-blue-200/60 dark:border-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Help me debug Python',
    subtitle: 'FastAPI, async, memory & profiling',
    icon: Code,
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
    border: 'border-emerald-200/60 dark:border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    title: 'Analyze this image',
    subtitle: 'Multimodal vision · Gemma 3 4B',
    icon: Eye,
    gradient: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-500/10 dark:bg-purple-500/10',
    border: 'border-purple-200/60 dark:border-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Help me learn something',
    subtitle: 'Deep dives, tutorials & concepts',
    icon: BookOpen,
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10 dark:bg-amber-500/10',
    border: 'border-amber-200/60 dark:border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
  },
  {
    title: 'Ask VickyAI anything',
    subtitle: 'Private, fast, running on your LAN',
    icon: MessageSquare,
    gradient: 'from-vicky-500 to-pink-500',
    bg: 'bg-vicky-500/10 dark:bg-vicky-500/10',
    border: 'border-vicky-200/60 dark:border-vicky-500/20',
    text: 'text-vicky-600 dark:text-vicky-400',
  },
  {
    title: 'Compare two models',
    subtitle: 'Gemma vs Qwen · speed & quality',
    icon: Zap,
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-500/10 dark:bg-rose-500/10',
    border: 'border-rose-200/60 dark:border-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 w-full">
      <div className="min-h-full flex flex-col items-center justify-center px-4 py-8 sm:px-8 max-w-3xl mx-auto">

        {/* ── Hero Section ── */}
        <div className="flex flex-col items-center text-center mb-8 animate-fade-in">
          {/* Vicky avatar with premium ring */}
          <div className="relative mb-5 shrink-0">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-brand opacity-20 blur-xl scale-110" />
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-[1.75rem] overflow-hidden ring-2 ring-vicky-500/30 shadow-glow">
              <img
                src={vickyScenes.wavingHi}
                alt="VickyAI"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-2 -right-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-brand text-white text-[10px] font-bold shadow-lg">
              <Sparkles className="w-2.5 h-2.5 text-yellow-200" />
              Local AI
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1.5">
            Hi! I'm{' '}
            <span className="gradient-text">VickyAI</span>{' '}
            <span className="text-slate-900 dark:text-white">🐾</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            Your personal AI companion — private, fast, and running on your LAN.
          </p>
        </div>

        {/* ── Suggestion Prompts ── */}
        <div className="w-full max-w-2xl animate-slide-up" style={{ animationDelay: '80ms' }}>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-3 text-center">
            Suggested prompts
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUGGESTIONS.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => onSelectPrompt(item.title)}
                  style={{ animationDelay: `${100 + i * 50}ms` }}
                  className={`
                    group animate-slide-up relative flex items-center gap-3 p-3.5 rounded-2xl text-left
                    border ${item.border} ${item.bg}
                    hover:shadow-card-hover hover:scale-[1.01]
                    transition-all duration-200 ease-spring
                    focus:outline-none focus:ring-2 focus:ring-vicky-500/40
                  `}
                >
                  <span className={`shrink-0 p-2 rounded-xl ${item.bg} ${item.text} border ${item.border}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-slate-800 dark:text-slate-100 group-hover:text-vicky-600 dark:group-hover:text-vicky-400 transition-colors truncate">
                      {item.title}
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-500 truncate mt-0.5">
                      {item.subtitle}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Footer hint ── */}
        <p className="mt-6 text-[11px] text-slate-400 dark:text-slate-600 text-center animate-fade-in" style={{ animationDelay: '500ms' }}>
          Powered by Ollama · Runs entirely on your local network
        </p>
      </div>
    </div>
  );
};
