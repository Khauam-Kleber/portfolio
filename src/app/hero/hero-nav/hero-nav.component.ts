import { Component, computed, inject, input, output } from '@angular/core';

import { LocaleService } from '../../i18n/locale.service';
import { SECTION_ORDER } from '../section';

interface NavItemView {
  readonly key: string;
  readonly label: string;
  readonly index: string;
  /** só o número, sem prefixo — usado na trilha compacta de círculos do mobile */
  readonly number: string;
  readonly navPosition: 'top-left' | 'mid-left' | 'top-right' | 'mid-right';
}

/**
 * Menu principal, disposto ao redor da margarida do hero. Cada botão leva o nome da
 * seção correspondente (ver ../section.ts e ../../i18n) e fica destacado em dourado
 * quando o scroll está no trecho daquela seção.
 */
@Component({
  selector: 'app-hero-nav',
  templateUrl: './hero-nav.component.html',
  styleUrl: './hero-nav.component.scss',
})
export class HeroNavComponent {
  readonly activeIndex = input(0);
  readonly sectionSelect = output<number>();

  private readonly localeService = inject(LocaleService);

  protected readonly items = computed<readonly NavItemView[]>(() => {
    const t = this.localeService.translationsFor(this.localeService.locale());
    return SECTION_ORDER.map((section) => {
      const number = String(section.number).padStart(2, '0');
      return {
        key: section.key,
        label: t[section.key].navLabel,
        index: `${t.hero.sectionIndexPrefix} ${number}`,
        number,
        navPosition: section.navPosition,
      };
    });
  });
}
