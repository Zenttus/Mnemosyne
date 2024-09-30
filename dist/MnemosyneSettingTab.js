// MnemosyneSettingTab.ts
import { PluginSettingTab, Setting, getAllTags } from 'obsidian';
export class MnemosyneSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.availableTags = [];
        this.plugin = plugin;
        this.fetchAvailableTags();
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Settings for Mnemosyne.' });
        // Toggle to iterate over all files
        new Setting(containerEl)
            .setName('Iterate Over All Files')
            .setDesc('Include all files in the vault for the Mnemosyne session, ignoring any filters.')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.iterateAllFiles)
            .onChange(async (value) => {
            this.plugin.settings.iterateAllFiles = value;
            await this.plugin.saveSettings();
        }));
        // Tags to include
        this.createTagsSetting(containerEl, 'Tags to Include', 'Select tags to include in the session.', this.plugin.settings.tagsToInclude, 'tagsToInclude');
        // Tags to exclude
        this.createTagsSetting(containerEl, 'Tags to Exclude', 'Select tags to exclude from the session.', this.plugin.settings.tagsToExclude, 'tagsToExclude');
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
    // Create settings for tags with updated styling
    // Create settings for tags with duplicate prevention
    createTagsSetting(containerEl, name, desc, currentValue, settingKey) {
        const setting = new Setting(containerEl)
            .setName(name)
            .setDesc(desc);
        // Create a container for styling
        const selectContainer = setting.controlEl.createDiv({ cls: 'mnemosyne-select-container' });
        // Create a dropdown to select tags
        const selectEl = selectContainer.createEl('select', { attr: { multiple: 'multiple' } });
        selectEl.style.width = '100%';
        selectEl.style.height = '200px'; // Adjust the height as needed
        // Determine the opposite setting key
        const oppositeKey = settingKey === 'tagsToInclude' ? 'tagsToExclude' : 'tagsToInclude';
        // Get tags selected in the opposite field
        const oppositeTags = this.plugin.settings[oppositeKey];
        // Add options, excluding tags selected in the opposite field
        this.availableTags.forEach(tag => {
            if (!oppositeTags.includes(tag)) {
                const option = selectEl.createEl('option', { text: tag });
                option.value = tag;
                if (currentValue.includes(tag)) {
                    option.selected = true;
                }
            }
        });
        // Add '*' option if applicable
        if (!oppositeTags.includes('*')) {
            const allOption = selectEl.createEl('option', { text: '*' });
            allOption.value = '*';
            if (currentValue.includes('*')) {
                allOption.selected = true;
            }
        }
        selectEl.onchange = async () => {
            const selectedOptions = Array.from(selectEl.selectedOptions).map(option => option.value);
            // Remove selected tags from the opposite field
            const oppositeSelectEl = containerEl.querySelector(`select[data-setting-key="${oppositeKey}"]`);
            if (oppositeSelectEl) {
                const oppositeOptions = Array.from(oppositeSelectEl.options);
                oppositeOptions.forEach(option => {
                    if (selectedOptions.includes(option.value)) {
                        option.selected = false;
                    }
                });
                // Update the opposite setting
                this.plugin.settings[oppositeKey] = oppositeOptions.filter(option => option.selected).map(option => option.value);
            }
            // Update the plugin settings
            this.plugin.settings[settingKey] = selectedOptions;
            await this.plugin.saveSettings();
            // Refresh the settings display to update options
            this.display();
        };
        // Add data attribute to identify the select element
        selectEl.setAttribute('data-setting-key', settingKey);
    }
}
//# sourceMappingURL=MnemosyneSettingTab.js.map