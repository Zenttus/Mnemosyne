import { ItemView, ButtonComponent, getAllTags } from 'obsidian';
export class MnemosyneSidebarView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.availableTags = [];
        this.plugin = plugin;
        this.fetchAvailableTags();
    }
    getViewType() {
        return 'mnemosyne-sidebar-view';
    }
    getDisplayText() {
        return 'Mnemosyne Sidebar';
    }
    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        const header = container.createEl('h4', { text: 'Mnemosyne Session' });
        header.style.marginBottom = '10px';
        const buttonContainer = container.createEl('div', { cls: 'button-container' });
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.marginBottom = '20px';
        // Start Session button
        const startSessionButton = new ButtonComponent(buttonContainer);
        startSessionButton.setButtonText('Start Session').onClick(() => {
            this.plugin.mnemosyneSession.startSession();
        });
        // Next Note button
        const nextNoteButton = new ButtonComponent(buttonContainer);
        nextNoteButton.setButtonText('Next Note').onClick(() => {
            this.plugin.mnemosyneSession.getNextNote();
        });
        // Settings header
        const settingsHeader = container.createEl('h5', { text: 'Tag Selection' });
        settingsHeader.style.marginBottom = '10px';
        // Create containers for include and exclude sections
        this.includeTagsContainer = container.createDiv({ cls: 'mnemosyne-include-tags-container' });
        this.excludeTagsContainer = container.createDiv({ cls: 'mnemosyne-exclude-tags-container' });
        // Create tag buttons for inclusion and exclusion
        this.createTagButtons(this.includeTagsContainer, 'Include Tags', this.plugin.settings.tagsToInclude, 'tagsToInclude');
        this.createTagButtons(this.excludeTagsContainer, 'Exclude Tags', this.plugin.settings.tagsToExclude, 'tagsToExclude');
    }
    async onClose() {
        // No cleanup necessary
    }
    // Fetch all available tags from the vault
    fetchAvailableTags() {
        const files = this.app.vault.getMarkdownFiles();
        const tagSet = new Set();
        files.forEach(file => {
            var _a;
            const cache = this.app.metadataCache.getFileCache(file);
            const tags = cache ? (_a = getAllTags(cache)) !== null && _a !== void 0 ? _a : [] : [];
            tags.forEach(tag => tagSet.add(tag));
        });
        this.availableTags = Array.from(tagSet);
    }
    // Create tag buttons for selection
    createTagButtons(container, title, selectedTags, settingKey) {
        // Clear the container to prevent duplication
        container.empty();
        const sectionHeader = container.createEl('h5', { text: title });
        sectionHeader.style.marginTop = '20px';
        sectionHeader.style.marginBottom = '10px';
        const buttonGrid = container.createDiv({ cls: 'mnemosyne-button-grid' });
        // Determine tags selected in the opposite field to prevent duplicates
        const oppositeKey = settingKey === 'tagsToInclude' ? 'tagsToExclude' : 'tagsToInclude';
        const oppositeTags = this.plugin.settings[oppositeKey];
        // Create a button for each tag
        this.availableTags.forEach(tag => {
            // Skip tags selected in the opposite field
            if (oppositeTags.includes(tag))
                return;
            const button = buttonGrid.createEl('button', { text: tag, cls: 'tag-button' });
            // Apply selected style if the tag is selected
            if (selectedTags.includes(tag)) {
                button.addClass('tag-button-selected');
            }
            button.addEventListener('click', async () => {
                if (selectedTags.includes(tag)) {
                    // Deselect the tag
                    selectedTags.splice(selectedTags.indexOf(tag), 1);
                    button.removeClass('tag-button-selected');
                }
                else {
                    // Select the tag
                    selectedTags.push(tag);
                    button.addClass('tag-button-selected');
                    // Remove from opposite field if necessary
                    const oppositeIndex = this.plugin.settings[oppositeKey].indexOf(tag);
                    if (oppositeIndex !== -1) {
                        this.plugin.settings[oppositeKey].splice(oppositeIndex, 1);
                    }
                }
                // Save settings
                this.plugin.settings[settingKey] = selectedTags;
                await this.plugin.saveSettings();
                // Refresh both sections to update buttons
                this.createTagButtons(this.includeTagsContainer, 'Include Tags', this.plugin.settings.tagsToInclude, 'tagsToInclude');
                this.createTagButtons(this.excludeTagsContainer, 'Exclude Tags', this.plugin.settings.tagsToExclude, 'tagsToExclude');
            });
        });
    }
}
//# sourceMappingURL=MnemosyneSidebarView.js.map