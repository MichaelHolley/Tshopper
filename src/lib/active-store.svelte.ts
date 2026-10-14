import { goto } from '$app/navigation';
import { page } from '$app/state';
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

/** Switches the active store; from the Basics view, lands on the store's items instead. */
export function selectStore(activeStore: ActiveStore, id: string | null) {
	activeStore.current = id;
	if (page.url.pathname !== '/') goto('/');
}
