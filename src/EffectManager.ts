import { App, MarkdownView } from 'obsidian';
import { MnemosyneSettings } from './MnemosyneSettings';

export interface EffectStrategy {
  applyEffect(remainingTime: number, totalTime: number): void;
  resetEffect(): void;
}

export class EffectManager {
  private effectStrategy: EffectStrategy;

  constructor(app: App, settings: MnemosyneSettings) {
    switch (settings.effectType) {
      case 'FillUp':
        this.effectStrategy = new FillUpEffect(app, settings);
        break;
      case 'Background':
        this.effectStrategy = new BackgroundEffect(app, settings);
        break;
      default:
        throw new Error(`Unknown effect type: ${settings.effectType}`);
    }

  }

  applyEffect(remainingTime: number, totalTime: number) {
    this.effectStrategy.applyEffect(remainingTime, totalTime);
  }

  resetEffect() {
    this.effectStrategy.resetEffect();
  }
}

export class ColorUtils {
  static interpolateColor(startColor: string, endColor: string, factor: number): string {
    const [r1, g1, b1] = ColorUtils.hexToRgb(startColor);
    const [r2, g2, b2] = ColorUtils.hexToRgb(endColor);

    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));

    return `${r}, ${g}, ${b}`;
  }

  static hexToRgb(hex: string): [number, number, number] {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
  }
}

export class BackgroundEffect implements EffectStrategy {
  private app: App;
  private settings: MnemosyneSettings;

  constructor(app: App, settings: MnemosyneSettings) {
    this.app = app;
    this.settings = settings;
  }

  applyEffect(remainingTime: number, totalTime: number) {
    const percentage = remainingTime / totalTime;
    const currentColor = ColorUtils.interpolateColor(this.settings.startColor, this.settings.endColor, 1 - percentage);

    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      activeView.contentEl.style.backgroundColor = `rgb(${currentColor})`;
    }
  }

  resetEffect() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      activeView.contentEl.style.backgroundColor = '';
    }
  }
}

export class FillUpEffect implements EffectStrategy {
  private app: App;
  private settings: MnemosyneSettings;
  private fillDiv: HTMLElement | null = null;

  constructor(app: App, settings: MnemosyneSettings) {
    this.app = app;
    this.settings = settings;
  }

  applyEffect(remainingTime: number, totalTime: number) {
    const percentage = 1 - remainingTime / totalTime;
    const currentColor = this.settings.startColor;

    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      if (!this.fillDiv) {
        this.fillDiv = document.createElement('div');
        this.fillDiv.style.position = 'absolute';
        this.fillDiv.style.bottom = '0';
        this.fillDiv.style.left = '0';
        this.fillDiv.style.width = '100%';
        this.fillDiv.style.pointerEvents = 'none';
        activeView.contentEl.style.position = 'relative';
        activeView.contentEl.appendChild(this.fillDiv);
      }

      this.fillDiv.style.height = `${percentage * 100}%`;
      this.fillDiv.style.backgroundColor = currentColor;
    }
  }

  resetEffect() {
    if (this.fillDiv) {
      this.fillDiv.remove();
      this.fillDiv = null;
    }
  }
}
