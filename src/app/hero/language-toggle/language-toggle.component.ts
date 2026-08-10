import { Component, inject } from '@angular/core';

import { LocaleService, type Locale } from '../../i18n/locale.service';

const LOCALES: readonly { readonly value: Locale; readonly label: string }[] = [
  { value: 'pt', label: 'PT-BR' },
  { value: 'en', label: 'EN' },
];

/** Alterna o idioma do site entre português e inglês (padrão: português). */
@Component({
  selector: 'app-language-toggle',
  templateUrl: './language-toggle.component.html',
  styleUrl: './language-toggle.component.scss',
})
export class LanguageToggleComponent {
  protected readonly localeService = inject(LocaleService);
  protected readonly locales = LOCALES;
}
