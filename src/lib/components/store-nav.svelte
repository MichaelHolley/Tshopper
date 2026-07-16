<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Store } from '$lib/server/db/schema';
	import SettingsIcon from '@lucide/svelte/icons/settings-2';

	let {
		stores,
		activeStoreId = $bindable(null),
		onManage
	}: { stores: Store[]; activeStoreId?: string | null; onManage: () => void } = $props();
</script>

<div class="flex items-center gap-2">
	<div class="flex flex-1 gap-1.5 overflow-x-auto pb-1">
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
				<span class="size-2.5 rounded-full" style={`background-color: ${store.color}`}></span>
				{store.name}
			</Button>
		{/each}
	</div>
	<Button
		variant="ghost"
		size="icon"
		class="shrink-0"
		aria-label="Manage stores"
		onclick={onManage}
	>
		<SettingsIcon />
	</Button>
</div>
