<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Store } from '$lib/server/db/schema';

	let {
		stores,
		activeStoreId = $bindable(null)
	}: { stores: Store[]; activeStoreId?: string | null } = $props();
</script>

<div class="flex gap-1.5 overflow-x-auto pb-1">
	<Button
		variant={activeStoreId === null ? 'default' : 'outline'}
		size="sm"
		class="shrink-0"
		onclick={() => (activeStoreId = null)}
	>
		Unassigned
	</Button>
	{#each stores as store (store.id)}
		<Button
			variant={activeStoreId === store.id ? 'default' : 'outline'}
			size="sm"
			class="shrink-0"
			onclick={() => (activeStoreId = store.id)}
		>
			<span
				aria-hidden="true"
				class="size-2.5 rounded-full"
				style={`background-color: ${store.color}`}
			></span>
			{store.name}
		</Button>
	{/each}
</div>
