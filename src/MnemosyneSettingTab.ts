import { App, PluginSettingTab, Setting, ColorComponent, DropdownComponent } from 'obsidian';
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

    // Effect Type Dropdown
    new Setting(containerEl)
      .setName('Effect Type')
      .setDesc('Select the type of effect to apply during the session.')
      .addDropdown((dropdown: DropdownComponent) => {
        dropdown.addOption('Background', 'Background Color');
        dropdown.addOption('FillUp', 'Fill Up Effect');
        dropdown.setValue(this.plugin.settings.effectType);
        dropdown.onChange(async (value) => {
          this.plugin.settings.effectType = value as 'Background' | 'FillUp';
          await this.plugin.saveSettings();
          this.display(); // Refresh
        });
      });

    // Color Pickers
    new Setting(containerEl)
      .setName('Start Color')
      .setDesc('Select the start color for the effect transition.')
      .addColorPicker((colorPicker: ColorComponent) => {
        colorPicker.setValue(this.plugin.settings.startColor);
        colorPicker.onChange(async (value) => {
          this.plugin.settings.startColor = value;
          await this.plugin.saveSettings();
        });
      });
    new Setting(containerEl)
      .setName('End Color')
      .setDesc('Select the end color for the effect transition.')
      .addColorPicker((colorPicker: ColorComponent) => {
        colorPicker.setValue(this.plugin.settings.endColor);
        colorPicker.onChange(async (value) => {
          this.plugin.settings.endColor = value;
          await this.plugin.saveSettings();
        });
      });
    new Setting(containerEl)
      .setName('Show Timer in Status Bar')
      .setDesc('Display the remaining time in the status bar at the bottom.')
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.showStatusBarTimer)
          .onChange(async (value) => {
            this.plugin.settings.showStatusBarTimer = value;
            await this.plugin.saveSettings();
          });
      });
  }
}
