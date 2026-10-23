import type { Translations } from './translations.model';

export const EN_TRANSLATIONS: Translations = {
  hero: {
    sectionIndexPrefix: 'No.',
  },
  languageToggle: {
    ariaLabel: 'change site language',
  },
  about: {
    navLabel: 'about',
    title: 'About',
    bioKicker: 'who I am',
    bio: 'Senior Front-End Developer with 6+ years of experience, specialized in Angular and in engineering high-data-volume applications. Focused on architecture, technical standards and performance across software products, actively deepening the use of AI tooling applied to development — from coding agents to architectures that embed LLMs as part of the product itself.',
    contactKicker: 'contact',
    phone: '+55 41 99620-1262',
    email: 'khauam@hotmail.com',
    cvLabel: 'download résumé',
    cvHref: 'cv/khauam-cardoso-cv-en.pdf',
    socialKicker: 'social',
  },
  career: {
    navLabel: 'career',
    title: 'Career',
    current: {
      company: 'Accountfy',
      role: 'Senior Front-End Developer',
      period: '2022 — present',
      highlights: [
        'Architecture and technical evolution of strategic product modules',
        'Performance optimization for heavy data: DuckDB-Wasm, SpreadJS, complex SQL',
        'Architectural decisions, code review and technical support for the squad',
      ],
    },
    previous: {
      company: 'Quality Planning Sistemas',
      role: 'FullStack Developer, Junior / Mid-level',
      period: '2017 — 2021',
      highlights: [
        'Led the migration from Grails 2.5 to Angular 6 + Spring Boot',
        'Built Ionic apps on top of the same back end as the web systems',
        'Direct client work: requirements, testing, sign-off and releases',
      ],
    },
  },
  stack: {
    navLabel: 'stack',
    title: 'Stack',
    core: {
      label: 'front-end & data',
      items: [
        { name: 'Angular 6-22', years: 7 },
        { name: 'RxJS', years: 7 },
        { name: 'Signals', years: 2 },
        { name: 'HTML5', years: 7 },
        { name: 'SCSS', years: 7 },
        { name: 'Git', years: 7 },
        { name: 'Jira', years: 7 },
        { name: 'Advanced SQL', years: 5 },
        { name: 'Bootstrap', years: 4 },
        { name: 'Angular Material', years: 4 },
        { name: 'Jest', years: 4 },
        { name: 'DuckDB-Wasm', years: 4 },
        { name: 'SpreadJS', years: 4 },
        { name: 'Recalculation optimization', years: 4 },
      ],
    },
    extended: {
      label: 'back-end & mobile',
      items: [
        { name: 'REST APIs', years: 7 },
        { name: 'Spring Boot', years: 5 },
        { name: 'Hibernate', years: 3 },
        { name: 'Ionic', years: 3 },
        { name: 'Grails (Java)', years: 2 },
        { name: 'Android Studio', years: 0.3 },
      ],
    },
    ai: {
      label: 'applied AI',
      items: [
        { name: 'Claude Code', years: 0.2 },
        { name: 'MCP', years: 0.2 },
        { name: 'Skills', years: 0.2 },
        { name: 'RAG', years: 0.2 },
        { name: 'Rules', years: 0.2 },
        { name: 'Ollama Cloud', years: 0.2 },
        { name: 'Kilo Code', years: 0.2 },
        { name: 'Devin', years: 0.2 },
      ],
    },
    maxYears: 7,
    yearsLabel: (years) => `${years} ${years === 1 ? 'year' : 'years'}`,
  },
  education: {
    navLabel: 'education',
    title: 'Education',
    postgraduate: {
      title: 'Postgraduate degree in Software Engineering with Applied AI',
      institution: 'UNIPDS',
      meta: 'in progress',
    },
    graduation: {
      title: 'Systems Analysis and Development',
      institution: 'Universidade Tuiuti do Paraná',
      meta: 'completed in 2017',
    },
    languagesKicker: 'languages',
    languages: [
      { name: 'Portuguese', level: 'native' },
      { name: 'English', level: 'intermediate' },
    ],
  },
};
