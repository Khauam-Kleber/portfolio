import { Component, DestroyRef, ElementRef, computed, effect, inject, signal, viewChild, afterNextRender } from '@angular/core';

import { HeroNavComponent } from './hero-nav/hero-nav.component';
import { LanguageToggleComponent } from './language-toggle/language-toggle.component';
import { SectionCardComponent } from './section-card/section-card.component';
import { SECTION_ORDER } from './section';
import { LocaleService } from '../i18n/locale.service';

const FPS = 12;
const TOTAL_FRAMES = 181; // frame_001..frame_181, extraído de heroNovo.mp4 a 12fps
const FRAMES_PATH = 'frames/hero';
const NAV_STEPS = SECTION_ORDER.length;

const timeToFrame = (seconds: number): number =>
  Math.min(Math.max(Math.round(seconds * FPS) + 1, 1), TOTAL_FRAMES);

const INTRO_END = timeToFrame(4.4); // abelha pousa
const IDLE_END = timeToFrame(5.4); // abelha parada, nenhuma pétala caiu ainda
const SCRUB_END = TOTAL_FRAMES; // fim do vídeo (~15s), última pétala mapeada

// duração do scroll animado ao clicar num botão do menu — de propósito bem devagar, pra
// dar tempo da animação de pétalas caindo (ligada ao scrollY) ficar visível no trajeto
const NAV_SCROLL_MS = 1800;

// paginação por gesto no mobile: celular tem scroll com inércia, e um único "flick" cruzava
// várias seções. Lá o scroll nativo é bloqueado e cada gesto leva, no máximo, à seção vizinha.
const TOUCH_PAGING_QUERY = '(max-width: 900px) and (pointer: coarse)';
// fração da altura da tela que o dedo precisa percorrer pra "completar" uma seção
const SWIPE_FULL_TRAVEL_RATIO = 0.35;
const SWIPE_COMMIT_PROGRESS = 0.2; // soltando depois disso, avança mesmo sem velocidade
const SWIPE_COMMIT_VELOCITY = 0.35; // px/ms — flick rápido avança mesmo com pouco arrasto
const SWIPE_SETTLE_MS = 650;
const SWIPE_DIRECTION_SLOP = 6; // px de arrasto antes de decidir se o gesto é do card ou da página
// posição de cada seção como fração do scroll total: a primeira fica no topo (idle da
// abelha) e a última no fim (todas as pétalas caídas); as do meio, no centro do trecho
const TOUCH_STOP_PROGRESS: readonly number[] = [0, 0.375, 0.625, 1];

type PlaybackMode = 'intro' | 'idle' | 'scrub';

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

// ease-in-out-quad
const easeInOutQuad = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

interface SwipeState {
  startTouchY: number;
  startTime: number;
  startScrollY: number;
  startStop: number;
  lastTouchY: number;
  lastTime: number;
  velocity: number; // px/ms, positivo = dedo subindo (avançar)
  /** card rolável onde o gesto começou; enquanto não decidido, o gesto ainda pode virar rolagem do card */
  pendingCard: Element | null;
}

/**
 * Hero animado: a margarida perde pétalas conforme o scroll, dentro da moldura estilo
 * prancha de herbário. Enquanto parado no topo, a abelha chega e fica em loop (ping-pong,
 * sem salto) sobre o miolo. A partir do primeiro scroll o vídeo vira uma sequência de
 * frames "esfregada" pela posição da página — reversível nos dois sentidos porque o
 * frame é função direta do scroll. O botão de menu correspondente ao trecho do scroll
 * atual fica destacado em dourado.
 */
@Component({
  selector: 'app-hero',
  imports: [HeroNavComponent, SectionCardComponent, LanguageToggleComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  host: {
    '(window:scroll)': 'onWindowScroll()',
    '(window:resize)': 'onWindowResize()',
    '(window:wheel)': 'cancelNavScroll()',
    '(window:touchstart)': 'onTouchStart($event)',
    '(window:touchend)': 'onTouchEnd()',
    '(window:touchcancel)': 'onTouchEnd()',
  },
})
export class HeroComponent {
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly scrubSpaceRef = viewChild<ElementRef<HTMLDivElement>>('scrubSpace');
  private readonly localeService = inject(LocaleService);

  protected readonly currentFrame = signal(1);
  protected readonly activeStep = signal(0);
  protected readonly activeSectionKey = computed(() => SECTION_ORDER[this.activeStep()].key);
  protected readonly translations = computed(() =>
    this.localeService.translationsFor(this.localeService.locale()),
  );

  private readonly images: HTMLImageElement[] = [];
  private context: CanvasRenderingContext2D | null = null;

  private mode: PlaybackMode = 'intro';
  private idleDirection: 1 | -1 = -1;
  private playbackTimer: ReturnType<typeof setInterval> | null = null;
  private scrollTicking = false;
  private navScrollFrame: number | null = null;
  private swipe: SwipeState | null = null;
  private settleTargetStop: number | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const image = new Image();
      // scroll rápido pode pedir um frame antes dele terminar de carregar; quando
      // terminar, redesenha se ainda for o frame atual em vez de deixar o canvas em branco
      image.onload = () => {
        if (this.currentFrame() === i) this.drawFrame(i);
      };
      image.src = `${FRAMES_PATH}/frame_${String(i).padStart(3, '0')}.webp`;
      this.images.push(image);
    }

    effect(() => this.drawFrame(this.currentFrame()));

    afterNextRender(() => {
      const canvas = this.canvasRef()?.nativeElement;
      this.context = canvas?.getContext('2d') ?? null;
      if (this.context) {
        this.context.imageSmoothingEnabled = true;
        this.context.imageSmoothingQuality = 'high';
      }
      this.resizeCanvas();
      this.startPlaybackTimer();

      // listener manual: o navegador trata touchmove em window como passivo por padrão, e
      // aqui precisamos de preventDefault pra bloquear o scroll nativo durante o swipe
      const touchMoveHandler = (event: TouchEvent) => this.onTouchMove(event);
      window.addEventListener('touchmove', touchMoveHandler, { passive: false });
      destroyRef.onDestroy(() => window.removeEventListener('touchmove', touchMoveHandler));
    });

    destroyRef.onDestroy(() => {
      this.stopPlaybackTimer();
      this.cancelNavScroll();
    });
  }

  /** Clique num botão do menu: rola devagar até o trecho da seção, com a mesma lógica de
   *  scroll→frame de sempre — é isso que deixa a queda de pétalas visível no trajeto. */
  protected goToStep(index: number): void {
    if (index === this.activeStep()) return;

    const maxScroll = this.maxScroll();
    // meio do trecho da seção (não a borda), pra não cair bem em cima do limite com a
    // seção vizinha por causa de arredondamento
    const targetProgress = this.isTouchPaging() ? TOUCH_STOP_PROGRESS[index] : (index + 0.5) / NAV_STEPS;
    const targetY = clamp(maxScroll * targetProgress, 0, maxScroll);

    this.animateScrollTo(targetY);
  }

  protected onTouchStart(event: TouchEvent): void {
    this.cancelNavScroll();
    const interruptedTarget = this.settleTargetStop;
    this.settleTargetStop = null;
    this.swipe = null;
    if (!this.isTouchPaging() || event.touches.length !== 1) return;

    const touchY = event.touches[0].clientY;
    const now = performance.now();
    this.swipe = {
      startTouchY: touchY,
      startTime: now,
      startScrollY: window.scrollY,
      // gesto que interrompe uma animação em curso parte da seção pra onde ela ia
      startStop: interruptedTarget ?? this.nearestStop(window.scrollY),
      lastTouchY: touchY,
      lastTime: now,
      velocity: 0,
      pendingCard: this.scrollableCardAt(event),
    };
  }

  /** O dedo "arrasta" o scroll, mas travado entre a seção de origem e a vizinha na direção
   *  do gesto — é isso que impede pular várias seções num flick só. */
  private onTouchMove(event: TouchEvent): void {
    const swipe = this.swipe;
    if (!swipe || event.touches.length !== 1) return;

    const touchY = event.touches[0].clientY;
    const now = performance.now();

    if (swipe.pendingCard) {
      const dragged = swipe.startTouchY - touchY;
      if (Math.abs(dragged) < SWIPE_DIRECTION_SLOP) return;
      if (this.cardCanScroll(swipe.pendingCard, dragged)) {
        this.swipe = null; // o card ainda tem conteúdo nessa direção: scroll nativo dele
        return;
      }
      // card já no limite: o gesto passa a trocar de seção, contando a partir daqui
      swipe.pendingCard = null;
      swipe.startTouchY = touchY;
      swipe.lastTouchY = touchY;
      swipe.lastTime = now;
    }
    event.preventDefault();

    const elapsed = now - swipe.lastTime;
    if (elapsed > 0) {
      // média móvel pra suavizar o ruído de um touchmove isolado
      swipe.velocity = 0.6 * ((swipe.lastTouchY - touchY) / elapsed) + 0.4 * swipe.velocity;
    }
    swipe.lastTouchY = touchY;
    swipe.lastTime = now;

    window.scrollTo(0, this.swipeScrollY(swipe, this.swipeProgress(swipe, touchY)));
  }

  protected onTouchEnd(): void {
    const swipe = this.swipe;
    this.swipe = null;
    if (!swipe) return;

    const delta = swipe.startTouchY - swipe.lastTouchY;
    const direction = Math.sign(delta);
    const progress = this.swipeProgress(swipe, swipe.lastTouchY);
    const flicked = Math.abs(swipe.velocity) > SWIPE_COMMIT_VELOCITY && Math.sign(swipe.velocity) === direction;
    const commits = direction !== 0 && (progress >= SWIPE_COMMIT_PROGRESS || flicked);

    const targetStop = clamp(swipe.startStop + (commits ? direction : 0), 0, TOUCH_STOP_PROGRESS.length - 1);
    this.settleTargetStop = targetStop;
    this.settleAt(this.stopY(targetStop));
  }

  /** 0..1 — quanto do trajeto até a seção vizinha o dedo já completou. */
  private swipeProgress(swipe: SwipeState, touchY: number): number {
    const travel = window.innerHeight * SWIPE_FULL_TRAVEL_RATIO;
    return clamp(Math.abs(swipe.startTouchY - touchY) / travel, 0, 1);
  }

  private swipeScrollY(swipe: SwipeState, progress: number): number {
    const direction = Math.sign(swipe.startTouchY - swipe.lastTouchY);
    const neighbour = clamp(swipe.startStop + direction, 0, TOUCH_STOP_PROGRESS.length - 1);
    const from = this.stopY(swipe.startStop);
    return from + (this.stopY(neighbour) - from) * progress;
  }

  /** Anima até a seção alvo com desaceleração. */
  private settleAt(targetY: number): void {
    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 1) {
      this.settleTargetStop = null;
      return;
    }

    this.cancelNavScroll();
    const startTime = performance.now();
    // distâncias curtas (soltar perto do destino) não precisam da duração toda
    const duration = SWIPE_SETTLE_MS * clamp(Math.abs(distance) / (this.maxScroll() / NAV_STEPS), 0.4, 1);

    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, startY + distance * easeOutCubic(t));
      if (t < 1) {
        this.navScrollFrame = requestAnimationFrame(step);
      } else {
        this.navScrollFrame = null;
        this.settleTargetStop = null;
      }
    };
    this.navScrollFrame = requestAnimationFrame(step);
  }

  private maxScroll(): number {
    const scrubHeight = this.scrubSpaceRef()?.nativeElement.offsetHeight ?? 0;
    return Math.max(scrubHeight - window.innerHeight, 1);
  }

  private stopY(stop: number): number {
    return this.maxScroll() * TOUCH_STOP_PROGRESS[stop];
  }

  private nearestStop(scrollY: number): number {
    let nearest = 0;
    TOUCH_STOP_PROGRESS.forEach((_, stop) => {
      if (Math.abs(this.stopY(stop) - scrollY) < Math.abs(this.stopY(nearest) - scrollY)) nearest = stop;
    });
    return nearest;
  }

  private isTouchPaging(): boolean {
    return window.matchMedia(TOUCH_PAGING_QUERY).matches;
  }

  /** O card inferior rola o próprio conteúdo no mobile. */
  private scrollableCardAt(event: TouchEvent): Element | null {
    const card = (event.target as Element | null)?.closest('.section-card') ?? null;
    return card && card.scrollHeight > card.clientHeight ? card : null;
  }

  /** `dragged` > 0 = dedo subindo = conteúdo do card andando pra baixo. */
  private cardCanScroll(card: Element, dragged: number): boolean {
    const maxTop = card.scrollHeight - card.clientHeight;
    return dragged > 0 ? card.scrollTop < maxTop - 1 : card.scrollTop > 1;
  }

  protected cancelNavScroll(): void {
    if (this.navScrollFrame !== null) {
      cancelAnimationFrame(this.navScrollFrame);
      this.navScrollFrame = null;
    }
  }

  private animateScrollTo(targetY: number): void {
    this.cancelNavScroll();
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - startTime) / NAV_SCROLL_MS, 1);
      window.scrollTo(0, startY + distance * easeInOutQuad(t));
      this.navScrollFrame = t < 1 ? requestAnimationFrame(step) : null;
    };

    this.navScrollFrame = requestAnimationFrame(step);
  }

  protected onWindowScroll(): void {
    if (this.scrollTicking) return;
    this.scrollTicking = true;
    requestAnimationFrame(() => {
      this.scrollTicking = false;
      if (window.scrollY <= 0) {
        this.enterIntroOrIdle();
      } else {
        this.enterScrub();
        this.updateScrub();
      }
    });
  }

  protected onWindowResize(): void {
    this.resizeCanvas();
    if (this.mode === 'scrub') this.updateScrub();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    // a moldura tem tamanho próprio (clamp em vh, não a viewport inteira) — o canvas
    // precisa do tamanho renderizado dela, não de window.innerWidth/innerHeight
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
  }

  private drawFrame(index: number): void {
    const ctx = this.context;
    const canvas = this.canvasRef()?.nativeElement;
    const image = this.images[index - 1];
    if (!ctx || !canvas || !image?.complete || image.naturalWidth === 0) return;

    const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const dx = (canvas.width - drawWidth) / 2;
    const dy = (canvas.height - drawHeight) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
  }

  private stepPlayback(): void {
    if (this.mode === 'intro') {
      const next = this.currentFrame() + 1;
      if (next >= INTRO_END) {
        this.currentFrame.set(INTRO_END);
        this.mode = 'idle';
      } else {
        this.currentFrame.set(next);
      }
      return;
    }

    if (this.mode === 'idle') {
      let next = this.currentFrame() + this.idleDirection;
      if (next >= IDLE_END) {
        next = IDLE_END;
        this.idleDirection = -1; // chegou no fim do trecho parado, volta tocando pra trás
      } else if (next <= INTRO_END) {
        next = INTRO_END;
        this.idleDirection = 1; // voltou ao início, toca pra frente de novo
      }
      this.currentFrame.set(next);
    }
  }

  private startPlaybackTimer(): void {
    this.stopPlaybackTimer();
    this.playbackTimer = setInterval(() => this.stepPlayback(), 1000 / FPS);
  }

  private stopPlaybackTimer(): void {
    if (this.playbackTimer !== null) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
  }

  private enterIntroOrIdle(): void {
    if (this.mode === 'scrub') {
      this.mode = this.currentFrame() >= INTRO_END ? 'idle' : 'intro';
      this.startPlaybackTimer();
    }
    this.activeStep.set(0);
  }

  private enterScrub(): void {
    if (this.mode !== 'scrub') {
      this.mode = 'scrub';
      this.stopPlaybackTimer();
    }
  }

  private updateScrub(): void {
    // o navegador nunca deixa rolar além de (altura do documento − altura da viewport);
    // dividir por scrubHeight puro faria o progresso nunca chegar a 1
    const progress = clamp(window.scrollY / this.maxScroll(), 0, 1);
    this.currentFrame.set(Math.round(IDLE_END + (SCRUB_END - IDLE_END) * progress));
    this.activeStep.set(Math.min(NAV_STEPS - 1, Math.floor(progress * NAV_STEPS)));
  }
}
