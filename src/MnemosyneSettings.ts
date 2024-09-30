// MnemosyneSettings.ts

export interface MnemosyneSettings {
    tagsToInclude: string[];
    tagsToExclude: string[];
    pathsToInclude: string[];
    pathsToExclude: string[];
    iterateAllFiles: boolean; // New setting to include all files
}

export const DEFAULT_SETTINGS: MnemosyneSettings = {
    tagsToInclude: [],
    tagsToExclude: [],
    pathsToInclude: [],
    pathsToExclude: [],
    iterateAllFiles: false,
};
