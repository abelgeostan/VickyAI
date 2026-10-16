import vickyAvatarCircle from './vicky_avatar_circle.png';
import vickyAvatarSquareWink from './vicky_avatar_square_wink.png';
import vickyLogo from './vicky_logo.png';
import vickyRestingPaws from './vicky_resting_paws.png';

// Emotions
import emotionHappy from './vicky_emotion_happy.png';
import emotionWink from './vicky_emotion_wink.png';
import emotionCurious from './vicky_emotion_curious.png';
import emotionExcited from './vicky_emotion_excited.png';
import emotionThinking from './vicky_emotion_thinking.png';
import emotionSad from './vicky_emotion_sad.png';
import emotionLaugh from './vicky_emotion_laugh.png';
import emotionConfused from './vicky_emotion_confused.png';

// Full Body Poses
import fullSitting from './vicky_full_sitting.png';
import fullWink from './vicky_full_wink.png';
import fullWaving from './vicky_full_waving.png';
import fullProfile from './vicky_full_profile.png';
import fullWalking from './vicky_full_walking.png';
import fullSleeping from './vicky_full_sleeping.png';

// Activity Scenes
import sceneLaptopChat from './vicky_scene_laptop_chat.png';
import sceneWavingHi from './vicky_scene_waving_hi.png';
import sceneCoding from './vicky_scene_coding.png';
import sceneIdea from './vicky_scene_idea.png';
import sceneReading from './vicky_scene_reading.png';
import sceneSleeping from './vicky_scene_sleeping.png';

export type VickyAvatarState =
  | 'happy'
  | 'wink'
  | 'curious'
  | 'excited'
  | 'thinking'
  | 'sad'
  | 'laugh'
  | 'confused'
  | 'sleeping'
  | 'waving'
  | 'coding'
  | 'reading';

export const vickyEmotionMap: Record<VickyAvatarState, string> = {
  happy: emotionHappy,
  wink: emotionWink,
  curious: emotionCurious,
  excited: emotionExcited,
  thinking: emotionThinking,
  sad: emotionSad,
  laugh: emotionLaugh,
  confused: emotionConfused,
  sleeping: fullSleeping,
  waving: fullWaving,
  coding: sceneCoding,
  reading: sceneReading,
};

export const vickyScenes = {
  laptopChat: sceneLaptopChat,
  wavingHi: sceneWavingHi,
  coding: sceneCoding,
  idea: sceneIdea,
  reading: sceneReading,
  sleeping: sceneSleeping,
};

export const vickyFullBody = {
  sitting: fullSitting,
  wink: fullWink,
  waving: fullWaving,
  profile: fullProfile,
  walking: fullWalking,
  sleeping: fullSleeping,
};

export const vickyBrand = {
  avatarCircle: vickyAvatarCircle,
  avatarSquareWink: vickyAvatarSquareWink,
  logo: vickyLogo,
  restingPaws: vickyRestingPaws,
};

export default {
  emotions: vickyEmotionMap,
  scenes: vickyScenes,
  fullBody: vickyFullBody,
  brand: vickyBrand,
};
