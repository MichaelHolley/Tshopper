<script lang="ts">
	import { getActiveStore } from '$lib/active-store.svelte.js';
	import { getItemCounts } from '$lib/items.remote';
	import { getPreferences } from '$lib/preferences.remote';
	import { orderStoreEntries } from '$lib/store-entries';
	import type { Store } from '$lib/server/db/schema';

	let { stores }: { stores: Store[] } = $props();

	const activeStore = getActiveStore();
	const preferencesQuery = getPreferences();
	const countsQuery = getItemCounts();

	const entries = $derived(
		orderStoreEntries(stores, preferencesQuery.current?.defaultStoreId ?? null)
	);
	const counts = $derived(countsQuery.current ?? []);
</script>

<nav aria-label="Stores" class="flex flex-col gap-0.5 p-3">
	<h2 class="text-muted-foreground px-2 pt-1 pb-2 text-xs font-medium">Stores</h2>
	{#each entries as entry (entry.id)}
		{@const active = activeStore.current === entry.id}
		{@const open = counts.find((c) => c.storeId === entry.id)?.count ?? 0}
		<button
			type="button"
			aria-current={active ? 'true' : undefined}
			class={[
				'flex h-9 items-center gap-2.5 rounded-lg px-2 text-left text-sm transition-colors active:translate-y-px',
				active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
			]}
			onclick={() => (activeStore.current = entry.id)}
		>
			<span
				aria-hidden="true"
				class={[
					'size-2.5 shrink-0 rounded-full',
					!entry.color && 'border border-current opacity-40'
				]}
				style={entry.color ? `background-color: ${entry.color}` : undefined}
			></span>
			<span class="min-w-0 flex-1 truncate">{entry.name}</span>
			{#if open > 0}
				<span
					class={['text-xs tabular-nums', active ? 'opacity-70' : 'text-muted-foreground']}
					aria-label={`${open} ${open === 1 ? 'item' : 'items'}`}
				>
					{open}
				</span>
			{/if}
		</button>
	{/each}
</nav>
