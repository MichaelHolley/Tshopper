<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { checkItem, uncheckItem, deleteItem, moveItem } from '$lib/items.remote';
	import type { ShoppingItem, Store } from '$lib/server/db/schema';
	import MoreVerticalIcon from '@lucide/svelte/icons/more-vertical';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import StoreIcon from '@lucide/svelte/icons/store';
	import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
	import { dragHandle } from 'svelte-dnd-action';

	let {
		item,
		stores,
		onEdit,
		sortMode = false
	}: {
		item: ShoppingItem;
		stores: Store[];
		onEdit: (item: ShoppingItem) => void;
		sortMode?: boolean;
	} = $props();

	const checked = $derived(item.checked !== null);
	const otherStores = $derived(stores.filter((s) => s.id !== item.storeId));

	function toggle() {
		if (!checked) checkItem(item.id);
		else uncheckItem(item.id);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ') return;

		event.preventDefault();
		toggle();
	}

	function stopRowToggle(event: Event, handler: unknown) {
		event.stopPropagation();

		if (typeof handler === 'function') handler(event);
	}
</script>

{#snippet itemDetails()}
	<div class="min-w-0 flex-1">
		<p class={['truncate leading-tight', checked && 'text-muted-foreground line-through']}>
			{item.item}
		</p>
		{#if item.quantity}
			<p class="text-muted-foreground truncate text-xs">{item.quantity}</p>
		{/if}
	</div>
{/snippet}

{#snippet itemActions()}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					onclick={(event) => stopRowToggle(event, props.onclick)}
					onkeydown={(event) => stopRowToggle(event, props.onkeydown)}
					variant="ghost"
					size="icon"
					class="size-8 shrink-0"
					aria-label="Item actions"
				>
					<MoreVerticalIcon />
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content
			align="end"
			onclick={(event) => event.stopPropagation()}
			onkeydown={(event) => event.stopPropagation()}
		>
			<DropdownMenu.Item onSelect={() => onEdit(item)}>
				<PencilIcon />
				Edit
			</DropdownMenu.Item>
			<DropdownMenu.Sub>
				<DropdownMenu.SubTrigger>
					<StoreIcon />
					Move to
				</DropdownMenu.SubTrigger>
				<DropdownMenu.SubContent>
					{#if item.storeId !== null}
						<DropdownMenu.Item onSelect={() => moveItem({ id: item.id, targetStoreId: null })}>
							Unassigned
						</DropdownMenu.Item>
					{/if}
					{#each otherStores as store (store.id)}
						<DropdownMenu.Item onSelect={() => moveItem({ id: item.id, targetStoreId: store.id })}>
							<span class="size-2.5 rounded-full" style={`background-color: ${store.color}`}></span>
							{store.name}
						</DropdownMenu.Item>
					{/each}
					{#if otherStores.length === 0 && item.storeId === null}
						<DropdownMenu.Item disabled>No other stores</DropdownMenu.Item>
					{/if}
				</DropdownMenu.SubContent>
			</DropdownMenu.Sub>
			<DropdownMenu.Separator />
			<DropdownMenu.Item variant="destructive" onSelect={() => deleteItem(item.id)}>
				<Trash2Icon />
				Delete
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/snippet}

{#if sortMode}
	<div class="flex items-center gap-3 border-b py-2.5">
		<div
			use:dragHandle
			role="button"
			tabindex="0"
			class="text-muted-foreground shrink-0 cursor-grab touch-none active:cursor-grabbing"
			aria-label={`Drag to reorder ${item.item}`}
		>
			<GripVerticalIcon class="size-5" />
		</div>
		{@render itemDetails()}
	</div>
{:else}
	<div
		class="flex cursor-pointer items-center gap-3 border-b py-2.5"
		role="button"
		tabindex="0"
		onclick={toggle}
		onkeydown={handleKeydown}
	>
		{@render itemDetails()}
		{@render itemActions()}
	</div>
{/if}
