/** `COLLATE NOCASE` only folds ASCII, so names are compared on this form instead. */
export function normalizeItemName(name: string): string {
	return name.trim().toLocaleLowerCase();
}
