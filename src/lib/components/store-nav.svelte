<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { getActiveStore } from '$lib/active-store.svelte.js';
	import { getPreferences } from '$lib/preferences.remote';
	import { orderStoreEntries } from '$lib/store-entries';
	import type { Store } from '$lib/server/db/schema';

	let { stores, class: className }: { stores: Store[]; class?: string } = $props();

	const activeStore = getActiveStore();
	const preferencesQuery = getPreferences();
	const entries = $derived(
		orderStoreEntries(stores, preferencesQuery.current?.defaultStoreId ?? null)
	);
</script>

<div class={['flex gap-1.5 overflow-x-auto pb-1', className]}>
	{#each entries as entry (entry.id)}
		{@const active = activeStore.current === entry.id}
		<Button
			variant="outline"
			size="sm"
			class={['shrink-0', active && 'font-semibold']}
			style={active
				? 'background-color: var(--store-selected); border-color: var(--store-edge)'
				: undefined}
			aria-current={active ? 'true' : undefined}
			onclick={() => (activeStore.current = entry.id)}
		>
			<span
				aria-hidden="true"
				class={['size-2.5 rounded-full', !entry.color && 'border border-current opacity-40']}
				style={entry.color ? `background-color: ${entry.color}` : undefined}
			></span>
			{entry.name}
		</Button>
	{/each}
</div>
