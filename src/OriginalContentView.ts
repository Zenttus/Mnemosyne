import { ItemView, WorkspaceLeaf, TFile } from 'obsidian';

export const ORIGINAL_CONTENT_VIEW_TYPE = 'mnemosyne-original-content-view';

export class OriginalContentView extends ItemView {
  private file: TFile | null = null;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType(): string {
    return ORIGINAL_CONTENT_VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'Original Content';
  }

  async onOpen() {
    const state = this.leaf.getViewState().state as any;
    if (state && state.file) {
      this.file = state.file as TFile | null;
      if (this.file !== null) {
        const content = await this.app.vault.cachedRead(this.file);
        if (content !== null) {
          this.contentEl.empty();

          const container = this.contentEl.createEl('div', { cls: 'original-content-container' });
        } else {
          console.log('File not found');
        }
      }
    }
  }
}