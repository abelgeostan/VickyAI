import React from 'react';
import { Sparkles, Terminal, Code, Eye, BookOpen, MessageSquare } from 'lucide-react';
import { vickyScenes } from '../../assets/vicky';


interface WelcomeScreenProps {
  onSelectPrompt: (promptText: string) => void;
}

const SUGGESTIONS = [
  {
    title: 'Explain Docker to me',
    subtitle: 'Containerization, volumes, networking & compose',
    icon: Terminal,
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
  },
  {
    title: 'Help me debug Python',
    subtitle: 'Async programming, FastAPI, memory & profiling',
    icon: Code,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
  },
  {
    title: 'Analyze this image',
    subtitle: 'Multimodal vision powered by Gemma 3 4B',
    icon: Eye,
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
  },
  {
    title: 'Help me learn something',
    subtitle: 'Deep dives, interactive tutorials & concepts',
    icon: BookOpen,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
  },
  {
    title: 'Ask VickyAI anything',
    subtitle: 'Your personal, private local AI running on LAN',
    icon: MessageSquare,
    color: 'text-vicky-500 bg-vicky-50 dark:bg-vicky-950/40 border-vicky-200 dark:border-vicky-900',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full text-center select-none animate-in fade-in duration-300">
      {/* Vicky Mascot Illustration */}
      <div className="relative mb-6">
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-gradient-to-tr from-vicky-100 to-sky-50 dark:from-slate-800 dark:to-slate-900 transform hover:scale-105 transition-transform duration-300">
          <img
            src={vickyScenes.wavingHi}
            alt="VickyAI Waving Mascot"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-vicky-600 text-white text-xs font-bold shadow-md flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
          Local AI
        </span>
      </div>

      {/* Greetings Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
        Hi! I'm VickyAI <span className="text-vicky-500">🐾</span>
      </h1>
      <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-md mb-8">
        Your local AI companion. Private, fast, and running directly on your LAN.
      </p>

      {/* Suggested Quick Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl text-left">
        {SUGGESTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => onSelectPrompt(item.title)}
              className="group p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/90 shadow-sm hover:shadow transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className={`p-1.5 rounded-lg border ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-vicky-600 dark:group-hover:text-vicky-400 transition-colors">
                  {item.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                {item.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
