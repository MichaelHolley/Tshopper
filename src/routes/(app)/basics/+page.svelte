<script lang="ts">
	import { addBasicItem, deleteBasicItem, getBasicItems } from '#lib/basic-items.remote.js';
	import { addItem, getItems } from '#lib/items.remote.js';
	import { getStores } from '#lib/stores.remote.js';
	import { getActiveStore } from '#lib/active-store.svelte.js';
	import { normalizeItemName } from '#lib/item-name.js';
	import { toastError } from '#lib/toast.js';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ListChecksIcon from '@lucide/svelte/icons/list-checks';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import StoreIcon from '@lucide/svelte/icons/store';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { SvelteSet } from 'svelte/reactivity';

	const activeStore = getActiveStore();

	let name = $state('');
	let pending = $state(false);

	const stores = $derived(await getStores());
	const store = $derived(stores.find((s) => s.id === activeStore.current) ?? null);
	const items = $derived(store ? await getBasicItems(store.id) : []);
	const openNames = $derived(
		new Set(
			(store ? await getItems(store.id) : [])
				.filter((i) => i.checked === null)
				.map((i) => normalizeItemName(i.item))
		)
	);
	const adding = new SvelteSet<string>();
	const duplicate = $derived(
		name.trim() !== '' && items.some((i) => i.normalizedName === normalizeItemName(name))
	);

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!store || !name.trim() || duplicate || pending) return;
		pending = true;
		try {
			await addBasicItem({ storeId: store.id, name });
			name = '';
		} catch {
			toast.error('Could not add basic item');
		} finally {
			pending = false;
		}
	}

	async function addToList(storeId: string, item: { id: string; name: string }) {
		adding.add(item.id);
		try {
			await addItem({ item: item.name, quantity: '', storeId });
		} catch {
			toast.error('Could not add item to list');
		} finally {
			adding.delete(item.id);
		}
	}
</script>

<svelte:head><title>Basics · Tshopper</title></svelte:head>

{#if !store}
	<div class="text-muted-foreground flex flex-col items-center gap-3 py-16">
		<StoreIcon class="size-10" />
		<p class="text-sm">Basic items belong to a store — pick one.</p>
	</div>
{:else}
	<form onsubmit={submit} class="flex flex-col gap-1">
		<div class="flex gap-2">
			<Input
				bind:value={name}
				placeholder={`Add a basic item to ${store.name}`}
				autocomplete="off"
				aria-label="Basic item name"
				aria-invalid={duplicate || undefined}
				aria-describedby={duplicate ? 'basic-duplicate' : undefined}
				class="h-10"
			/>
			<Button type="submit" class="h-10" disabled={!name.trim() || duplicate || pending}>
				<PlusIcon />
				Add
			</Button>
		</div>
		{#if duplicate}
			<p id="basic-duplicate" class="text-muted-foreground px-1 text-xs">
				Already in {store.name}'s basics.
			</p>
		{/if}
	</form>

	{#if items.length === 0}
		<div class="text-muted-foreground flex flex-col items-center gap-3 py-16">
			<span class="size-10 rounded-full" style={`background-color: ${store.color}`}></span>
			<p class="text-sm">
				No basic items in
				<span class="text-foreground font-semibold">{store.name}</span>
			</p>
			<p class="text-xs">Add the things you buy here regularly.</p>
		</div>
	{:else}
		<div class="border-border text-muted-foreground flex items-center gap-2 border-b py-2">
			<ListChecksIcon class="size-4" />
			<span class="text-sm font-semibold">
				{items.length}
				{items.length === 1 ? 'basic item' : 'basic items'}
			</span>
		</div>
		<ul class="mt-3 @3xl:columns-[22rem] @3xl:gap-x-6">
			{#each items as item (item.id)}
				{@const onList = openNames.has(item.normalizedName)}
				<li
					class="mb-2 flex min-h-11 break-inside-avoid items-center gap-3 rounded-xl bg-(--row-raised) py-1 pr-1 pl-3 shadow-[0_0_0_1px_var(--color-border)]"
				>
					<span class="min-w-0 flex-1 truncate font-medium">{item.name}</span>
					{#if onList}
						<span class="text-muted-foreground flex shrink-0 items-center gap-1 px-2 text-xs">
							<CheckIcon class="size-3.5" />
							On list
						</span>
					{:else}
						<Button
							variant="outline"
							size="sm"
							class="shrink-0"
							aria-label={`Add ${item.name} to the ${store.name} list`}
							disabled={adding.has(item.id)}
							onclick={() => addToList(store.id, item)}
						>
							<PlusIcon />
							List
						</Button>
					{/if}
					<Button
						variant="ghost"
						size="icon"
						class="text-muted-foreground shrink-0"
						aria-label={`Delete ${item.name}`}
						onclick={() =>
							deleteBasicItem(item.id).catch(toastError('Could not delete basic item'))}
					>
						<Trash2Icon />
					</Button>
				</li>
			{/each}
		</ul>
	{/if}
{/if}
