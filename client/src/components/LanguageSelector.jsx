import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineGlobeAlt, HiOutlineChevronDown } from 'react-icons/hi';
import { useTranslation } from '../store';

const LanguageSelector = ({ variant = 'default' }) => {
  const { currentLang, languages, setLanguage, loading } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLanguage = languages.find(l => l.code === currentLang) || {
    code: 'tr',
    name: 'Turkish',
    native_name: 'Türkçe',
    flag: '🇹🇷'
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  if (languages.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
          ${variant === 'navbar' 
            ? 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300' 
            : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-900 dark:text-white shadow-sm'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className="text-xl leading-none">{currentLanguage.flag}</span>
        <span className="text-sm font-medium hidden sm:block">{currentLanguage.native_name}</span>
        <HiOutlineChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 py-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl z-50 max-h-[400px] overflow-y-auto"
          >
            {/* Header */}
            <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                <HiOutlineGlobeAlt className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">🌍</span>
              </div>
            </div>

            {/* Language List */}
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150
                    ${currentLang === lang.code 
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white' 
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }
                  `}
                >
                  {/* Flag */}
                  <span className="text-2xl leading-none">{lang.flag}</span>
                  
                  {/* Language Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{lang.native_name}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{lang.name}</div>
                  </div>

                  {/* Active Indicator */}
                  {currentLang === lang.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-emerald-500"
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
