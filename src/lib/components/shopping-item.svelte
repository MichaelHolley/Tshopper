<script lang="ts">
	import * as ContextMenu from '$lib/components/ui/context-menu/index.js';
	import { checkItem, uncheckItem, deleteItem, moveItem } from '$lib/items.remote';
	import { toastError } from '$lib/toast';
	import type { ShoppingItem, Store } from '$lib/server/db/schema';
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

	let contextMenuOpen = $state(false);

	function toggle() {
		if (contextMenuOpen) return;

		if (!checked) checkItem(item.id).catch(toastError('Could not check item'));
		else uncheckItem(item.id).catch(toastError('Could not uncheck item'));
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ') return;

		event.preventDefault();
		toggle();
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
	<ContextMenu.Root bind:open={contextMenuOpen}>
		<ContextMenu.Trigger>
			{#snippet child({ props })}
				<div
					{...props}
					class="flex cursor-pointer items-center gap-3 border-b py-2.5 select-none"
					role="button"
					tabindex="0"
					onclick={toggle}
					onkeydown={handleKeydown}
				>
					{@render itemDetails()}
				</div>
			{/snippet}
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.Item onSelect={() => onEdit(item)}>
				<PencilIcon />
				Edit
			</ContextMenu.Item>
			<ContextMenu.Sub>
				<ContextMenu.SubTrigger>
					<StoreIcon />
					Move to
				</ContextMenu.SubTrigger>
				<ContextMenu.SubContent>
					{#if item.storeId !== null}
						<ContextMenu.Item
							onSelect={() =>
								moveItem({ id: item.id, targetStoreId: null }).catch(
									toastError('Could not move item')
								)}
						>
							Unassigned
						</ContextMenu.Item>
					{/if}
					{#each otherStores as store (store.id)}
						<ContextMenu.Item
							onSelect={() =>
								moveItem({ id: item.id, targetStoreId: store.id }).catch(
									toastError('Could not move item')
								)}
						>
							<span class="size-2.5 rounded-full" style={`background-color: ${store.color}`}></span>
							{store.name}
						</ContextMenu.Item>
					{/each}
					{#if otherStores.length === 0 && item.storeId === null}
						<ContextMenu.Item disabled>No other stores</ContextMenu.Item>
					{/if}
				</ContextMenu.SubContent>
			</ContextMenu.Sub>
			<ContextMenu.Separator />
			<ContextMenu.Item
				variant="destructive"
				onSelect={() => deleteItem(item.id).catch(toastError('Could not delete item'))}
			>
				<Trash2Icon />
				Delete
			</ContextMenu.Item>
		</ContextMenu.Content>
	</ContextMenu.Root>
{/if}
