// MnemosyneSettingTab.ts

import { App, PluginSettingTab, Setting } from 'obsidian';
import Mnemosyne from './Mnemosyne';

export class MnemosyneSettingTab extends PluginSettingTab {
    plugin: Mnemosyne;

    constructor(app: App, plugin: Mnemosyne) {
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
