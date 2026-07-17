/**
 * Theme Context - Dark/Light Mode
 * Gerencia tema global da aplicação
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'clearix-theme';
const LEGACY_THEME_KEY = 'bestlens-theme'; // legado Best Lens — migrado on-read

// Helper para detectar preferência do sistema
function getSystemTheme(): Theme {
  if (!browser) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Lê o tema salvo (chave atual); migra a chave legada se ainda existir, sem perder a preferência
function readSavedTheme(): string | null {
  if (!browser) return null;
  const current = localStorage.getItem(THEME_KEY);
  if (current) return current;
  const legacy = localStorage.getItem(LEGACY_THEME_KEY);
  if (legacy) {
    localStorage.setItem(THEME_KEY, legacy);
    localStorage.removeItem(LEGACY_THEME_KEY);
    return legacy;
  }
  return null;
}

// Helper para carregar tema salvo
function getSavedTheme(): Theme {
  if (!browser) return 'light';
  return (readSavedTheme() as Theme) || getSystemTheme();
}

// Store do tema
function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>(getSavedTheme());

  return {
    subscribe,
    
    // Setar tema específico
    set: (theme: Theme) => {
      set(theme);
      if (browser) {
        localStorage.setItem(THEME_KEY, theme);
        applyTheme(theme);
      }
    },
    
    // Toggle entre light/dark
    toggle: () => {
      update(current => {
        const newTheme = current === 'light' ? 'dark' : 'light';
        if (browser) {
          localStorage.setItem(THEME_KEY, newTheme);
          applyTheme(newTheme);
        }
        return newTheme;
      });
    },
    
    // Inicializar tema (chamar no mount)
    init: () => {
      const theme = getSavedTheme();
      set(theme);
      if (browser) {
        applyTheme(theme);
        
        // Observer para mudanças no sistema
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
          const systemTheme = e.matches ? 'dark' : 'light';
          const savedTheme = localStorage.getItem(THEME_KEY);
          if (!savedTheme) {
            set(systemTheme);
            applyTheme(systemTheme);
          }
        });
      }
    }
  };
}

// Aplicar tema no HTML
function applyTheme(theme: Theme) {
  if (!browser) return;
  
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const theme = createThemeStore();