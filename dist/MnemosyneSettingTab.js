// MnemosyneSettingTab.ts
import { PluginSettingTab, Setting } from 'obsidian';
export class MnemosyneSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
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
    }
}
//# sourceMappingURL=MnemosyneSettingTab.js.map