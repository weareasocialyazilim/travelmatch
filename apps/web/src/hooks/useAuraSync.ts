'use client';
import { create } from 'zustand';

// Global state ile tüm bileşenlerin (Shader, Cursor, Yazılar)
// o anki şehre göre renk değiştirmesini sağlıyoruz.
interface AuraState {
  currentAura: string;
  setAura: (color: string) => void;
}

export const useAuraSync = create<AuraState>((set) => ({
  currentAura: '#8B5CF6', // Default: Neon Purple
  setAura: (color) => {
    // Also update the CSS variable directly for performance in some cases
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--aura-color', color);
    }
    set({ currentAura: color });
  },
}));
