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

## Ferramentas disponíveis

- MCP `context7`: documentação atualizada de libs antes de assumir uma API.
- MCP `angular-cli` (`ng mcp`): tooling e introspecção do próprio workspace Angular.
- MCP `playwright`: testar a animação de scroll num navegador real antes de dar uma feature
  como pronta — especialmente fluidez do scrub e reversibilidade ao rolar pra cima.
