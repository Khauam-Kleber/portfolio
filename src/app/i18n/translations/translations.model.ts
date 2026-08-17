export interface HeroChrome {
  readonly sectionIndexPrefix: string; // "n.º" / "No."
}

export interface AboutContent {
  readonly navLabel: string;
  readonly title: string;
  readonly bioKicker: string;
  readonly bio: string;
  readonly contactKicker: string;
  readonly phone: string;
  readonly email: string;
  readonly cvLabel: string;
  readonly cvHref: string;
  readonly socialKicker: string;
}

export interface CareerEntry {
  readonly company: string;
  readonly role: string;
  readonly period: string;
  readonly highlights: readonly string[];
}

export interface CareerContent {
  readonly navLabel: string;
  readonly title: string;
  readonly current: CareerEntry;
  readonly previous: CareerEntry;
}

export interface StackItem {
  readonly name: string;
  readonly years: number;
}

export interface StackGroup {
  readonly label: string;
  readonly items: readonly StackItem[];
}

export interface StackContent {
  readonly navLabel: string;
  readonly title: string;
  readonly core: StackGroup;
  readonly extended: StackGroup;
  readonly ai: StackGroup;
  /** escala máxima da régua de "anos de uso" (ver SkillMeterComponent) */
  readonly maxYears: number;
  readonly yearsLabel: (years: number) => string;
}

export interface EducationDegree {
  readonly title: string;
  readonly institution: string;
  readonly meta: string;
}

export interface EducationContent {
  readonly navLabel: string;
  readonly title: string;
  readonly postgraduate: EducationDegree;
  readonly graduation: EducationDegree;
  readonly languagesKicker: string;
  readonly languages: readonly { readonly name: string; readonly level: string }[];
}

export interface Translations {
  readonly hero: HeroChrome;
  readonly languageToggle: { readonly ariaLabel: string };
  readonly about: AboutContent;
  readonly career: CareerContent;
  readonly stack: StackContent;
  readonly education: EducationContent;
}
