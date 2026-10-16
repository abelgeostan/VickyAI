import React from 'react';
import { vickyScenes, vickyFullBody } from '../../assets/vicky';

export type SceneType =
  | 'laptopChat'
  | 'wavingHi'
  | 'coding'
  | 'idea'
  | 'reading'
  | 'sleeping'
  | 'fullWaving'
  | 'fullSitting'
  | 'fullSleeping';

interface VickySceneProps {
  scene: SceneType;
  className?: string;
  alt?: string;
}

export const VickyScene: React.FC<VickySceneProps> = ({
  scene,
  className = 'w-48 h-auto',
  alt = 'VickyAI Scene',
}) => {
  let src = vickyScenes.wavingHi;

  switch (scene) {
    case 'laptopChat':
      src = vickyScenes.laptopChat;
      break;
    case 'wavingHi':
      src = vickyScenes.wavingHi;
      break;
    case 'coding':
      src = vickyScenes.coding;
      break;
    case 'idea':
      src = vickyScenes.idea;
      break;
    case 'reading':
      src = vickyScenes.reading;
      break;
    case 'sleeping':
      src = vickyScenes.sleeping;
      break;
    case 'fullWaving':
      src = vickyFullBody.waving;
      break;
    case 'fullSitting':
      src = vickyFullBody.sitting;
      break;
    case 'fullSleeping':
      src = vickyFullBody.sleeping;
      break;
  }

  return (
    <div className={`inline-block select-none rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-800 ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
};
