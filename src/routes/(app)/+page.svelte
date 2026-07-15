<script lang="ts">
	import { getItems, clearChecked } from '$lib/items.remote';
	import { getStores } from '$lib/stores.remote';
	import StoreNav from '$lib/components/store-nav.svelte';
	import ItemForm from '$lib/components/item-form.svelte';
	import ShoppingItem from '$lib/components/shopping-item.svelte';
	import ManageStoresDialog from '$lib/components/manage-stores-dialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import type { ShoppingItem as Item } from '$lib/server/db/schema';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import ShoppingCartIcon from '@lucide/svelte/icons/shopping-cart';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';

	const VISIBLE_CHECKED = 3;

	let activeStoreId = $state<string | null>(null);
	let editing = $state<Item | null>(null);
	let checkedCollapsed = $state(true);
	let manageOpen = $state(false);
	let deleteAllOpen = $state(false);

	function confirmClearChecked() {
		clearChecked(activeStoreId);
		deleteAllOpen = false;
	}

	const storesQuery = getStores();
	const itemsQuery = $derived(getItems(activeStoreId));

	const stores = $derived(storesQuery.current ?? []);
	const items = $derived(itemsQuery.current ?? []);
	const activeItems = $derived(items.filter((i) => i.checked === null));
	const checkedItems = $derived(items.filter((i) => i.checked !== null));
	const visibleChecked = $derived(
		checkedCollapsed ? checkedItems.slice(0, VISIBLE_CHECKED) : checkedItems
	);
	const activeStore = $derived(stores.find((s) => s.id === activeStoreId) ?? null);

	// If the active store is deleted (here or in another session), fall back to Unassigned.
	$effect(() => {
		if (
			activeStoreId !== null &&
			storesQuery.current !== undefined &&
			!stores.some((s) => s.id === activeStoreId)
		) {
			activeStoreId = null;
		}
	});
</script>

<svelte:head><title>Tshopper</title></svelte:head>

<StoreNav {stores} bind:activeStoreId onManage={() => (manageOpen = true)} />

<ItemForm storeId={activeStoreId} bind:editing />

{#if items.length === 0}
	<div class="text-muted-foreground flex flex-col items-center gap-3 py-16">
		{#if activeStore}
			<span class="size-10 rounded-full" style={`background-color: ${activeStore.color}`}></span>
		{:else}
			<ShoppingCartIcon class="size-10" />
		{/if}
		<p class="text-sm">
			No items in
			<span class="text-foreground font-semibold">{activeStore ? activeStore.name : 'Unassigned'}</span>
		</p>
		<p class="text-xs">Add one using the form above.</p>
	</div>
{:else}
	<ul>
		{#each activeItems as item (item.id)}
			<li><ShoppingItem {item} {stores} onEdit={(i) => (editing = i)} /></li>
		{/each}
		{#each visibleChecked as item (item.id)}
			<li><ShoppingItem {item} {stores} onEdit={(i) => (editing = i)} /></li>
		{/each}
	</ul>

	<div class="flex items-center justify-center gap-2">
		{#if checkedItems.length > VISIBLE_CHECKED}
			<Button variant="ghost" size="sm" onclick={() => (checkedCollapsed = !checkedCollapsed)}>
				{#if checkedCollapsed}<ChevronDownIcon />Show more{:else}<ChevronUpIcon />Show less{/if}
			</Button>
		{/if}
		{#if checkedItems.length > 0}
			<Button
				variant="ghost"
				size="sm"
				class="text-muted-foreground"
				onclick={() => (deleteAllOpen = true)}
			>
				<Trash2Icon />
				Clear checked
			</Button>
		{/if}
	</div>
{/if}

<ManageStoresDialog bind:open={manageOpen} {stores} />

<AlertDialog.Root bind:open={deleteAllOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Clear checked items?</AlertDialog.Title>
			<AlertDialog.Description>
				This permanently deletes all checked items in
				<span class="font-semibold">{activeStore ? activeStore.name : 'Unassigned'}</span>. This
				cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmClearChecked}>Clear</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
