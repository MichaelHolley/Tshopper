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
			variant={active ? 'default' : 'outline'}
			size="sm"
			class="shrink-0"
			aria-current={active ? 'true' : undefined}
			onclick={() => (activeStore.current = entry.id)}
		>
			{#if entry.color}
				<span
					aria-hidden="true"
					class="size-2.5 rounded-full"
					style={`background-color: ${entry.color}`}
				></span>
			{/if}
			{entry.name}
		</Button>
	{/each}
</div>
