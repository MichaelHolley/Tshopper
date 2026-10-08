import { normalizeItemName } from './item-name';

const MAX_SUGGESTIONS = 8;

/** Prefix matches rank ahead of other substring matches; each group keeps the order of `names`. */
export function filterSuggestions(
	names: string[],
	input: string,
	excludeNames: string[]
): string[] {
	const query = normalizeItemName(input);
	if (!query) return [];

	const excluded = new Set(excludeNames.map(normalizeItemName));
	const prefixMatches: string[] = [];
	const otherMatches: string[] = [];
	for (const name of names) {
		const normalized = normalizeItemName(name);
		if (normalized === query || excluded.has(normalized)) continue;
		const index = normalized.indexOf(query);
		if (index === 0) prefixMatches.push(name);
		else if (index > 0) otherMatches.push(name);
	}
	return [...prefixMatches, ...otherMatches].slice(0, MAX_SUGGESTIONS);
}
