import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { IntlProvider as ReactIntlProvider } from 'react-intl';
import enMessages from '../locales/en.json';

const DEFAULT_LOCALE = 'en';
const FALLBACK_LOCALE = 'en';
const SUPPORTED_LOCALES = ['en', 'ru', 'lv', 'pseudo'] as const;

export const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  ru: 'Русский',
  lv: 'Latviešu',
  ar: 'العربية',
  de: 'Deutsch',
};

type RawLocaleMessages = Record<string, string | { description: string }>;

function filterMessages(raw: RawLocaleMessages): Record<string, string> {
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!key.startsWith('@') && typeof value === 'string') {
      filtered[key] = value;
    }
  }
  return filtered;
}

const loadedMessages: Record<string, Record<string, string>> = {
  en: filterMessages(enMessages as RawLocaleMessages),
};

async function loadMessages(locale: string): Promise<Record<string, string>> {
  if (loadedMessages[locale]) {
    return loadedMessages[locale];
  }

  try {
    const messages = await import(`../locales/${locale}.json`);
    loadedMessages[locale] = filterMessages(messages.default as RawLocaleMessages);
    return loadedMessages[locale];
  } catch {
    console.warn(`[i18n] Could not load messages for locale: ${locale}`);
    return loadedMessages[FALLBACK_LOCALE];
  }
}

const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur']);

function getBrowserLocale(): string | null {
  if (typeof window === 'undefined' || !navigator.languages) return null;

  for (const browserLang of navigator.languages) {
    const baseLang = browserLang.split('-')[0];
    if (SUPPORTED_LOCALES.includes(browserLang as (typeof SUPPORTED_LOCALES)[number])) {
      return browserLang;
    }
    if (SUPPORTED_LOCALES.includes(baseLang as (typeof SUPPORTED_LOCALES)[number])) {
      return baseLang;
    }
  }
  return null;
}

function getDirection(locale: string): 'ltr' | 'rtl' {
  const baseLocale = locale.split('-')[0];
  return RTL_LOCALES.has(baseLocale) ? 'rtl' : 'ltr';
}

interface LocaleContextType {
  locale: string;
  setLocale: (locale: string) => void;
  direction: 'ltr' | 'rtl';
  supportedLocales: readonly string[];
  isLoading: boolean;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  direction: 'ltr',
  supportedLocales: SUPPORTED_LOCALES,
  isLoading: false,
});

export const useLocale = () => useContext(LocaleContext);

function getStoredLocale(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const stored = localStorage.getItem('app_locale');
  if (stored && SUPPORTED_LOCALES.includes(stored as (typeof SUPPORTED_LOCALES)[number])) {
    return stored;
  }

  const browserLocale = getBrowserLocale();
  if (browserLocale) return browserLocale;

  return DEFAULT_LOCALE;
}

function storeLocale(locale: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('app_locale', locale);
}

function onError(error: Error): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[i18n] Missing translation:', error.message);
  }
}

export const IntlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<string>(DEFAULT_LOCALE);
  const [messages, setMessages] = useState<Record<string, string>>(loadedMessages[DEFAULT_LOCALE]);
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  const mountedRef = useRef(true);
  const pendingLocaleRef = useRef<string | null>(null);

  const setLocale = (newLocale: string) => {
    if (!SUPPORTED_LOCALES.includes(newLocale as (typeof SUPPORTED_LOCALES)[number])) {
      console.warn(`[i18n] Locale not supported: ${newLocale}`);
      return;
    }

    const newDirection = getDirection(newLocale);
    setDirection(newDirection);
    setLocaleState(newLocale);
    storeLocale(newLocale);

    document.documentElement.lang = newLocale;
    document.documentElement.dir = newDirection;

    pendingLocaleRef.current = newLocale;

    if (loadedMessages[newLocale]) {
      setMessages(loadedMessages[newLocale]);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      loadMessages(newLocale).then((newMessages) => {
        if (mountedRef.current && pendingLocaleRef.current === newLocale) {
          setMessages(newMessages);
          setIsLoading(false);
        }
      });
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    const stored = getStoredLocale();

    if (stored !== DEFAULT_LOCALE) {
      const storedDirection = getDirection(stored);
      setDirection(storedDirection);
      setLocaleState(stored);

      document.documentElement.lang = stored;
      document.documentElement.dir = storedDirection;

      pendingLocaleRef.current = stored;

      if (loadedMessages[stored]) {
        setMessages(loadedMessages[stored]);
      } else {
        setIsLoading(true);
        loadMessages(stored).then((msgs) => {
          if (mountedRef.current && pendingLocaleRef.current === stored) {
            setMessages(msgs);
            setIsLoading(false);
          }
        });
      }
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <LocaleContext.Provider
      value={{ locale, setLocale, direction, supportedLocales: SUPPORTED_LOCALES, isLoading }}
    >
      <ReactIntlProvider
        messages={messages}
        locale={locale}
        defaultLocale={FALLBACK_LOCALE}
        onError={onError}
      >
        {children}
      </ReactIntlProvider>
    </LocaleContext.Provider>
  );
};
