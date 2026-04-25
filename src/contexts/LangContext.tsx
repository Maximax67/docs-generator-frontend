'use client';

import { createContext, useContext, ReactNode } from 'react';
import { getDictionary, defaultLocale, type Locale, type Dictionary } from '@/i18n';

interface LangContextValue {
  lang: Locale;
  dict: Dictionary;
}

const LangContext = createContext<LangContextValue>({
  lang: defaultLocale,
  dict: getDictionary(defaultLocale),
});

export function LangProvider({ lang, children }: { lang: Locale; children: ReactNode }) {
  const dict = getDictionary(lang);
  return <LangContext.Provider value={{ lang, dict }}>{children}</LangContext.Provider>;
}

/** Returns the current locale string, e.g. 'en' | 'uk' */
export function useLang(): Locale {
  return useContext(LangContext).lang;
}

/** Returns the full translated dictionary for the active locale */
export function useDictionary(): Dictionary {
  return useContext(LangContext).dict;
}
