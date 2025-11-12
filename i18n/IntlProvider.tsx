import React, { createContext, useContext, useState, useEffect } from 'react';
import { IntlProvider as ReactIntlProvider, createIntlCache, createIntl } from 'react-intl';
import enMessages from '../locales/en.json';

const cache = createIntlCache();

const DEFAULT_LOCALE = 'en';
const FALLBACK_LOCALE = 'en';

const messages: Record<string, any> = {
  en: enMessages,
};

const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur']);

interface LocaleContextType {
  locale: string;
  setLocale: (locale: string) => void;
  direction: 'ltr' | 'rtl';
}

const LocaleContext = createContext<LocaleContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  direction: 'ltr',
});

export const useLocale = () => useContext(LocaleContext);

function getStoredLocale(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  return localStorage.getItem('app_locale') || DEFAULT_LOCALE;
}

function storeLocale(locale: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('app_locale', locale);
}

function getDirection(locale: string): 'ltr' | 'rtl' {
  const baseLocale = locale.split('-')[0];
  return RTL_LOCALES.has(baseLocale) ? 'rtl' : 'ltr';
}

function onError(error: any): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[i18n] Missing translation:', error);
  }
}

export const IntlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<string>(getStoredLocale());
  const direction = getDirection(locale);

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    storeLocale(newLocale);
  };

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, direction]);

  const localeMessages = messages[locale] || messages[FALLBACK_LOCALE];

  return (
    <LocaleContext.Provider value={{ locale, setLocale, direction }}>
      <ReactIntlProvider
        messages={localeMessages}
        locale={locale}
        defaultLocale={FALLBACK_LOCALE}
        onError={onError}
      >
        {children}
      </ReactIntlProvider>
    </LocaleContext.Provider>
  );
};
