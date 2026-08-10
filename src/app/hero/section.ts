export type SectionKey = 'about' | 'career' | 'stack' | 'education';

export interface SectionMeta {
  readonly key: SectionKey;
  /** posição do número da seção no menu/card, ex.: 1 → "n.º 01" */
  readonly number: number;
  readonly navPosition: 'top-left' | 'mid-left' | 'top-right' | 'mid-right';
}

/**
 * Ordem e posição das 4 seções — independente de idioma. Os textos (rótulo do menu,
 * título do card, conteúdo) vêm do dicionário de traduções (ver ../i18n), indexados
 * por `key`. Cada seção corresponde a um quarto do progresso do scrub (ver
 * HeroComponent.activeStep).
 */
export const SECTION_ORDER: readonly SectionMeta[] = [
  { key: 'about', number: 1, navPosition: 'top-left' },
  { key: 'career', number: 2, navPosition: 'mid-left' },
  { key: 'stack', number: 3, navPosition: 'top-right' },
  { key: 'education', number: 4, navPosition: 'mid-right' },
];
