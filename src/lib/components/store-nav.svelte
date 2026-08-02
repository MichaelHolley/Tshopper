<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { getPreferences } from '$lib/preferences.remote';
	import type { Store } from '$lib/server/db/schema';

	let {
		stores,
		activeStoreId = $bindable(null)
	}: { stores: Store[]; activeStoreId?: string | null } = $props();

	const preferencesQuery = getPreferences();
	const defaultStoreId = $derived(preferencesQuery.current?.defaultStoreId ?? null);

	type Entry = { id: string | null; name: string; color: string | null };

	const entries = $derived.by<Entry[]>(() => {
		const unassigned: Entry = { id: null, name: 'Unassigned', color: null };
		const rest: Entry[] = stores.map((s) => ({ id: s.id, name: s.name, color: s.color }));
		const ordered = [...rest, unassigned];
		const defaultIndex = ordered.findIndex((e) => e.id === defaultStoreId);
		if (defaultIndex > 0) ordered.unshift(...ordered.splice(defaultIndex, 1));
		return ordered;
	});
</script>

<div class="flex gap-1.5 overflow-x-auto pb-1">
	{#each entries as entry (entry.id)}
		<Button
			variant={activeStoreId === entry.id ? 'default' : 'outline'}
			size="sm"
			class="shrink-0"
			onclick={() => (activeStoreId = entry.id)}
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
