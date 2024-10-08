// OriginalContentView.ts
import { ItemView } from 'obsidian';
export const ORIGINAL_CONTENT_VIEW_TYPE = 'mnemosyne-original-content-view';
export class OriginalContentView extends ItemView {
    constructor(leaf) {
        super(leaf);
        this.file = null;
    }
    getViewType() {
        return ORIGINAL_CONTENT_VIEW_TYPE;
    }
    getDisplayText() {
        return 'Original Content';
    }
    async onOpen() {
        const state = this.leaf.getViewState().state;
        if (state && state.file) {
            this.file = state.file;
            if (this.file !== null) { // Add a null check for this.file
                const content = await this.app.vault.cachedRead(this.file);
                if (content !== null) {
                    this.contentEl.empty();
                    const container = this.contentEl.createEl('div', { cls: 'original-content-container' });
                    // Rest of your code here...
                }
                else {
                    console.log('File not found'); // or handle the situation as per your requirement
                }
            }
        }
    }
}
//# sourceMappingURL=OriginalContentView.js.map