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
        containerEl.createEl('h2', { text: 'Mnemosyne Settings' });
        new Setting(containerEl)
            .setName('Iterate All Files')
            .setDesc('Include all notes in the session, ignoring tags.')
            .addToggle((toggle) => toggle
            .setValue(this.plugin.settings.iterateAllFiles)
            .onChange(async (value) => {
            this.plugin.settings.iterateAllFiles = value;
            await this.plugin.saveSettings();
        }));
    }
}
//# sourceMappingURL=MnemosyneSettingTab.js.map