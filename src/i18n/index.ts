import { en } from './dictionaries/en';
import { uk } from './dictionaries/uk';

export type { Dictionary } from './dictionaries/en';

export const locales = ['en', 'uk'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'uk';

const dictionaries: Record<Locale, typeof en> = { en, uk };

export function getDictionary(locale: string): typeof en {
  const lang = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  return dictionaries[lang];
}

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  uk: 'Українська',
};

const localeCountryCodes: Record<Locale, string> = {
  en: 'gb',
  uk: 'ua',
};

export function getFlagUrl(locale: Locale) {
  return `https://flagcdn.com/${localeCountryCodes[locale]}.svg`;
}
