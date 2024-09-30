// MnemosyneSettings.ts

export interface MnemosyneSettings {
    includedTags: string[];
    excludedTags: string[];
    allTagsSelected: boolean;
    iterateAllFiles: boolean;
}

export const DEFAULT_SETTINGS: MnemosyneSettings = {
    includedTags: [],
    excludedTags: [],
    allTagsSelected: false,
    iterateAllFiles: false,
};
