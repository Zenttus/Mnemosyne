// MnemosyneSettingTab.ts

import { App, PluginSettingTab, Setting } from 'obsidian';
import Mnemosyne from './Mnemosyne';

export class MnemosyneSettingTab extends PluginSettingTab {
  plugin: Mnemosyne;

  constructor(app: App, plugin: Mnemosyne) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.createEl('h2', { text: 'Mnemosyne Settings' });

    new Setting(containerEl)
      .setName('Iterate All Files')
      .setDesc('Include all notes in the session, ignoring tags.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.iterateAllFiles)
          .onChange(async (value) => {
            this.plugin.settings.iterateAllFiles = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
