import { TFile, App, getAllTags } from 'obsidian';
import { MnemosyneSettings } from './MnemosyneSettings';

export function matchesFilters(file: TFile, app: App, settings: MnemosyneSettings): boolean {
    const cache = app.metadataCache.getFileCache(file);
    const tags = cache ? getAllTags(cache) ?? [] : [];

    if (settings.excludedTags.some((tag) => tags.includes(tag))) {
        return false;
    }

    if (settings.includedTags.length > 0) {
        if (settings.tagFilterMode === 'OR') {
            return settings.includedTags.some((tag) => tags.includes(tag));
        } else if (settings.tagFilterMode === 'AND') {
            return settings.includedTags.every((tag) => tags.includes(tag));
        }
    }
    return true;
}