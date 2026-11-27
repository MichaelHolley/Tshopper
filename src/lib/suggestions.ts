import { normalizeItemName } from './item-name';

const MAX_SUGGESTIONS = 8;

function normalizeSearchTerm(value: string): string {
	return value.normalize('NFC').replace(/ä|ae/g, 'a').replace(/ö|oe/g, 'o').replace(/ü|ue/g, 'u');
}

/** Prefix matches rank ahead of other substring matches; each group keeps the order of `names`. */
export function filterSuggestions(
	names: string[],
	input: string,
	excludeNames: string[]
): string[] {
	const query = normalizeItemName(input);
	if (!query) return [];

	const searchQuery = normalizeSearchTerm(query);
	const excluded = new Set(excludeNames.map(normalizeItemName));
	const prefixMatches: string[] = [];
	const otherMatches: string[] = [];
	for (const name of names) {
		const normalized = normalizeItemName(name);
		if (normalized === query || excluded.has(normalized)) continue;
		const index = normalizeSearchTerm(normalized).indexOf(searchQuery);
		if (index === 0) prefixMatches.push(name);
		else if (index > 0) otherMatches.push(name);
	}
	return [...prefixMatches, ...otherMatches].slice(0, MAX_SUGGESTIONS);
}
