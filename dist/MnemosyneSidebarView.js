import { ItemView, ButtonComponent, getAllTags } from 'obsidian';
export class MnemosyneSidebarView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.availableTags = [];
        this.tagCounts = {};
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
        // Create container for session control buttons
        const sessionControlContainer = container.createDiv({ cls: 'session-control-container' });
        sessionControlContainer.style.display = 'flex';
        sessionControlContainer.style.flexDirection = 'column';
        sessionControlContainer.style.gap = '10px';
        sessionControlContainer.style.marginBottom = '20px';
        // Start Session button
        const startSessionButton = new ButtonComponent(sessionControlContainer);
        startSessionButton.setButtonText('Start Session').onClick(() => {
            this.plugin.mnemosyneSession.startSession();
        });
        // Next Note button
        const nextNoteButton = new ButtonComponent(sessionControlContainer);
        nextNoteButton.setButtonText('Next Note').onClick(() => {
            this.plugin.mnemosyneSession.getNextNote();
        });
        // Remove Note button
        const removeNoteButton = new ButtonComponent(sessionControlContainer);
        removeNoteButton.setButtonText('Remove Note').onClick(() => {
            this.plugin.mnemosyneSession.removeCurrentNote();
        });
        // Add note count display
        this.noteCountElement = container.createEl('div', { cls: 'mnemosyne-note-count' });
        this.noteCountElement.style.marginBottom = '10px';
        this.updateNoteCount();
        // Create container for tags
        this.tagsContainer = container.createDiv({ cls: 'mnemosyne-tags-container' });
        // Create tag buttons
        this.createTagButtons();
        // Register to update tags when the vault changes
        this.registerEvent(this.app.vault.on('modify', this.handleVaultChange.bind(this)));
        this.registerEvent(this.app.vault.on('delete', this.handleVaultChange.bind(this)));
        this.registerEvent(this.app.vault.on('create', this.handleVaultChange.bind(this)));
    }
    // Handler for vault changes
    handleVaultChange() {
        // Re-fetch tags and counts
        this.fetchAvailableTags();
        // Re-create tag buttons with updated counts
        this.createTagButtons();
        // Update the note count display
        this.updateNoteCount();
    }
    async onClose() {
        // No cleanup necessary
    }
    // Fetch all available tags from the vault and their counts
    fetchAvailableTags() {
        const files = this.app.vault.getMarkdownFiles();
        const tagCounts = {};
        files.forEach(file => {
            var _a;
            const cache = this.app.metadataCache.getFileCache(file);
            const tags = cache ? (_a = getAllTags(cache)) !== null && _a !== void 0 ? _a : [] : [];
            tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        // Convert the tags to an array and sort alphabetically
        this.availableTags = Object.keys(tagCounts).sort((a, b) => a.localeCompare(b));
        this.tagCounts = tagCounts;
    }
    // Create tag buttons with three-state cycling
    createTagButtons() {
        const updateNoteCount = async () => {
            await this.plugin.saveSettings();
            this.updateNoteCount();
        };
        // Clear the container to prevent duplication
        this.tagsContainer.empty();
        // Create a header container for the title and reset button
        const headerContainer = this.tagsContainer.createDiv({ cls: 'header-container' });
        headerContainer.style.display = 'flex';
        headerContainer.style.justifyContent = 'space-between';
        headerContainer.style.alignItems = 'center';
        headerContainer.style.marginTop = '20px';
        headerContainer.style.marginBottom = '10px';
        const sectionHeader = headerContainer.createEl('h5', { text: 'Tags' });
        sectionHeader.style.margin = '0';
        // Add a reset button
        const resetButton = headerContainer.createEl('button', { cls: 'reset-button' });
        resetButton.innerHTML = '⟲'; // Reset icon
        resetButton.title = 'Reset tags';
        resetButton.onclick = async () => {
            // Clear the selected tags
            this.plugin.settings.includedTags = [];
            this.plugin.settings.excludedTags = [];
            this.plugin.settings.allTagsSelected = false;
            // Save settings
            await this.plugin.saveSettings();
            // Refresh tags
            this.createTagButtons();
        };
        const buttonGrid = this.tagsContainer.createDiv({ cls: 'mnemosyne-button-grid' });
        // Add '*' button
        const allTagsButton = buttonGrid.createEl('button', { text: '*', cls: 'tag-button' });
        // Apply selected style if '*' is selected
        if (this.plugin.settings.allTagsSelected) {
            allTagsButton.addClass('tag-button-all-selected');
        }
        allTagsButton.addEventListener('click', async () => {
            if (this.plugin.settings.allTagsSelected) {
                // Deselect '*'
                this.plugin.settings.allTagsSelected = false;
                allTagsButton.removeClass('tag-button-all-selected');
            }
            else {
                // Select '*', reset other tags
                this.plugin.settings.allTagsSelected = true;
                this.plugin.settings.includedTags = [];
                this.plugin.settings.excludedTags = [];
                allTagsButton.addClass('tag-button-all-selected');
            }
            // Save settings
            await this.plugin.saveSettings();
            // Refresh tags
            this.createTagButtons();
            // Update note count after changes
            await updateNoteCount();
        });
        // Create a button for each tag
        this.availableTags.forEach(tag => {
            // Disable other tags if '*' is selected
            if (this.plugin.settings.allTagsSelected)
                return;
            // Get the count for the tag
            const tagCount = this.tagCounts[tag] || 0;
            // Update the button text to include the count
            const buttonText = `${tag} (${tagCount})`;
            const button = buttonGrid.createEl('button', { text: buttonText, cls: 'tag-button' });
            // Determine the state of the tag
            let state = 'neutral';
            if (this.plugin.settings.includedTags.includes(tag)) {
                state = 'included';
                button.addClass('tag-button-included');
            }
            else if (this.plugin.settings.excludedTags.includes(tag)) {
                state = 'excluded';
                button.addClass('tag-button-excluded');
            }
            // Add hover event listeners to show potential state change
            button.addEventListener('mouseover', () => {
                if (state === 'neutral') {
                    button.addClass('included-potential');
                }
                else if (state === 'included') {
                    button.addClass('excluded-potential');
                }
                else if (state === 'excluded') {
                    button.addClass('neutral-potential');
                }
            });
            button.addEventListener('mouseout', () => {
                button.removeClass('included-potential');
                button.removeClass('excluded-potential');
                button.removeClass('neutral-potential');
            });
            button.addEventListener('click', async () => {
                // Remove both state classes first
                button.removeClass('tag-button-included');
                button.removeClass('tag-button-excluded');
                button.removeClass('included-potential');
                button.removeClass('excluded-potential');
                button.removeClass('neutral-potential');
                // Cycle through states
                if (state === 'neutral') {
                    // Include the tag
                    this.plugin.settings.includedTags.push(tag);
                    state = 'included';
                    button.addClass('tag-button-included');
                }
                else if (state === 'included') {
                    // Exclude the tag
                    this.plugin.settings.includedTags.splice(this.plugin.settings.includedTags.indexOf(tag), 1);
                    this.plugin.settings.excludedTags.push(tag);
                    state = 'excluded';
                    button.addClass('tag-button-excluded');
                }
                else if (state === 'excluded') {
                    // Reset to neutral
                    this.plugin.settings.excludedTags.splice(this.plugin.settings.excludedTags.indexOf(tag), 1);
                    state = 'neutral';
                    // No class added for neutral state
                }
                // Save settings
                await this.plugin.saveSettings();
                this.createTagButtons();
                await updateNoteCount();
            });
        });
    }
    // Method to update the note count display
    updateNoteCount() {
        const noteCount = this.calculateMatchingNotes();
        this.noteCountElement.setText(`Notes matching current selection: ${noteCount}`);
    }
    // Method to calculate the number of notes matching the current tag selection
    calculateMatchingNotes() {
        const allFiles = this.app.vault.getMarkdownFiles();
        const matchingFiles = allFiles.filter((file) => {
            var _a;
            const cache = this.app.metadataCache.getFileCache(file);
            const tags = cache ? (_a = getAllTags(cache)) !== null && _a !== void 0 ? _a : [] : [];
            if (this.plugin.settings.iterateAllFiles) {
                return true;
            }
            if (this.plugin.settings.allTagsSelected) {
                return true;
            }
            if (this.plugin.settings.excludedTags.some((tag) => tags.includes(tag))) {
                return false;
            }
            if (this.plugin.settings.includedTags.length > 0) {
                return this.plugin.settings.includedTags.some((tag) => tags.includes(tag));
            }
            return true;
        });
        return matchingFiles.length;
    }
}
//# sourceMappingURL=MnemosyneSidebarView.js.map