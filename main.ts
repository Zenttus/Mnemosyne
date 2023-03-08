import {App, Editor, MarkdownView, Plugin, Notice, TFile, PluginSettingTab, Setting } from 'obsidian';


interface MnemosyneSettings {
	tagsToInclude: string[];
	tagsToExclude: string[];
	pathsToInclude: string[];
	pathToExclude: string[];
}

const DEFAULT_SETTINGS: MnemosyneSettings = {
	tagsToInclude: [],
	tagsToExclude: [],
	pathsToInclude: [],
	pathToExclude: []
}

export default class Mnemosyne extends Plugin {
	settings: MnemosyneSettings;
	mnemosyneSession: MnemosyneSession;

	async onload() {
		await this.loadSettings();
		// Show status bar item when plugin is loaded
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('No Mnemosyne session active.');

		this.mnemosyneSession = new MnemosyneSession();

		// Adds the next command to the command palette
		this.addCommand({
			id: 'get-next-note-mnemosyne',
			name: 'Get next note',
			callback: () => {
				if (this.mnemosyneSession.sessionActive === false) {
					window.alert("No session");
					return;
				}
				const nextNote = this.mnemosyneSession.nextNote();
				if (nextNote) {
					this.app.workspace.openLinkText(nextNote.basename, nextNote.path, false);
				}
				statusBarItemEl.setText("Mnemosyne session active. (" + (this.mnemosyneSession.files.length) + ") notes left.");
			}
		});

		// Adds the skip command to the command palette
		this.addCommand({
			id: 'get-skip-note-mnemosyne',
			name: 'Skip note',
			callback: () => {
				if (this.mnemosyneSession.sessionActive === false) {
					window.alert("No session");
					return;
				}
				const nextNote = this.mnemosyneSession.skipNote();
				if (nextNote) {
					this.app.workspace.openLinkText(nextNote.basename, nextNote.path, false);
				}
			}
		});

		// Adds the start command to the command palette
		this.addCommand({
			id: 'start-mnemosyne',
			name: 'Start Mnemosyne session',
			callback: () => {
				this.mnemosyneSession.reset();
				this.mnemosyneSession.startSession(this.settings);
				statusBarItemEl.setText("Mnemosyne session active. (" + (this.mnemosyneSession.files.length) + ") notes left.");
			}
			
		});

		// Settings
		this.addSettingTab(new MnemosyneSettingTab(this.app, this));
		
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
	

}

class MnemosyneSession {
	files: TFile[];
	sessionActive: boolean;
	settings: MnemosyneSettings;

	constructor() {
		this.reset();
		this.sessionActive = false;
		this.settings = DEFAULT_SETTINGS;
	}

	startSession(settings: MnemosyneSettings) {
		this.applyFilters(settings.tagsToInclude, settings.tagsToExclude, settings.pathsToInclude, settings.pathToExclude);
		if(this.files.length === 0) {
			window.alert("There are no notes.")
			return;
		}
		this.sessionActive = true;
	}

	applyFilters(tagsToInclude: String[], tagsToExclude: String[], pathsToInclude: String[], pathsToExclude: String[]) {

		// Paths
		if(pathsToInclude.length > 0) {
			this.files = this.files.filter(file => pathsToInclude.includes(file.path));
		}
		this.files = this.files.filter(file => !pathsToExclude.includes(file.path));
		console.log(tagsToExclude);
		console.log(tagsToInclude);
		// Tags
		if (tagsToInclude.length > 0) {
			this.files = this.files.filter((file) => {
				// Check if the file exists and is a TFile
				if (file && file instanceof TFile) {
					// Get the cached frontmatter of the TFile
					const cache = app.metadataCache.getFileCache(file);
					if (cache) {
						const frontmatter = cache.frontmatter;
						if (frontmatter) {
							// Check if the frontmatter has a "tags" property
							if ("tags" in frontmatter) {
								// Get the tags as an array
								const tags = frontmatter.tags;
								// Check if the tags array includes the tag
								return tagsToInclude.some(tag => tags.includes(tag));
							}
						}
	  				}
				}
			});
		}
		if (tagsToExclude.length > 0) {
			this.files = this.files.filter((file) => {
				// Check if the file exists and is a TFile
				if (file && file instanceof TFile) {
					// Get the cached frontmatter of the TFile
					const cache = app.metadataCache.getFileCache(file);
					if (cache) {
						const frontmatter = cache.frontmatter;
						if (frontmatter) {
							// Check if the frontmatter has a "tags" property
							if ("tags" in frontmatter) {
								// Get the tags as an array
								const tags = frontmatter.tags;
								// Check if the tags array includes the tag
								return !tagsToExclude.some(tag => tags.includes(tag));
							}
						}
	  				}
				}
			});
		}
	}
	
	nextNote() {
		if (this.files.length === 0){
			this.sessionActive = false;
			// this.statusBarItemEl.setText("Mnemosyne session completed.");
			window.alert("Mnemonic session completed");
			return null;
		}
		return this.files.shift();
	}
	
	skipNote() {
		if (this.files.length === 0) {
			this.sessionActive = false;
			return null;
		}else if(this.files.length === 1) {
			window.alert("Can't skip last note, it's last one.")
			return null;
		}
		this.files = this.files.sort(() => Math.random() - 0.5); //Yes ineficient, yes doesn't matter, yes I'm lazy
		return this.files[-1];
	}
	
	reset() {
		// Get files
		this.files = app.vault.getMarkdownFiles()
		// Random order
		this.files = this.files.sort(() => Math.random() - 0.5);
		this.sessionActive = false;
	}
	
}

class MnemosyneSettingTab extends PluginSettingTab {
	plugin: Mnemosyne;

	constructor(app: App, plugin: Mnemosyne) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Mnemosyne.'});

		new Setting(containerEl)
			.setName('Tags to include')
			.setDesc('Tags to include in the session. If left empty it will include all Tags.')
			.addText(text => text
				.setValue(this.plugin.settings.tagsToInclude.join(','))
				.onChange(async (value) => {
					this.plugin.settings.tagsToInclude = value.split(',').map(tag => tag.trim());
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Tags to exclude')
			.setDesc('Tags to exclude from the session.')
			.addText(text => text
				.setValue(this.plugin.settings.tagsToExclude.join(','))
				.onChange(async (value) => {
					this.plugin.settings.tagsToExclude = value.split(',').map(tag => tag.trim());
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('Paths to include')
			.setDesc('Paths to include in the session. If left empty it will include all Paths.')
			.addText(text => text
				.setValue(this.plugin.settings.tagsToInclude.join(','))
				.onChange(async (value) => {
					this.plugin.settings.pathsToInclude = value.split(',').map(tag => tag.trim());
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Paths to exclude')
			.setDesc('Paths to exclude from the session.')
			.addText(text => text
				.setValue(this.plugin.settings.pathToExclude.join(','))
				.onChange(async (value) => {
					this.plugin.settings.pathToExclude = value.split(',').map(tag => tag.trim());
					await this.plugin.saveSettings();
				}));
	}
}

