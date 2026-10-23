# Portfólio — Khauam Kleber

Site de portfólio pessoal em Angular. Hero animado: margarida ilustrada que perde pétalas
conforme o scroll (sequência de frames em canvas, sem uso de `<video>` — vídeo bruto trava
o seek). Layout de seções inspirado em prancha de herbário científico.

## Idioma

- Textos de interface, comentários de código e mensagens de commit: **português**.
- Nomes de variáveis, componentes, seletores, classes e arquivos: **inglês**, seguindo a
  convenção padrão do ecossistema Angular/TypeScript (ex.: `hero-section.component.ts`,
  não `secao-heroi.component.ts`). Isso evita atrito com ferramentas, libs e o próprio
  Angular CLI, que geram e esperam nomes em inglês.

## Stack e convenções Angular

- Angular 22, componentes standalone (sem NgModules).
- Signals para estado reativo local; RxJS só quando fizer sentido (streams assíncronas reais).
- Novo control flow (`@if`, `@for`, `@switch`) — não usar `*ngIf`/`*ngFor`.
- `OnPush` já é o padrão no Angular 22 — não setar `changeDetection` nem `standalone: true`
  explicitamente no decorator, ambos são default agora.
- `input()`/`output()`/`model()` em vez dos decorators `@Input`/`@Output`.
- `host` object no decorator do componente para listeners (`(window:scroll)`, etc.) em vez
  de `@HostListener`/`@HostBinding`.
- SCSS.
- Sem SSR — a animação depende de `canvas` e leitura de scroll do navegador.

## Clean code

- Um componente, uma responsabilidade. Componentes grandes viram sub-componentes.
- Nomes descritivos; nada de abreviação obscura.
- Sem código morto, sem comentários óbvios — comentário só quando o "porquê" não é óbvio
  pelo código em si.
- Lógica repetida vira service/util, não é duplicada.
- Tipagem estrita, sem `any`.

## Arquitetura do site

- `HeroComponent`: reproduz a técnica validada em `../prototype/script.js` — sequência de
  frames em canvas sincronizada ao scroll (`scrollY` → índice do frame), com fase de intro
  (abelha chegando, toca uma vez), idle em ping-pong (4s–5s, sem salto) e scrub contínuo do
  resto da animação. Os frames usados são os 181 extraídos de `heroNovo.mp4` (12fps,
  resolução nativa, WebP qualidade 90) — não usar os frames de um projeto de design
  diferente, o tempo desse vídeo é o correto.
- Layout visual do hero segue o conceito "prancha de herbário" (fundo bege `#efe6d8` com
  grade sutil, moldura tipo Polaroid com fita adesiva nos cantos ao redor do canvas,
  linhas-guia decorativas, textos de canto em Karla/Cormorant Garamond/Caveat). A animação
  **não ocupa a tela toda** — fica contida na moldura (`height:clamp(170px,40vh,360px)`,
  `aspect-ratio:16/11`), com o menu (`HeroNavComponent`) espalhado ao redor dela. Referência
  original: projeto "Portfolio de Khauam Kleber" no Claude Design (arquivo
  `Prancha Herbario.dc.html`) — reaproveitamos o layout de lá, não os frames.
- `HeroNavComponent` recebe `activeIndex` do `HeroComponent`: o botão correspondente ao
  trecho de scroll atual (progresso dividido em 4 partes iguais) fica destacado em dourado
  permanentemente, não só no hover.
- Cada seção de conteúdo abaixo do hero é seu próprio componente standalone.
- Paleta extraída diretamente do asset (usar como tokens/variáveis SCSS, não repetir hex solto):
  - Dourado (hover/destaque, cor do miolo): `#F5B94E`
  - Pétala (branco creme): `#E9DFD7`
  - Céu: `#8EA7D3`
  - Verde do campo: `#3A4625`

## SEO e acessibilidade para IA

- Sem SSR (decisão mantida — ver acima), então nada dentro de `<app-root>` existe no HTML
  bruto: crawlers que não executam JavaScript (a maioria dos bots de IA — GPTBot, ClaudeBot,
  PerplexityBot etc.) veem só a página vazia se dependermos só do Angular.
- Por isso `src/index.html` tem um bloco estático (`#static-profile`, classe
  `.visually-hidden` definida em `src/styles.scss`) fora do `<app-root>`: currículo completo
  em HTML semântico real, sempre presente no documento, invisível para quem vê a versão
  interativa. É a fonte de verdade pra SEO/IA — ao editar bio, trajetória, stack ou formação
  nas traduções (`src/app/i18n/translations/*.ts`), replicar a mudança relevante aqui também
  (e em `public/llms.txt`, que segue a mesma lógica em Markdown).
- `public/robots.txt`, `public/sitemap.xml` e `public/llms.txt`: canonical/OG/JSON-LD em
  `index.html` usam `https://SEU-DOMINIO-AQUI.com` como placeholder — trocar pelo domínio
  real assim que definido (buscar essa string no projeto).
- `og-image.png` (1200×630) ainda não existe em `public/` — os metatags `og:image` /
  `twitter:image` apontam pra ele, mas o arquivo precisa ser criado.
- Palavras-chave alvo: "Desenvolvedor Front-End Angular" e "Engenheiro de Software com IA
  Angular" — usadas no `<title>`, `<meta description>`, JSON-LD (`jobTitle`) e no `<h1>` do
  bloco estático (o único `h1` real da página; a "assinatura" visual no hero é `<p>`).

## Ferramentas disponíveis

- MCP `context7`: documentação atualizada de libs antes de assumir uma API.
- MCP `angular-cli` (`ng mcp`): tooling e introspecção do próprio workspace Angular.
- MCP `playwright`: testar a animação de scroll num navegador real antes de dar uma feature
  como pronta — especialmente fluidez do scrub e reversibilidade ao rolar pra cima.
