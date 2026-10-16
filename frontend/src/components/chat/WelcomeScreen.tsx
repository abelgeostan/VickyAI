import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Terminal,
  Code,
  Eye,
  BookOpen,
  MessageSquare,
  Zap,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { vickyScenes } from '../../assets/vicky';

interface WelcomeScreenProps {
  onSelectPrompt: (promptText: string) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  char: string;
}

const VICKY_STORIES = [
  {
    scene: vickyScenes.wavingHi,
    bubble: "Hi friend! Ready to chat? 🐾",
    subtitle: "Click me to switch my mood!",
    tag: "Waving Hi",
    emoji: "👋",
  },
  {
    scene: vickyScenes.coding,
    bubble: "Let's write some clean code! 💻",
    subtitle: "Python, TypeScript, Docker & APIs",
    tag: "Dev Mode",
    emoji: "💻",
  },
  {
    scene: vickyScenes.idea,
    bubble: "Got an idea? Let's brainstorm! 💡",
    subtitle: "Architectures, logic & creativity",
    tag: "Eureka!",
    emoji: "💡",
  },
  {
    scene: vickyScenes.reading,
    bubble: "I love deep dives & learning! 📚",
    subtitle: "Break down complex concepts simply",
    tag: "Research",
    emoji: "📖",
  },
  {
    scene: vickyScenes.laptopChat,
    bubble: "100% private on your home LAN! 🔒",
    subtitle: "Runs entirely on your local models",
    tag: "Private AI",
    emoji: "🛡️",
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Prompts', icon: Sparkles },
  { id: 'code', label: 'Dev & Code', icon: Code },
  { id: 'vision', label: 'Vision', icon: Eye },
  { id: 'reasoning', label: 'Logic', icon: Zap },
  { id: 'general', label: 'General', icon: MessageSquare },
];

const SUGGESTIONS = [
  {
    title: 'Explain Docker to me',
    subtitle: 'Containers, volumes, networking & compose',
    icon: Terminal,
    category: 'code',
    border: 'border-blue-200/80 dark:border-blue-500/20 hover:border-blue-400 dark:hover:border-blue-500/50',
    bg: 'bg-blue-500/5 dark:bg-blue-500/10 hover:bg-blue-500/10 dark:hover:bg-blue-500/15',
    iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  },
  {
    title: 'Help me debug Python',
    subtitle: 'FastAPI, async, memory & profiling',
    icon: Code,
    category: 'code',
    border: 'border-emerald-200/80 dark:border-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-500/50',
    bg: 'bg-emerald-500/5 dark:bg-emerald-500/10 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  },
  {
    title: 'Analyze this image',
    subtitle: 'Multimodal vision with Gemma 3 4B',
    icon: Eye,
    category: 'vision',
    border: 'border-purple-200/80 dark:border-purple-500/20 hover:border-purple-400 dark:hover:border-purple-500/50',
    bg: 'bg-purple-500/5 dark:bg-purple-500/10 hover:bg-purple-500/10 dark:hover:bg-purple-500/15',
    iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
  },
  {
    title: 'Compare Gemma & Qwen',
    subtitle: 'Benchmark speeds, reasoning & vision',
    icon: Zap,
    category: 'reasoning',
    border: 'border-rose-200/80 dark:border-rose-500/20 hover:border-rose-400 dark:hover:border-rose-500/50',
    bg: 'bg-rose-500/5 dark:bg-rose-500/10 hover:bg-rose-500/10 dark:hover:bg-rose-500/15',
    iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  },
  {
    title: 'Teach me System Design',
    subtitle: 'Microservices, caching, queues & scale',
    icon: BookOpen,
    category: 'reasoning',
    border: 'border-amber-200/80 dark:border-amber-500/20 hover:border-amber-400 dark:hover:border-amber-500/50',
    bg: 'bg-amber-500/5 dark:bg-amber-500/10 hover:bg-amber-500/10 dark:hover:bg-amber-500/15',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  },
  {
    title: 'Ask VickyAI anything',
    subtitle: 'Private, instant, running on your LAN',
    icon: MessageSquare,
    category: 'general',
    border: 'border-vicky-200/80 dark:border-vicky-500/20 hover:border-vicky-400 dark:hover:border-vicky-500/50',
    bg: 'bg-vicky-500/5 dark:bg-vicky-500/10 hover:bg-vicky-500/10 dark:hover:bg-vicky-500/15',
    iconBg: 'bg-vicky-500/10 text-vicky-600 dark:text-vicky-400 border border-vicky-500/20',
  },
];

const FUN_EMOJIS = ['🐾', '✨', '💡', '❤️', '🦴', '⚡', '💻'];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  const [storyIndex, setStoryIndex] = useState(0);
  const [isAvatarBouncing, setIsAvatarBouncing] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [pawWiggle, setPawWiggle] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const currentStory = VICKY_STORIES[storyIndex];

  // Auto-cycle Vicky's mood every 12s when idle on the home screen
  useEffect(() => {
    const timer = setInterval(() => {
      setStoryIndex((prev) => (prev + 1) % VICKY_STORIES.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // Spawn floating particle helper
  const spawnParticle = (originX = 50, originY = 50, customChar?: string) => {
    const id = Date.now() + Math.random();
    const char = customChar || FUN_EMOJIS[Math.floor(Math.random() * FUN_EMOJIS.length)];
    const x = originX + (Math.random() * 40 - 20);
    const y = originY + (Math.random() * 20 - 10);

    setParticles((prev) => [...prev.slice(-6), { id, x, y, char }]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1100);
  };

  // Click on Vicky Avatar: cycle story, bounce, and spawn particles
  const handleAvatarClick = () => {
    setIsAvatarBouncing(true);
    setShowBubble(true);
    setStoryIndex((prev) => (prev + 1) % VICKY_STORIES.length);

    spawnParticle(50, 40);
    setTimeout(() => spawnParticle(45, 45), 100);
    setTimeout(() => spawnParticle(55, 45), 200);

    setTimeout(() => {
      setIsAvatarBouncing(false);
    }, 400);
  };

  // Click on Paw icon in title
  const handlePawClick = () => {
    setPawWiggle(true);
    spawnParticle(50, 60, '🦴');
    setTimeout(() => setPawWiggle(false), 700);
  };

  // Filtered suggestion prompts
  const filteredSuggestions = SUGGESTIONS.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  return (
    <div className="relative flex-1 overflow-y-auto min-h-0 w-full custom-scrollbar">
      {/* ── Ambient Background Glow Orbs ── */}
      <div className="absolute top-10 left-1/4 -translate-x-1/2 w-80 h-80 rounded-full bg-vicky-500/10 dark:bg-vicky-600/15 blur-[90px] pointer-events-none animate-pulse-ring" />
      <div className="absolute top-48 right-1/4 translate-x-1/2 w-80 h-80 rounded-full bg-cyan-500/10 dark:bg-pink-500/10 blur-[90px] pointer-events-none animate-float-slow" />

      {/* ── Floating Particles Container ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {particles.map((p) => (
          <span
            key={p.id}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute text-lg select-none animate-float-particle drop-shadow-md"
          >
            {p.char}
          </span>
        ))}
      </div>

      <div className="relative min-h-full flex flex-col items-center justify-center px-4 py-8 sm:px-8 max-w-3xl mx-auto z-10">

        {/* ── Hero Section ── */}
        <div className="flex flex-col items-center text-center mb-6 animate-fade-in">

          {/* Interactive Speech Bubble */}
          <div
            className={`
              mb-3 transition-all duration-300 ease-spring transform
              ${showBubble ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'}
            `}
          >
            <div className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-vicky-500/30 shadow-card">
              <span className="text-sm select-none">{currentStory.emoji}</span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {currentStory.bubble}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {currentStory.subtitle}
                </span>
              </div>
              {/* Bubble Arrow */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-r border-b border-vicky-500/30 rotate-45" />
            </div>
          </div>

          {/* Vicky Mascot Avatar with Multi-layer Glow & Interactive Bounce */}
          <div
            onClick={handleAvatarClick}
            className="relative mb-3 shrink-0 cursor-pointer group select-none"
            title="Click Vicky to change mood & scene!"
          >
            {/* Animated pulsating aura */}
            <div className="absolute -inset-3 rounded-[2.2rem] bg-gradient-brand opacity-25 dark:opacity-35 blur-xl animate-pulse-ring group-hover:opacity-50 transition-opacity" />
            <div className="absolute -inset-1 rounded-[1.9rem] bg-gradient-to-r from-vicky-500 via-pink-500 to-cyan-500 opacity-40 blur-sm animate-twinkle" />

            {/* Mascot Image Container with Floating physics */}
            <div
              className={`
                relative w-24 h-24 sm:w-28 sm:h-28 rounded-[1.75rem] overflow-hidden
                ring-2 ring-white/60 dark:ring-white/10 shadow-glow
                transition-all duration-300 ease-spring animate-float-slow
                group-hover:scale-105 group-hover:rotate-2
                ${isAvatarBouncing ? 'scale-90 rotate-[-4deg]' : ''}
              `}
            >
              <img
                src={currentStory.scene}
                alt="VickyAI Mascot"
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              {/* Interactive overlay on hover */}
              <div className="absolute inset-0 bg-vicky-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Heart className="w-5 h-5 text-white/80 animate-ping opacity-75" />
              </div>
            </div>

            {/* Sparkle Twinkle Badge */}
            <span className="absolute -top-1 -right-1 p-1 rounded-full bg-amber-400/20 text-amber-500 dark:text-amber-300 backdrop-blur-xs border border-amber-400/40 animate-twinkle">
              <Sparkles className="w-3.5 h-3.5" />
            </span>

            {/* Mood Tag */}
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-brand text-white text-[10px] font-bold shadow-md whitespace-nowrap transition-transform group-hover:scale-105">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {currentStory.tag}
            </span>
          </div>

          {/* Interactive Hint */}
          <button
            type="button"
            onClick={handleAvatarClick}
            className="text-[11px] text-vicky-600 dark:text-vicky-400/90 hover:underline font-medium flex items-center gap-1 mb-2 transition-transform active:scale-95"
          >
            <span>Tap Vicky to switch mood</span>
            <span className="text-xs">✨</span>
          </button>

          {/* Main Title with Interactive Paw */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1.5 flex items-center justify-center gap-1.5">
            <span>Hi! I'm</span>{' '}
            <span className="gradient-text font-black">VickyAI</span>{' '}
            <button
              type="button"
              onClick={handlePawClick}
              className={`
                inline-block cursor-pointer transition-transform hover:scale-130 active:scale-90
                ${pawWiggle ? 'animate-wigwag' : 'hover:rotate-12'}
              `}
              title="Give Vicky a high paw! 🐾"
            >
              🐾
            </button>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            Your personal AI companion — private, lightning-fast, and running locally on your LAN.
          </p>
        </div>

        {/* ── Category Filter Pills with Smooth Transitions ── */}
        <div className="w-full max-w-2xl mb-4 animate-slide-up" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold
                    transition-all duration-200 ease-spring active:scale-95
                    ${isActive
                      ? 'bg-vicky-600 text-white shadow-glow-sm scale-[1.02]'
                      : 'bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80'
                    }
                  `}
                >
                  <Icon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-vicky-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Suggestion Prompt Cards Grid ── */}
        <div className="w-full max-w-2xl animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredSuggestions.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => onSelectPrompt(item.title)}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className={`
                    group relative flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl text-left
                    border ${item.border} ${item.bg} backdrop-blur-xs
                    hover:shadow-card-hover hover:scale-[1.01] active:scale-[0.98]
                    transition-all duration-200 ease-spring
                    focus:outline-none focus:ring-2 focus:ring-vicky-500/40
                  `}
                >
                  {/* Icon with Hover Pop & Spin */}
                  <span
                    className={`
                      shrink-0 p-2 sm:p-2.5 rounded-xl ${item.iconBg}
                      transition-transform duration-300 ease-spring group-hover:scale-110 group-hover:rotate-6
                    `}
                  >
                    <Icon className="w-4 h-4" />
                  </span>

                  {/* Text details */}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-slate-800 dark:text-slate-100 group-hover:text-vicky-600 dark:group-hover:text-vicky-400 transition-colors truncate">
                      {item.title}
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.subtitle}
                    </span>
                  </span>

                  {/* Arrow cue on hover */}
                  <ArrowRight
                    className="w-4 h-4 text-vicky-500 dark:text-vicky-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0 ml-1"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Footer Status ── */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Powered by LAN Ollama · 100% Private · No Cloud Tracking</span>
        </div>

      </div>
    </div>
  );
};
