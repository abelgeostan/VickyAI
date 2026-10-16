import React from 'react';
import { vickyEmotionMap, VickyAvatarState } from '../../assets/vicky';

interface VickyAvatarProps {
  state?: VickyAvatarState;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showGlow?: boolean;
  alt?: string;
}

const sizeClasses: Record<string, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-28 h-28',
};

export const VickyAvatar: React.FC<VickyAvatarProps> = ({
  state = 'happy',
  size = 'md',
  className = '',
  showGlow = false,
  alt = 'VickyAI Mascot',
}) => {
  const imgSrc = vickyEmotionMap[state] || vickyEmotionMap.happy;

  const isThinking = state === 'thinking';
  const isExcited = state === 'excited';
  const isSad = state === 'sad';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none ${sizeClasses[size]} ${className}`}
    >
      {/* Background glow effects */}
      {(showGlow || isThinking || isExcited) && (
        <span
          className={`absolute inset-0 rounded-full blur-sm transition-opacity duration-300 ${
            isThinking
              ? 'bg-vicky-cyan/50 animate-pulse'
              : isExcited
              ? 'bg-vicky-500/60 animate-ping opacity-30'
              : 'bg-vicky-400/30'
          }`}
        />
      )}

      {/* Main Avatar Container */}
      <div
        className={`relative w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 transition-transform duration-300 ${
          isThinking
            ? 'border-vicky-400 ring-2 ring-vicky-400/40 shadow-glow-sm'
            : isSad
            ? 'border-amber-400/80 shadow-sm'
            : isExcited
            ? 'border-vicky-400 shadow-glow-sm scale-105'
            : 'border-vicky-500/30 hover:border-vicky-500/60 shadow-xs'
        }`}
      >
        <img
          src={imgSrc}
          alt={alt}
          className="w-full h-full object-cover object-center pointer-events-none"
          loading="eager"
        />
      </div>

      {/* Little headset active dot indicator for thinking/active */}
      {isThinking && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-vicky-cyan border-2 border-white dark:border-slate-900 rounded-full animate-ping" />
      )}
    </div>
  );
};
