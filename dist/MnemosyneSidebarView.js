// MnemosyneSidebarView.ts
import { matchesFilters } from './MnemosyneUtils';
import { ItemView, ButtonComponent, getAllTags, Notice } from 'obsidian';
import { ToggleComponent, Setting } from 'obsidian';
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
        const container = this.contentEl;
        container.empty();
        container.addClass('mnemosyne-sidebar-container');
        const header = container.createEl('h4', { text: 'Mnemosyne Session' });
        header.style.marginBottom = '10px';
        // Create container for session control buttons
        const sessionControlContainer = container.createDiv({ cls: 'session-control-container' });
        // Start Session button
        const startSessionButton = new ButtonComponent(sessionControlContainer);
        startSessionButton.setButtonText('Start Session').onClick(() => {
            this.plugin.mnemosyneSession.startSession();
        });
        // Timer Mode Toggle
        const timerToggleContainer = sessionControlContainer.createDiv({ cls: 'timer-toggle-container' });
        const timerToggleLabel = timerToggleContainer.createEl('span', { text: 'Enable Timer Mode' });
        const timerToggle = new ToggleComponent(timerToggleContainer);
        timerToggle.setValue(this.plugin.settings.timerEnabled)
            .onChange(async (value) => {
            this.plugin.settings.timerEnabled = value;
            await this.plugin.saveSettings();
            // Show or hide the timer options and additional buttons
            timerOptionsContainer.toggleClass('hidden', !value);
            additionalButtonsContainer.toggleClass('hidden', !value);
        });
        // Timer options container (hidden if timer not enabled)
        const timerOptionsContainer = sessionControlContainer.createDiv({ cls: 'timer-options-container' });
        timerOptionsContainer.toggleClass('hidden', !this.plugin.settings.timerEnabled);
        // Time input in minutes
        new Setting(timerOptionsContainer)
            .setName('Time per note (minutes)')
            .addText((text) => {
            text.setPlaceholder('Enter time in minutes')
                .setValue(String(this.plugin.settings.timePerNote / 60))
                .onChange(async (value) => {
                const minutes = parseFloat(value);
                if (!isNaN(minutes) && minutes > 0) {
                    this.plugin.settings.timePerNote = minutes * 60; // Convert to seconds
                    await this.plugin.saveSettings();
                }
                else {
                    new Notice('Please enter a valid number greater than 0.');
                }
            });
        });
        // Additional buttons container (hidden if timer not enabled)
        const additionalButtonsContainer = sessionControlContainer.createDiv({ cls: 'additional-buttons-container' });
        additionalButtonsContainer.toggleClass('hidden', !this.plugin.settings.timerEnabled);
        // Next Note button
        const nextNoteButton = new ButtonComponent(additionalButtonsContainer);
        nextNoteButton.setButtonText('Next Note').onClick(() => {
            this.plugin.mnemosyneSession.getNextNote();
        });
        // Remove Note button
        const removeNoteButton = new ButtonComponent(additionalButtonsContainer);
        removeNoteButton.setButtonText('Remove Note').onClick(() => {
            this.plugin.mnemosyneSession.removeCurrentNote();
        });
        // Stop Session button
        const stopSessionButton = new ButtonComponent(additionalButtonsContainer);
        stopSessionButton.setButtonText('Stop Session').onClick(() => {
            this.plugin.mnemosyneSession.stopSession();
        });
        // Note count display
        this.noteCountElement = container.createEl('div', { cls: 'mnemosyne-note-count' });
        this.noteCountElement.style.marginBottom = '10px';
        this.updateNoteCount();
        this.tagsContainer = container.createDiv({ cls: 'mnemosyne-tags-container' });
        this.createTagButtons();
        // Register event handlers
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
    // Fetch tags and their counts
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
        // Convert to array and sort alphabetically
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
        resetButton.innerHTML = ' ⟲ '; // Reset icon
        resetButton.title = 'Reset tags';
        resetButton.addEventListener('click', async () => {
            this.plugin.settings.includedTags = [];
            this.plugin.settings.excludedTags = [];
            await this.plugin.saveSettings();
            // Refresh 
            this.createTagButtons();
            this.updateNoteCount();
        });
        const buttonGrid = this.tagsContainer.createDiv({ cls: 'mnemosyne-button-grid' });
        buttonGrid.removeClass('proportional-buttons');
        // Create a button for each tag
        this.availableTags.forEach(tag => {
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
    updateNoteCount() {
        const noteCount = this.calculateMatchingNotes();
        this.noteCountElement.setText(`Notes matching current selection: ${noteCount}`);
    }
    calculateMatchingNotes() {
        const allFiles = this.app.vault.getMarkdownFiles();
        const matchingFiles = allFiles.filter(file => matchesFilters(file, this.app, this.plugin.settings));
        return matchingFiles.length;
    }
}
//# sourceMappingURL=MnemosyneSidebarView.js.map