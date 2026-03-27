// lib/store.ts

const STORAGE_KEY = 'parolle-storage-v1';

export const saveToLocal = (data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const getFromLocal = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  }
  return null;
};

export const defaultSettings = {
  settings: {
    lang: 'co',
    darkMode: true,
    highContrast: false,
  },
  gameState: {
    date: new Date().toISOString().split('T')[0],
    guesses: [],
    isGameOver: false,
  }
};