import { TFile, App, Notice, getAllTags } from 'obsidian';
import { MnemosyneSettings } from './MnemosyneSettings';

export class MnemosyneSession {
    private files: TFile[] = [];
    private settings: MnemosyneSettings;
    private statusBarItem: HTMLElement;
    private app: App;

    private currentIndex: number = 0;

    constructor(app: App, settings: MnemosyneSettings, statusBarItem: HTMLElement) {
        this.app = app;
        this.settings = settings;
        this.statusBarItem = statusBarItem;
    }

    startSession() {
        console.log("Starting session...");
        this.applyFilters();
        console.log(`Files after applying filters: ${this.files.length}`);
        if (this.files.length === 0) {
            new Notice("There are no notes.");
            return;
        }
        this.currentIndex = 0;
        this.updateStatusBarItem();
        this.openNote(this.files[this.currentIndex]);
    }

    getNextNote() {
        if (this.files.length === 0) {
            new Notice("Mnemonic session completed");
            this.statusBarItem.setText('No Mnemosyne session active.');
            return;
        }
        this.currentIndex = (this.currentIndex + 1) % this.files.length;
        const nextNote = this.files[this.currentIndex];
        if (nextNote) {
            this.openNote(nextNote);
        }
        this.updateStatusBarItem();
    }

    applyFilters() {
        const allFiles = this.app.vault.getMarkdownFiles();
      
        this.files = allFiles.filter((file) => {
          const cache = this.app.metadataCache.getFileCache(file);
          const tags = cache ? getAllTags(cache) ?? [] : [];
      
          // If 'iterateAllFiles' is true, include all notes regardless of tags
          if (this.settings.iterateAllFiles) {
            return true;
          }
      
          // If 'allTagsSelected' is true, include all notes
          if (this.settings.allTagsSelected) {
            return true;
          }
      
          // Exclude notes that have any of the excluded tags
          if (this.settings.excludedTags.some((tag) => tags.includes(tag))) {
            return false;
          }
      
          // If included tags are specified, include notes that have any of them
          if (this.settings.includedTags.length > 0) {
            return this.settings.includedTags.some((tag) => tags.includes(tag));
          }
      
          // If no tags are specified, exclude the note (since 'iterateAllFiles' and 'allTagsSelected' are false)
          return false;
        });
      
        this.shuffleFiles();
      }

    shuffleFiles() {
        for (let i = this.files.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.files[i], this.files[j]] = [this.files[j], this.files[i]];
        }
    }

    openNote(note: TFile) {
        this.app.workspace.openLinkText(note.path, '', false);
    }

    updateStatusBarItem() {
        if (this.statusBarItem) {
            this.statusBarItem.setText(`Mnemosyne session active. (${this.files.length} notes total.)`);
        }
    }

    removeCurrentNote() {
        if (this.files.length === 0) {
            new Notice("No session is active.");
            return;
        }

        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice("No active file to remove.");
            return;
        }

        const index = this.files.findIndex(file => file.path === activeFile.path);
        if (index !== -1) {
            this.files.splice(index, 1);
            new Notice(`Removed "${activeFile.basename}" from the session.`);
            
            // Adjust currentIndex if necessary
            if (this.currentIndex >= this.files.length) {
                this.currentIndex = 0;
            }

            if (this.files.length === 0) {
                new Notice("All notes have been removed from the session.");
                this.statusBarItem.setText('No Mnemosyne session active.');
            
                // Reset session state
                this.currentIndex = 0;
                this.files = [];
                return;
            }
            

            // Open the next note
            this.openNote(this.files[this.currentIndex]);
            this.updateStatusBarItem();
        } else {
            new Notice("The active note is not part of the session.");
        }
    }

}
