import { Plugin } from 'obsidian';
import { MnemosyneSession } from './MnemosyneSession';
import { MnemosyneSettings, DEFAULT_SETTINGS } from './MnemosyneSettings';
import { MnemosyneSidebarView } from './MnemosyneSidebarView';
import { MnemosyneSettingTab } from './MnemosyneSettingTab';
import { OriginalContentView } from './OriginalContentView';

export default class Mnemosyne extends Plugin {
	settings!: MnemosyneSettings;
	mnemosyneSession!: MnemosyneSession;

	async onload() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.mnemosyneSession = new MnemosyneSession(this.app, this.settings, this.addStatusBarItem(), this);

		this.registerView('mnemosyne-sidebar-view', (leaf) => new MnemosyneSidebarView(leaf, this));
		this.registerView('mnemosyne-original-content-view', (leaf) => new OriginalContentView(leaf));

		this.addRibbonIcon('switch', 'Mnemosyne', () => this.activateSidebarView());

		this.addSettingTab(new MnemosyneSettingTab(this.app, this));

		// Commands
		this.addCommand({
			id: 'get-next-note-mnemosyne',
			name: 'Next Note',
			callback: () => {
				this.mnemosyneSession.getNextNote();
			},
		});
		this.addCommand({
			id: 'remove-current-note-mnemosyne',
			name: 'Remove Current Note from Session',
			callback: () => {
				this.mnemosyneSession.removeCurrentNote();
			},
			hotkeys: [
				{
					modifiers: ['Mod', 'Shift'],
					key: 'R',
				},
			],
		});

	}

	async onunload() {
		this.mnemosyneSession.stopSession();
		this.app.workspace.detachLeavesOfType('mnemosyne-sidebar-view');
		this.app.workspace.detachLeavesOfType('mnemosyne-original-content-view');
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
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}