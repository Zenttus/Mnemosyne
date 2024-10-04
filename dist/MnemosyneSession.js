import { Notice, getAllTags } from 'obsidian';
export class MnemosyneSession {
    constructor(app, settings, statusBarItem) {
        this.files = [];
        this.currentIndex = 0;
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
        console.log(`Total markdown files: ${allFiles.length}`);
        this.files = allFiles.filter((file) => {
            var _a;
            const cache = this.app.metadataCache.getFileCache(file);
            const tags = cache ? (_a = getAllTags(cache)) !== null && _a !== void 0 ? _a : [] : [];
            // 1. If 'iterateAllFiles' is true, include all notes regardless of tags
            if (this.settings.iterateAllFiles) {
                return true;
            }
            // 2. If 'allTagsSelected' is true, include all notes
            if (this.settings.allTagsSelected) {
                return true;
            }
            // 3. Exclude notes that have any of the excluded tags
            if (this.settings.excludedTags.some((tag) => tags.includes(tag))) {
                return false; // Exclude this note
            }
            // 4. If included tags are specified, include notes that have any of them
            if (this.settings.includedTags.length > 0) {
                if (this.settings.includedTags.some((tag) => tags.includes(tag))) {
                    return true; // Include this note
                }
                else {
                    return false; // Exclude this note
                }
            }
            // 5. If no included tags are specified, and the note doesn't have any excluded tags, include it
            return true; // Include this note
        });
        console.log(`Files after filtering: ${this.files.length}`);
        this.shuffleFiles();
    }
    shuffleFiles() {
        for (let i = this.files.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.files[i], this.files[j]] = [this.files[j], this.files[i]];
        }
    }
    openNote(note) {
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
        }
        else {
            new Notice("The active note is not part of the session.");
        }
    }
}
//# sourceMappingURL=MnemosyneSession.js.map