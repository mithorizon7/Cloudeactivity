import React, { createContext, useContext } from 'react';
import Polyglot from './polyglot';
// Corrected the import path to be a relative path, which browsers understand.
// The alias '@/' is a convention for build tools, not native browser modules.
import messages from '../locales/en.json';

// Initialize Polyglot with the English messages
const polyglot = new Polyglot(messages);

// Create a context for the i18n instance
const I18nContext = createContext({
  t: (key: string, options?: any) => polyglot.t(key, options),
});

// Custom hook to use the translation function
export const useTranslation = () => useContext(I18nContext);

// Provider component to wrap the app
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = { t: (key: string, options?: any) => polyglot.t(key, options) };
  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};