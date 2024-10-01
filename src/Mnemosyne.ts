import { Plugin, Notice } from 'obsidian';
import { MnemosyneSession } from './MnemosyneSession';
import { MnemosyneSettings, DEFAULT_SETTINGS } from './MnemosyneSettings';
import { MnemosyneSidebarView } from './MnemosyneSidebarView';
import { MnemosyneSettingTab } from './MnemosyneSettingTab';

export default class Mnemosyne extends Plugin {
    settings!: MnemosyneSettings;
    mnemosyneSession!: MnemosyneSession;

    async onload() {
        console.log("Mnemosyne plugin loaded.");

        await this.loadSettings();

        // Load the stylesheet
        this.addStylesheet();

        // Create status bar item
        const statusBarItemEl = this.addStatusBarItem();
        statusBarItemEl.setText('No Mnemosyne session active.');

        // Initialize Mnemosyne session
        this.mnemosyneSession = new MnemosyneSession(this.app, this.settings, statusBarItemEl);

        // Add commands
        this.addCommand({
            id: 'get-next-note-mnemosyne',
            name: 'Next Note',
            callback: () => {
                this.mnemosyneSession.getNextNote();
            }
        });

        this.addCommand({
            id: 'start-mnemosyne',
            name: 'Start Mnemosyne Session',
            callback: () => {
                this.mnemosyneSession.startSession();
                new Notice('Mnemosyne session started.');
            }
        });

        // **Add the Remove Note command**
        this.addCommand({
            id: 'remove-current-note-mnemosyne',
            name: 'Remove Current Note from Session',
            callback: () => {
                this.mnemosyneSession.removeCurrentNote();
            },
            // **Add a default hotkey (e.g., Ctrl+Shift+R on Windows/Linux or Cmd+Shift+R on macOS)**
            hotkeys: [
                {
                    modifiers: ["Mod", "Shift"],
                    key: "R"
                }
            ]
        });

        // Register the sidebar view
        this.registerView(
            'mnemosyne-sidebar-view',
            (leaf) => new MnemosyneSidebarView(leaf, this)
        );

        // Add ribbon icon
        this.addRibbonIcon('switch', 'Mnemosyne', () => this.activateSidebarView());

        this.addSettingTab(new MnemosyneSettingTab(this.app, this));
    }

    async onunload() {
        console.log("Mnemosyne plugin unloaded.");
        this.app.workspace.detachLeavesOfType('mnemosyne-sidebar-view');
    }

    async activateSidebarView() {
        this.app.workspace.detachLeavesOfType('mnemosyne-sidebar-view');

        const leaf = this.app.workspace.getRightLeaf(false);
        if (leaf) {
            await leaf.setViewState({
                type: 'mnemosyne-sidebar-view',
                active: true,
            });
            this.app.workspace.revealLeaf(
                this.app.workspace.getLeavesOfType('mnemosyne-sidebar-view')[0]
            );
        } else {
            new Notice('No right leaf available to display the Mnemosyne sidebar.');
        }
    }

    addStylesheet() {
        this.registerDomEvent(document, 'DOMContentLoaded', () => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = this.getAssetPath('styles.css');
            document.head.appendChild(link);
        });
    }

    getAssetPath(assetName: string): string {
        return this.app.vault.adapter.getResourcePath(`${this.manifest.dir}/${assetName}`);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
