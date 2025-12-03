import React, { useState, useRef, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useLocale, LOCALE_NAMES } from '../i18n/IntlProvider';

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, supportedLocales, isLoading } = useLocale();
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayLocales = supportedLocales.filter(l => ['en', 'ru', 'lv'].includes(l));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSelect = (newLocale: string) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  const currentName = LOCALE_NAMES[locale] || locale.toUpperCase();

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] rounded-lg bg-slate-800/70 hover:bg-slate-700/70 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200 text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#a31f34]/50 touch-manipulation"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={intl.formatMessage({ id: 'language.switcher.label', defaultMessage: 'Language selection' })}
        disabled={isLoading}
      >
        <svg 
          className="w-4 h-4 text-slate-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" 
          />
        </svg>
        <span>{currentName}</span>
        <svg 
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {isLoading && (
          <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label={intl.formatMessage({ id: 'language.switcher.label', defaultMessage: 'Language selection' })}
          className="absolute top-full right-0 mt-2 py-1 min-w-[160px] bg-slate-800 border border-slate-600/50 rounded-lg shadow-xl z-50 overflow-hidden"
        >
          {displayLocales.map((loc) => {
            const isSelected = loc === locale;
            const name = LOCALE_NAMES[loc] || loc.toUpperCase();
            
            return (
              <li key={loc}>
                <button
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(loc)}
                  className={`w-full px-4 py-3 min-h-[44px] text-left text-sm transition-colors duration-150 flex items-center justify-between touch-manipulation
                    ${isSelected 
                      ? 'bg-[#a31f34]/20 text-white' 
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white active:bg-slate-600/50'
                    }`}
                >
                  <span>{name}</span>
                  {isSelected && (
                    <svg 
                      className="w-4 h-4 text-[#a31f34]" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
