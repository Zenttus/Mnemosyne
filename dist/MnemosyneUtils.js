// MnemosyneUtils.ts
import { getAllTags } from 'obsidian';
export function matchesFilters(file, app, settings) {
    var _a;
    const cache = app.metadataCache.getFileCache(file);
    const tags = cache ? (_a = getAllTags(cache)) !== null && _a !== void 0 ? _a : [] : [];
    if (settings.excludedTags.some((tag) => tags.includes(tag))) {
        return false;
    }
    if (settings.includedTags.length > 0) {
        if (settings.tagFilterMode === 'OR') {
            return settings.includedTags.some((tag) => tags.includes(tag));
        }
        else if (settings.tagFilterMode === 'AND') {
            return settings.includedTags.every((tag) => tags.includes(tag));
        }
    }
    return true;
}
//# sourceMappingURL=MnemosyneUtils.js.map