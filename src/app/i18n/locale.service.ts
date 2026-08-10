import { Service, signal } from '@angular/core';

import { EN_TRANSLATIONS } from './translations/en';
import { PT_TRANSLATIONS } from './translations/pt';
import type { Translations } from './translations/translations.model';

export type Locale = 'pt' | 'en';

const STORAGE_KEY = 'portfolio-locale';
const DEFAULT_LOCALE: Locale = 'pt';

const TRANSLATIONS: Record<Locale, Translations> = {
  pt: PT_TRANSLATIONS,
  en: EN_TRANSLATIONS,
};

// localStorage pode não existir (SSR, ambiente de teste) ou lançar em modo privado —
// nunca deixar isso quebrar a leitura/gravação do idioma
const readStoredLocale = (): Locale => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'pt' || stored === 'en' ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
};

const writeStoredLocale = (locale: Locale): void => {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // idioma continua funcionando na sessão atual, só não persiste entre visitas
  }
};

/** Idioma atual do site (PT-BR por padrão) e o dicionário de conteúdo correspondente. */
@Service()
export class LocaleService {
  readonly locale = signal<Locale>(readStoredLocale());

  setLocale(locale: Locale): void {
    this.locale.set(locale);
    writeStoredLocale(locale);
  }

  translationsFor(locale: Locale): Translations {
    return TRANSLATIONS[locale];
  }
}
