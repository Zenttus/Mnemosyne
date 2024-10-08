// MnemosyneSession.ts
import { Notice } from 'obsidian';
import { matchesFilters } from './MnemosyneUtils';
import { EffectManager } from './EffectManager';
export class MnemosyneSession {
    constructor(app, settings, statusBarItem) {
        this.files = [];
        this.currentIndex = 0;
        this.intervalId = null;
        this.remainingTime = 0;
        // Store original content
        this.originalContent = '';
        this.originalContentLeaf = null;
        this.app = app;
        this.settings = settings;
        this.statusBarItem = statusBarItem;
        this.effectManager = new EffectManager(app, settings);
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
        if (this.settings.timerEnabled) {
            this.effectManager = new EffectManager(this.app, this.settings);
            this.startTimer();
        }
        else {
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
    openNote(note) {
        this.effectManager.resetEffect();
        this.app.vault.read(note).then((content) => {
            this.originalContent = content;
            // Open the original content in a side pane
        });
        // Open the note in the main view
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
            this.files.splice(index, 1);
            new Notice(`Removed "${activeFile.basename}" from the session.`);
            // Adjust currentIndex if necessary
            if (this.currentIndex >= this.files.length) {
                this.currentIndex = 0;
            }
            if (this.files.length === 0) {
                new Notice('All notes have been removed from the session.');
                this.stopSession();
                return;
            }
            // Open the next note
            this.openNote(this.files[this.currentIndex]);
            this.updateStatusBarItem();
        }
        else {
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
                // Check if there are more notes
                if (this.files.length > 0) {
                    this.getNextNote();
                }
                else {
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
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}
//# sourceMappingURL=MnemosyneSession.js.map