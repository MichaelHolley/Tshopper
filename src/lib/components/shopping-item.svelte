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
		<span class="name">{item.item}</span>
	</div>
	{#if item.quantity}
		<span class="quantity">{item.quantity}</span>
	{/if}
{/snippet}

{#if sortMode}
	<div class="row" data-dragging>
		<div
			use:dragHandle
			role="button"
			tabindex="0"
			class="text-muted-foreground -ml-1 shrink-0 cursor-grab touch-none active:cursor-grabbing"
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
					class="row"
					data-checked={checked || undefined}
					role="checkbox"
					aria-checked={checked}
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

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-height: 2.75rem;
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius-xl);
		background-color: var(--store-raised);
		box-shadow:
			var(--row-lift),
			0 0 0 1px var(--store-edge);
		cursor: pointer;
		user-select: none;
		transition:
			background-color 200ms ease-out,
			box-shadow 320ms cubic-bezier(0.16, 1, 0.3, 1),
			transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.row[data-dragging] {
		cursor: default;
	}

	.row:focus-visible {
		outline: none;
		box-shadow:
			var(--row-lift),
			0 0 0 1px var(--color-ring),
			0 0 0 4px color-mix(in oklch, var(--color-ring) 40%, transparent);
	}

	@media (hover: hover) {
		.row:hover:not([data-checked]) {
			background-color: var(--store-raised-hover);
			box-shadow:
				var(--row-lift-hover),
				0 0 0 1px var(--store-edge);
		}
	}

	.row:active:not([data-checked], [data-dragging]) {
		transform: translateY(1px);
		box-shadow:
			var(--row-press),
			0 0 0 1px var(--store-edge);
		transition-duration: 60ms;
	}

	.row[data-checked] {
		background-color: var(--row-sunk);
		box-shadow:
			var(--row-settle),
			0 0 0 1px transparent;
	}

	.name {
		position: relative;
		display: inline-block;
		max-width: 100%;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		vertical-align: bottom;
		font-weight: 500;
		line-height: 1.25;
		color: var(--color-foreground);
		transition:
			color 260ms ease-out,
			font-weight 260ms ease-out;
	}

	.name::after {
		content: '';
		position: absolute;
		left: 0;
		top: 55%;
		width: 100%;
		height: 1px;
		background-color: currentColor;
		transform: translateY(-50%) scaleX(0);
		transform-origin: left center;
		transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	[data-checked] .name {
		font-weight: 400;
		color: var(--color-muted-foreground);
	}

	[data-checked] .name::after {
		transform: translateY(-50%) scaleX(1);
	}

	.quantity {
		flex-shrink: 0;
		padding: 0.125rem 0.4rem;
		border-radius: var(--radius-md);
		background-color: var(--store-quiet);
		font-size: 0.75rem;
		font-weight: 500;
		line-height: 1rem;
		font-variant-numeric: tabular-nums;
		color: var(--color-foreground);
		transition:
			background-color 260ms ease-out,
			color 260ms ease-out;
	}

	[data-checked] .quantity {
		background-color: transparent;
		color: var(--color-muted-foreground);
	}

	@media (prefers-reduced-motion: reduce) {
		.row,
		.name,
		.name::after {
			transition-duration: 1ms;
		}

		.row:active:not([data-checked], [data-dragging]) {
			transform: none;
		}
	}
</style>
