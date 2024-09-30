// MnemosyneSession.ts
import { Notice, getAllTags } from 'obsidian';
export class MnemosyneSession {
    constructor(app, settings, statusBarItem) {
        this.files = [];
        this.currentIndex = 0; // Keep track of the current index
        this.app = app;
        this.settings = settings;
        this.statusBarItem = statusBarItem;
    }
    // Start a new Mnemosyne session
    startSession() {
        console.log("Starting session...");
        this.applyFilters();
        console.log(`Files after applying filters: ${this.files.length}`);
        if (this.files.length === 0) {
            new Notice("There are no notes.");
            return;
        }
        this.currentIndex = 0; // Reset current index
        this.updateStatusBarItem();
        this.openNote(this.files[this.currentIndex]); // Open the first note
    }
    // Get the next note in the session
    getNextNote() {
        if (this.files.length === 0) {
            new Notice("Mnemonic session completed");
            this.statusBarItem.setText('No Mnemosyne session active.');
            return;
        }
        // Move to the next note
        this.currentIndex = (this.currentIndex + 1) % this.files.length;
        const nextNote = this.files[this.currentIndex];
        if (nextNote) {
            this.openNote(nextNote);
        }
        this.updateStatusBarItem();
    }
    // Apply filters to determine which files to include in the session
    applyFilters() {
        const allFiles = this.app.vault.getMarkdownFiles();
        console.log(`Total markdown files: ${allFiles.length}`);
        // Apply tag and path filters
        this.files = allFiles.filter((file) => {
            var _a;
            const cache = this.app.metadataCache.getFileCache(file);
            const tags = cache ? (_a = getAllTags(cache)) !== null && _a !== void 0 ? _a : [] : [];
            // Include note if it matches any of the tags to include, or if '*' is present
            const includeTags = this.settings.tagsToInclude.includes('*') ||
                this.settings.tagsToInclude.some(tag => tags.includes(tag));
            // Exclude note if it matches any of the tags to exclude
            const excludeTags = this.settings.tagsToExclude.some(tag => tags.includes(tag));
            return includeTags && !excludeTags;
        });
        console.log(`Files after filtering: ${this.files.length}`);
        this.shuffleFiles();
    }
    // Shuffle the files array
    shuffleFiles() {
        for (let i = this.files.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.files[i], this.files[j]] = [this.files[j], this.files[i]];
        }
    }
    // Open a note in the workspace
    openNote(note) {
        this.app.workspace.openLinkText(note.path, '', false);
    }
    // Update the status bar item with the current session status
    updateStatusBarItem() {
        if (this.statusBarItem) {
            this.statusBarItem.setText(`Mnemosyne session active. (${this.files.length} notes total.)`);
        }
    }
}
//# sourceMappingURL=MnemosyneSession.js.map