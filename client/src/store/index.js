import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,
      
      toggleTheme: () => {
        const newIsDark = !get().isDark;
        set({ isDark: newIsDark });
        
        if (newIsDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      initTheme: () => {
        const { isDark } = get();
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }),
    {
      name: 'theme-storage',
    }
  )
);

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,
      
      login: (token, admin) => {
        set({ token, admin, isAuthenticated: true });
      },
      
      logout: () => {
        set({ token: null, admin: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useChatStore = create((set, get) => ({
  isOpen: false,
  messages: [],
  visitorId: null,
  config: null,
  
  setOpen: (isOpen) => set({ isOpen }),
  toggleChat: () => set({ isOpen: !get().isOpen }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setVisitorId: (visitorId) => set({ visitorId }),
  setConfig: (config) => set({ config }),
  
  clearMessages: () => set({ messages: [] })
}));

// Re-export language store
export { useLanguageStore, useTranslation } from './languageStore';
