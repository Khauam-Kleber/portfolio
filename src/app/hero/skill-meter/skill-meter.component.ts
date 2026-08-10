import { Component, computed, inject, input } from '@angular/core';

import { LocaleService } from '../../i18n/locale.service';

/**
 * Linha "label + régua horizontal + marcador" pra listar itens de stack. A régua tem
 * largura fixa e escala de 0 até `stack.maxYears` (7, ver traduções). O valor em anos
 * ainda não tem dado real por item — fica fixo em 0.2 até definirmos como calcular/
 * coletar isso.
 */
@Component({
  selector: 'app-skill-meter',
  templateUrl: './skill-meter.component.html',
  styleUrl: './skill-meter.component.scss',
})
export class SkillMeterComponent {
  readonly label = input.required<string>();
  readonly years = input(0.2);

  private readonly localeService = inject(LocaleService);

  protected readonly translations = computed(() =>
    this.localeService.translationsFor(this.localeService.locale()),
  );

  protected readonly fillPercent = computed(() =>
    Math.min(100, (this.years() / this.translations().stack.maxYears) * 100),
  );

  protected readonly yearsLabel = computed(() => this.translations().stack.yearsLabel(this.years()));
}
