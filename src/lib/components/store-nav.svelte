<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { getActiveStore } from '$lib/active-store.svelte.js';
	import { getPreferences } from '$lib/preferences.remote';
	import { getStores } from '$lib/stores.remote';
	import { orderStoreEntries } from '$lib/store-entries';

	let { class: className }: { class?: string } = $props();

	const activeStore = getActiveStore();

	// Kick both queries off before awaiting either, so they load side by side.
	const storesQuery = getStores();
	const preferencesQuery = getPreferences();

	const entries = $derived(
		orderStoreEntries(await storesQuery, (await preferencesQuery).defaultStoreId)
	);
</script>

<div class={['flex gap-1.5 overflow-x-auto pb-1', className]}>
	{#each entries as entry (entry.id)}
		{@const active = activeStore.current === entry.id}
		<Button
			variant="outline"
			size="sm"
			class={['shrink-0', active && 'bg-muted font-semibold']}
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
