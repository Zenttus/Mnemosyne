import { TFile, App, Notice, getAllTags, WorkspaceLeaf } from 'obsidian';
import { MnemosyneSettings } from './MnemosyneSettings';
import { matchesFilters } from './MnemosyneUtils';
import { EffectManager } from './EffectManager';
import Mnemosyne from './Mnemosyne';

export class MnemosyneSession {
  private files: TFile[] = [];
  private settings: MnemosyneSettings;
  private statusBarItem: HTMLElement;
  private app: App;
  private plugin: Mnemosyne;

  private currentIndex: number = 0;
  private intervalId: number | null = null;
  private remainingTime: number = 0;
  private effectManager: EffectManager;
  private logs: { timestamp: string; event: string; }[] = [];

  constructor(app: App, settings: MnemosyneSettings, statusBarItem: HTMLElement, plugin: Mnemosyne) {
    this.plugin = plugin;
    this.app = app;
    this.settings = settings;
    this.statusBarItem = statusBarItem;
    this.effectManager = new EffectManager(app, settings);
    this.plugin = plugin;
  }

  startSession() {
    this.applyFilters();
    if (this.files.length === 0) {
      new Notice('There are no notes.');
      return;
    }
    this.currentIndex = 0;
    this.updateStatusBarItem();
    this.openNote(this.files[this.currentIndex]);
    this.logEvent('Session started');

    if (this.settings.timerEnabled) {
      this.effectManager = new EffectManager(this.app, this.settings);
      this.startTimer();
    } else {
      this.effectManager.resetEffect();
    }
  }

  getNextNote() {
    if (this.files.length === 0) {
      this.stopSession();
      return;
    }

    // Move to the next note
    this.currentIndex = (this.currentIndex + 1) % this.files.length;
    const nextNote = this.files[this.currentIndex];
    if (nextNote) {
      this.openNote(nextNote);
      this.logEvent(`Skipped to next note: ${nextNote.basename}`);
    }

    if (this.settings.timerEnabled) {
      this.resetTimer();
    }

    this.updateStatusBarItem();
  }

  applyFilters() {
    const allFiles = this.app.vault.getMarkdownFiles();
    this.files = allFiles.filter((file) => matchesFilters(file, this.app, this.settings));
    this.shuffleFiles();
  }

  shuffleFiles() {
    for (let i = this.files.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.files[i], this.files[j]] = [this.files[j], this.files[i]];
    }
  }

  openNote(note: TFile) {
    this.effectManager.resetEffect();
    // Open note in main view
    this.app.workspace.getLeaf(false).openFile(note).then(() => {
      if (this.settings.timerEnabled) {
        this.effectManager.applyEffect(this.remainingTime, this.settings.timePerNote);
      }
    });
  }

  updateStatusBarItem() {
    if (this.statusBarItem) {
      let text = `Mnemosyne session active. (${this.files.length} notes total.)`;
      if (this.settings.timerEnabled && this.settings.showStatusBarTimer) {
        const timeLeft = this.formatTime(this.remainingTime);
        text += ` Time left: ${timeLeft}`;
      }
      this.statusBarItem.setText(text);
    }
  }

  removeCurrentNote() {
    if (this.files.length === 0) {
      new Notice('No session is active.');
      return;
    }

    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice('No active file to remove.');
      return;
    }

    const index = this.files.findIndex((file) => file.path === activeFile.path);
    if (index !== -1) {
      const removedNote = this.files[index].basename;
      this.files.splice(index, 1);
      new Notice(`Removed "${removedNote}" from the session.`);
      this.logEvent(`Removed note: ${removedNote}`);

      // Adjust currentIndex if necessary
      if (this.currentIndex >= this.files.length) {
        this.currentIndex = 0;
      }

      if (this.files.length === 0) {
        new Notice('All notes have been removed from the session.');
        this.logEvent('All notes removed; session ended');
        this.stopSession();
        return;
      }


      // Open the next note
      this.openNote(this.files[this.currentIndex]);
      this.updateStatusBarItem();
    } else {
      new Notice('The active note is not part of the session.');
    }

    if (this.settings.timerEnabled) {
      this.resetTimer();
    }
  }

  stopSession() {
    this.stopTimer();
    this.files = [];
    this.currentIndex = 0;
    this.updateStatusBarItem();
    new Notice('Mnemosyne session stopped.');
    this.logEvent('Session stopped');
  }

  // Timer methods
  startTimer() {
    this.remainingTime = this.settings.timePerNote;
    this.effectManager.applyEffect(this.remainingTime, this.settings.timePerNote);

    this.updateStatusBarItem();

    this.stopTimer();

    this.intervalId = window.setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.effectManager.applyEffect(this.remainingTime, this.settings.timePerNote);

        // Update status bar each second
        this.updateStatusBarItem();
      }

      if (this.remainingTime <= 0) {
        // TODO make this a setting
        const soundPath = this.app.vault.adapter.getResourcePath('.obsidian/plugins/obsidian-mnemosyne/src/ding.mp3');

        const audio = new Audio(soundPath);
        audio.play();
        // Check if there are more notes

        if (this.files.length > 0) {
          this.getNextNote();
        } else {
          // No more notes, stop the session
          this.stopSession();
        }
      }
    }, 1000);
  }

  resetTimer() {
    this.stopTimer();
    this.startTimer();
  }

  stopTimer() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.effectManager.resetEffect();
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  updateTimerMode(enabled: boolean) {
    this.settings.timerEnabled = enabled;
    if (this.files.length > 0) {
      if (enabled && this.intervalId === null) {
        this.startTimer();
      } else if (!enabled && this.intervalId !== null) {
        this.stopTimer();
        this.effectManager.resetEffect();
      }
      this.logEvent(`Timer mode changed to ${enabled ? 'enabled' : 'disabled'}`);
      this.updateStatusBarItem();
    }
  }

  private async logEvent(message: string) {
    const event = {
      timestamp: new Date().toISOString(),
      event: message
    };
    this.plugin.settings.logs.push(event);
    await this.plugin.saveSettings();
  }
}
