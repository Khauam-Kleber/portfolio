import { Component, computed, inject, input } from '@angular/core';

import { LocaleService } from '../../i18n/locale.service';
import { SECTION_ORDER, type SectionKey } from '../section';
import { SkillMeterComponent } from '../skill-meter/skill-meter.component';

export interface SocialLink {
  readonly key: 'whatsapp' | 'linkedin' | 'github';
  readonly label: string;
  readonly href: string;
}

const SOCIAL_LINKS: readonly SocialLink[] = [
  { key: 'whatsapp', label: 'WhatsApp', href: 'https://api.whatsapp.com/send?phone=55041996201262' },
  { key: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/khauam/' },
  { key: 'github', label: 'GitHub', href: 'https://github.com/Khauam-Kleber' },
];

/**
 * Card fixo no rodapé do hero, mostrando o conteúdo da seção correspondente ao trecho de
 * scroll atual. Seções com 3 grupos de conteúdo reais (about, stack, education) usam 3
 * colunas de largura igual; career, com apenas 2 grupos (trajetória atual/anterior), usa a
 * primeira coluna larga (2/3) e a terceira estreita (1/3) — ver `isDuo` e `.section-card--duo`.
 */
@Component({
  selector: 'app-section-card',
  imports: [SkillMeterComponent],
  templateUrl: './section-card.component.html',
  styleUrl: './section-card.component.scss',
})
export class SectionCardComponent {
  readonly sectionKey = input.required<SectionKey>();

  private readonly localeService = inject(LocaleService);

  protected readonly translations = computed(() =>
    this.localeService.translationsFor(this.localeService.locale()),
  );

  protected readonly isDuo = computed(() => this.sectionKey() === 'career');

  protected readonly socialLinks = SOCIAL_LINKS;

  protected readonly indexLabel = computed(() => {
    const number = SECTION_ORDER.find((section) => section.key === this.sectionKey())?.number ?? 1;
    return `${this.translations().hero.sectionIndexPrefix} ${String(number).padStart(2, '0')}`;
  });
}
