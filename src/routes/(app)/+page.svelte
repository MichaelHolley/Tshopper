<script lang="ts">
	import { getItems, clearChecked, reorderItems } from '$lib/items.remote';
	import { getStores } from '$lib/stores.remote';
	import StoreNav from '$lib/components/store-nav.svelte';
	import ItemForm from '$lib/components/item-form.svelte';
	import ShoppingItem from '$lib/components/shopping-item.svelte';
	import ManageStoresDialog from '$lib/components/manage-stores-dialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import type { ShoppingItem as Item } from '$lib/server/db/schema';
	import { dragHandleZone, type DndEvent } from 'svelte-dnd-action';
	import { getActiveStore } from '$lib/active-store.svelte.js';
	import { flip } from 'svelte/animate';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import ShoppingCartIcon from '@lucide/svelte/icons/shopping-cart';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down';

	const VISIBLE_CHECKED = 3;
	const FLIP_MS = 150;

	const activeStore = getActiveStore();

	let editing = $state<Item | null>(null);
	let checkedCollapsed = $state(true);
	let manageOpen = $state(false);
	let deleteAllOpen = $state(false);
	let sortMode = $state(false);
	let sortItems = $state<Item[]>([]);

	function confirmClearChecked() {
		clearChecked(activeStore.current);
		deleteAllOpen = false;
	}

	const storesQuery = getStores();
	const itemsQuery = $derived(getItems(activeStore.current));

	const stores = $derived(storesQuery.current ?? []);
	const items = $derived(itemsQuery.current ?? []);
	const activeItems = $derived(items.filter((i) => i.checked === null));
	const checkedItems = $derived(items.filter((i) => i.checked !== null));
	const visibleChecked = $derived(
		checkedCollapsed ? checkedItems.slice(0, VISIBLE_CHECKED) : checkedItems
	);
	const store = $derived(stores.find((s) => s.id === activeStore.current) ?? null);

	// Mirror the live unchecked list into a mutable copy the dndzone can reorder. Runs on
	// entering sort mode and whenever the live query changes (e.g. a remote reorder), but not
	// during a local drag — consider events only mutate `sortItems`, leaving `activeItems` alone.
	$effect(() => {
		if (sortMode) sortItems = activeItems;
	});

	function handleConsider(e: CustomEvent<DndEvent<Item>>) {
		sortItems = e.detail.items;
	}

	function handleFinalize(e: CustomEvent<DndEvent<Item>>) {
		sortItems = e.detail.items;
		reorderItems({ orderedIds: sortItems.map((i) => i.id), storeId: activeStore.current });
	}

	// Sorting is scoped to one store's unchecked list; switching stores leaves sort mode so the
	// drag target can't go stale.
	let sortedStoreId: string | null = null;
	$effect(() => {
		if (activeStore.current !== sortedStoreId) {
			sortedStoreId = activeStore.current;
			sortMode = false;
		}
	});

	// If the active store is deleted (here or in another session), fall back to Unassigned.
	$effect(() => {
		if (
			activeStore.current !== null &&
			storesQuery.current !== undefined &&
			!stores.some((s) => s.id === activeStore.current)
		) {
			activeStore.current = null;
		}
	});
</script>

<svelte:head><title>Tshopper</title></svelte:head>

<StoreNav {stores} bind:activeStoreId={activeStore.current} onManage={() => (manageOpen = true)} />

{#if sortMode}
	<div class="text-muted-foreground py-1 text-sm">Drag items by the handle to reorder.</div>
{:else}
	<ItemForm storeId={activeStore.current} bind:editing />
{/if}

{#if activeItems.length > 1}
	<div class="flex justify-end">
		<Button
			variant={sortMode ? 'default' : 'ghost'}
			size="sm"
			onclick={() => (sortMode = !sortMode)}
		>
			<ArrowUpDownIcon />
			{sortMode ? 'Done' : 'Reorder'}
		</Button>
	</div>
{/if}

{#if sortMode}
	<ul
		use:dragHandleZone={{
			items: sortItems,
			flipDurationMs: FLIP_MS,
			delayTouchStart: true,
			dropTargetStyle: {}
		}}
		onconsider={handleConsider}
		onfinalize={handleFinalize}
	>
		{#each sortItems as item (item.id)}
			<li animate:flip={{ duration: FLIP_MS }}>
				<ShoppingItem {item} {stores} sortMode onEdit={(i) => (editing = i)} />
			</li>
		{/each}
	</ul>
{:else if items.length === 0}
	<div class="text-muted-foreground flex flex-col items-center gap-3 py-16">
		{#if store}
			<span class="size-10 rounded-full" style={`background-color: ${store.color}`}></span>
		{:else}
			<ShoppingCartIcon class="size-10" />
		{/if}
		<p class="text-sm">
			No items in
			<span class="text-foreground font-semibold">{store ? store.name : 'Unassigned'}</span>
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
				<span class="font-semibold">{store ? store.name : 'Unassigned'}</span>. This cannot be
				undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmClearChecked}>Clear</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
