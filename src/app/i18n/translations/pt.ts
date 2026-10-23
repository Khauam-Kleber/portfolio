import type { Translations } from './translations.model';

export const PT_TRANSLATIONS: Translations = {
  hero: {
    sectionIndexPrefix: 'n.º',
  },
  languageToggle: {
    ariaLabel: 'mudar idioma do site',
  },
  about: {
    navLabel: 'sobre',
    title: 'Sobre',
    bioKicker: 'quem sou',
    bio: 'Desenvolvedor Front-End Senior com mais de 6 anos de experiência, especializado em Angular e em engenharia de aplicações com alto volume de dados. Atuo na definição de arquitetura, padrões técnicos e performance de produtos de software, aprofundando de forma ativa o uso de IA aplicada ao desenvolvimento — de agentes de código a arquiteturas que integram LLMs como parte do próprio produto.',
    contactKicker: 'contato',
    phone: '41 99620-1262',
    email: 'khauam@hotmail.com',
    cvLabel: 'baixar currículo',
    cvHref: 'cv/khauam-cardoso-cv-pt.pdf',
    socialKicker: 'redes sociais',
  },
  career: {
    navLabel: 'trajetória',
    title: 'Trajetória',
    current: {
      company: 'Accountfy',
      role: 'Desenvolvedor Front-End Senior',
      period: '2022 — atualmente',
      highlights: [
        'Arquitetura e evolução técnica de módulos estratégicos do produto',
        'Otimização de performance em dados pesados: DuckDB-Wasm, SpreadJS, SQL complexo',
        'Decisões arquiteturais, code review e apoio técnico à squad',
      ],
    },
    previous: {
      company: 'Quality Planning Sistemas',
      role: 'FullStack Junior / Pleno',
      period: '2017 — 2021',
      highlights: [
        'Migração de sistemas de Grails 2.5 para Angular 6 + Spring Boot',
        'Apps Ionic sobre o mesmo back-end dos sistemas web',
        'Requisito, teste, homologação e publicação direto com clientes',
      ],
    },
  },
  stack: {
    navLabel: 'stack',
    title: 'Stack',
    core: {
      label: 'front-end & dados',
      items: [
        { name: 'Angular 6-22', years: 7 },
        { name: 'RxJS', years: 7 },
        { name: 'Signals', years: 2 },
        { name: 'HTML5', years: 7 },
        { name: 'SCSS', years: 7 },
        { name: 'Git', years: 7 },
        { name: 'Jira', years: 7 },
        { name: 'SQL avançado', years: 5 },
        { name: 'Bootstrap', years: 4 },
        { name: 'Angular Material', years: 4 },
        { name: 'Jest', years: 4 },
        { name: 'DuckDB-Wasm', years: 4 },
        { name: 'SpreadJS', years: 4 },
        { name: 'Otimização de recálculo', years: 4 },
      ],
    },
    extended: {
      label: 'back-end & mobile',
      items: [
        { name: 'APIs REST', years: 7 },
        { name: 'Spring Boot', years: 5 },
        { name: 'Hibernate', years: 3 },
        { name: 'Ionic', years: 3 },
        { name: 'Grails (Java)', years: 2 },
        { name: 'Android Studio', years: 0.3 },
      ],
    },
    ai: {
      label: 'IA aplicada',
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
    yearsLabel: (years) => `${years.toString().replace('.', ',')} anos`,
  },
  education: {
    navLabel: 'formação',
    title: 'Formação',
    postgraduate: {
      title: 'Engenharia de Software com IA Aplicada',
      institution: 'UNIPDS',
      meta: 'cursando',
    },
    graduation: {
      title: 'Análise e Desenvolvimento de Sistemas',
      institution: 'Universidade Tuiuti do Paraná',
      meta: 'concluído em 2017',
    },
    languagesKicker: 'idiomas',
    languages: [
      { name: 'português', level: 'nativo' },
      { name: 'inglês', level: 'intermediário' },
    ],
  },
};
