export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultModel: string;
  enterToSend: boolean;
  showTimestamps: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  defaultModel: 'gemma3:4b',
  enterToSend: true,
  showTimestamps: true,
};

const STORAGE_KEY = 'vickyai_settings';

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
