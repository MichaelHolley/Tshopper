<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { getStores } from '$lib/stores.remote';
	import { getPreferences, setDefaultStore } from '$lib/preferences.remote';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ShoppingCartIcon from '@lucide/svelte/icons/shopping-cart';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const storesQuery = getStores();
	const preferencesQuery = getPreferences();

	const stores = $derived(storesQuery.current ?? []);
	const defaultStoreId = $derived(preferencesQuery.current?.defaultStoreId ?? null);
	const options = $derived([
		{ id: null, name: 'Unassigned', color: null },
		...stores.map((s) => ({
			id: s.id as string | null,
			name: s.name,
			color: s.color as string | null
		}))
	]);
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Settings</Dialog.Title>
			<Dialog.Description>Shared by everyone in the household.</Dialog.Description>
		</Dialog.Header>

		<section class="flex flex-col gap-1">
			<h3 class="text-sm font-medium">Default store</h3>
			<p class="text-muted-foreground pb-1 text-xs">The list Tshopper opens on.</p>

			<div role="radiogroup" aria-label="Default store" class="flex flex-col">
				{#each options as option (option.id ?? 'unassigned')}
					<button
						type="button"
						role="radio"
						aria-checked={defaultStoreId === option.id}
						class="hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-2 text-left"
						onclick={() => setDefaultStore(option.id)}
					>
						{#if option.color}
							<span class="size-3 shrink-0 rounded-full" style={`background-color: ${option.color}`}
							></span>
						{:else}
							<ShoppingCartIcon class="text-muted-foreground size-3 shrink-0" />
						{/if}
						<span class="flex-1 truncate">{option.name}</span>
						{#if defaultStoreId === option.id}
							<CheckIcon class="size-4 shrink-0" />
						{/if}
					</button>
				{/each}
			</div>
		</section>
	</Dialog.Content>
</Dialog.Root>
