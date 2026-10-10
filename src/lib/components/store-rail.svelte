<script lang="ts">
	import { getActiveStore } from '#lib/active-store.svelte.js';
	import { getItems } from '#lib/items.remote.js';
	import { getPreferences } from '#lib/preferences.remote.js';
	import { getStores } from '#lib/stores.remote.js';
	import { orderStoreEntries } from '#lib/store-entries.js';

	const activeStore = getActiveStore();

	// Kick all three queries off before awaiting any, so they load side by side.
	const storesQuery = getStores();
	const preferencesQuery = getPreferences();
	const itemsQuery = getItems();

	const entries = $derived(
		orderStoreEntries(await storesQuery, (await preferencesQuery).defaultStoreId)
	);
	const openItems = $derived((await itemsQuery).filter((i) => i.checked === null));
</script>

<nav aria-label="Stores" class="flex flex-col gap-0.5 p-3">
	<h2 class="text-muted-foreground px-2 pt-1 pb-2 text-xs font-medium">Stores</h2>
	{#each entries as entry (entry.id)}
		{@const active = activeStore.current === entry.id}
		{@const open = openItems.filter((i) => i.storeId === entry.id).length}
		<button
			type="button"
			aria-current={active ? 'true' : undefined}
			class={[
				'flex h-9 items-center gap-2.5 rounded-lg px-2 text-left text-sm transition-colors active:translate-y-px',
				active ? 'bg-muted ring-border font-semibold ring-1 ring-inset' : 'hover:bg-muted'
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
					class={['text-xs tabular-nums', active ? 'text-foreground' : 'text-muted-foreground']}
					aria-label={`${open} ${open === 1 ? 'item' : 'items'}`}
				>
					{open}
				</span>
			{/if}
		</button>
	{/each}
</nav>
