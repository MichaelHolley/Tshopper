import { getContext, setContext } from 'svelte';

const KEY = Symbol('active-store');

type ActiveStore = { current: string | null };

/**
 * The store the list view is currently scoped to. Lives in the layout because the
 * assistant drawer sits beside the list and its tools run against the same scope.
 */
export function setActiveStore(initial: string | null): ActiveStore {
	const activeStore = $state({ current: initial });
	return setContext(KEY, activeStore);
}

export function getActiveStore(): ActiveStore {
	return getContext(KEY);
}
