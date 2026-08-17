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

type PlaybackMode = 'intro' | 'idle' | 'scrub';

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

// ease-in-out-quad
const easeInOutQuad = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

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
    '(window:touchstart)': 'cancelNavScroll()',
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

  constructor() {
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
    });

    inject(DestroyRef).onDestroy(() => {
      this.stopPlaybackTimer();
      this.cancelNavScroll();
    });
  }

  /** Clique num botão do menu: rola devagar até o trecho da seção, com a mesma lógica de
   *  scroll→frame de sempre — é isso que deixa a queda de pétalas visível no trajeto. */
  protected goToStep(index: number): void {
    if (index === this.activeStep()) return;

    const scrubHeight = this.scrubSpaceRef()?.nativeElement.offsetHeight ?? 0;
    const maxScroll = Math.max(scrubHeight - window.innerHeight, 1);
    // meio do trecho da seção (não a borda), pra não cair bem em cima do limite com a
    // seção vizinha por causa de arredondamento
    const targetProgress = (index + 0.5) / NAV_STEPS;
    const targetY = clamp(maxScroll * targetProgress, 0, maxScroll);

    this.animateScrollTo(targetY);
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
    const scrubHeight = this.scrubSpaceRef()?.nativeElement.offsetHeight ?? 0;
    // o navegador nunca deixa rolar além de (altura do documento − altura da viewport);
    // dividir por scrubHeight puro faria o progresso nunca chegar a 1
    const maxScroll = Math.max(scrubHeight - window.innerHeight, 1);
    const progress = clamp(window.scrollY / maxScroll, 0, 1);
    this.currentFrame.set(Math.round(IDLE_END + (SCRUB_END - IDLE_END) * progress));
    this.activeStep.set(Math.min(NAV_STEPS - 1, Math.floor(progress * NAV_STEPS)));
  }
}
