import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translationsAPI } from '../services/api';

// Language store with persistence
export const useLanguageStore = create(
  persist(
    (set, get) => ({
      // Current language code
      currentLang: 'tr',
      
      // Flag to track if user explicitly selected a language
      userSelectedLanguage: false,
      
      // Available languages
      languages: [],
      
      // All translations for current language
      translations: {},
      
      // Loading state
      loading: false,
      
      // Initialize languages and translations
      init: async () => {
        try {
          set({ loading: true });
          
          // Get available languages
          const langRes = await translationsAPI.getLanguages();
          const languages = langRes.data;
          
          // Get default language from server
          const defaultRes = await translationsAPI.getDefaultLanguage();
          const serverDefaultLang = defaultRes.data.code;
          
          // Check if user has EXPLICITLY selected a language before
          // We use a separate flag to track this, not just the presence of currentLang
          const storedData = localStorage.getItem('language-storage');
          let langToUse = serverDefaultLang; // Default to server's default
          
          if (storedData) {
            try {
              const parsed = JSON.parse(storedData);
              const savedLang = parsed?.state?.currentLang;
              const userSelectedLanguage = parsed?.state?.userSelectedLanguage;
              
              // Only use saved language if user explicitly selected it (not just initial value)
              if (userSelectedLanguage && savedLang && languages.find(l => l.code === savedLang)) {
                langToUse = savedLang;
              }
            } catch (e) {
              console.error('Failed to parse stored language data:', e);
            }
          }
          
          // Get translations for the language
          const transRes = await translationsAPI.getTranslations(langToUse);
          
          set({
            languages,
            currentLang: langToUse,
            translations: transRes.data,
            loading: false
          });
        } catch (error) {
          console.error('Failed to initialize language:', error);
          set({ loading: false });
        }
      },
      
      // Change language
      setLanguage: async (langCode) => {
        try {
          set({ loading: true });
          const transRes = await translationsAPI.getTranslations(langCode);
          set({
            currentLang: langCode,
            translations: transRes.data,
            userSelectedLanguage: true, // Mark that user explicitly selected a language
            loading: false
          });
        } catch (error) {
          console.error('Failed to change language:', error);
          set({ loading: false });
        }
      },
      
      // Get translation by key
      t: (key, fallback) => {
        const { translations } = get();
        return translations[key] || fallback || key;
      },
      
      // Refresh translations
      refresh: async () => {
        const { currentLang } = get();
        try {
          const transRes = await translationsAPI.getTranslations(currentLang);
          set({ translations: transRes.data });
        } catch (error) {
          console.error('Failed to refresh translations:', error);
        }      },
      
      // Refresh languages list (after admin changes)
      refreshLanguages: async () => {
        try {
          const langRes = await translationsAPI.getLanguages();
          const languages = langRes.data;
          
          // If current language is no longer active, switch to default
          const { currentLang } = get();
          const isCurrentActive = languages.find(l => l.code === currentLang);
          
          if (!isCurrentActive && languages.length > 0) {
            const defaultRes = await translationsAPI.getDefaultLanguage();
            const defaultLang = defaultRes.data.code || languages[0].code;
            const transRes = await translationsAPI.getTranslations(defaultLang);
            set({
              languages,
              currentLang: defaultLang,
              translations: transRes.data
            });
          } else {
            set({ languages });
          }
        } catch (error) {
          console.error('Failed to refresh languages:', error);
        }      }
    }),
    {
      name: 'language-storage',
      partialize: (state) => ({ 
        currentLang: state.currentLang,
        userSelectedLanguage: state.userSelectedLanguage 
      })
    }
  )
);

// Custom hook for translations
export const useTranslation = () => {
  const { t, currentLang, languages, setLanguage, loading, refresh, refreshLanguages } = useLanguageStore();
  return { t, currentLang, languages, setLanguage, loading, refresh, refreshLanguages };
};

export default useLanguageStore;
