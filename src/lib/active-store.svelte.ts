import { getContext, setContext } from 'svelte';

const KEY = Symbol('active-store');

/**
 * The store the list view is currently scoped to. Lives in the layout because the
 * assistant drawer sits beside the list and its tools run against the same scope.
 */
export class ActiveStore {
	current = $state<string | null>(null);

	constructor(initial: string | null) {
		this.current = initial;
	}
}

export function setActiveStore(initial: string | null): ActiveStore {
	return setContext(KEY, new ActiveStore(initial));
}

export function getActiveStore(): ActiveStore {
	return getContext(KEY);
}
