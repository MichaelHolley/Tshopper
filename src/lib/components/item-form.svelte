<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { addItem, updateItem } from '$lib/items.remote';
	import { toast } from 'svelte-sonner';
	import type { ShoppingItem } from '$lib/server/db/schema';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';

	let {
		storeId,
		editing = $bindable(null)
	}: { storeId: string | null; editing?: ShoppingItem | null } = $props();

	let item = $state('');
	let quantity = $state('');
	let pending = $state(false);
	let inputRef = $state<HTMLInputElement | null>(null);

	$effect(() => {
		item = editing?.item ?? '';
		quantity = editing?.quantity ?? '';
		if (editing) inputRef?.focus();
	});

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!item.trim() || pending) return;
		pending = true;
		try {
			if (editing) {
				await updateItem({ id: editing.id, item, quantity });
				editing = null;
			} else {
				await addItem({ item, quantity, storeId });
			}
			item = '';
			quantity = '';
			inputRef?.focus();
		} catch {
			toast.error(editing ? 'Could not save item' : 'Could not add item');
		} finally {
			pending = false;
		}
	}

	function cancel() {
		editing = null;
		item = '';
		quantity = '';
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.metaKey || event.ctrlKey || event.altKey) return;

		if (event.key === 'Escape' && editing) {
			event.preventDefault();
			cancel();
			return;
		}

		if (event.key !== '/') return;
		const target = event.target as HTMLElement | null;
		if (target?.isContentEditable) return;
		if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
		event.preventDefault();
		inputRef?.focus();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<form onsubmit={submit} class="composer" data-editing={editing ? true : undefined}>
	<div class="field">
		<input
			bind:this={inputRef}
			bind:value={item}
			placeholder="Add an item"
			autocomplete="off"
			aria-label={editing ? 'Edit item' : 'Add an item'}
		/>
		{#if !item}
			<kbd aria-hidden="true">/</kbd>
		{/if}
	</div>

	<div class="qty">
		<input bind:value={quantity} placeholder="Qty" autocomplete="off" aria-label="Quantity" />
	</div>

	<div class="actions">
		{#if editing}
			<Button
				type="button"
				variant="ghost"
				size="icon"
				class="size-10 shrink-0"
				aria-label="Cancel edit"
				onclick={cancel}
			>
				<XIcon />
			</Button>
		{/if}
		<Button
			type="submit"
			size="icon"
			class="size-10 shrink-0"
			aria-label={editing ? 'Save item' : 'Add item'}
			disabled={!item.trim() || pending}
		>
			{#if editing}<CheckIcon />{:else}<PlusIcon />{/if}
		</Button>
	</div>
</form>

<style>
	/**
	 * The list is a field of raised rows; the composer is the slot they come out of. It runs the
	 * inverse depth — pressed into the page, not lifted off it — because a drop shadow here would
	 * claim the overlay layer and a raised fill would make it read as one more item.
	 */
	.composer {
		display: flex;
		align-items: stretch;
		gap: 0.25rem;
		height: 3rem;
		padding: 0.25rem;
		border-radius: var(--radius-xl);
		background-color: color-mix(in oklab, var(--store-color) 14%, var(--row-raised));
		box-shadow:
			0 0 0 1px var(--store-selected),
			var(--row-settle);
		transition:
			background-color 260ms ease-out,
			box-shadow 200ms ease-out;
	}

	.composer:focus-within {
		box-shadow:
			0 0 0 1px var(--color-ring),
			0 0 0 4px color-mix(in oklch, var(--color-ring) 35%, transparent),
			var(--row-settle);
	}

	.composer[data-editing] {
		background-color: color-mix(in oklab, var(--color-ring) 12%, var(--row-raised));
		box-shadow:
			0 0 0 1px color-mix(in oklch, var(--color-ring) 55%, transparent),
			var(--row-settle);
	}

	.field {
		position: relative;
		display: flex;
		min-width: 0;
		flex: 1;
	}

	/* 0.25rem of composer padding plus 0.5rem here lands the name on the item rows' 0.75rem edge. */
	.field input {
		width: 100%;
		min-width: 0;
		padding: 0 2rem 0 0.5rem;
		border: 0;
		background: transparent;
		font-size: 1rem;
		font-weight: 500;
		color: var(--color-foreground);
		outline: none;
	}

	.qty {
		display: flex;
		width: 4.5rem;
		flex-shrink: 0;
		margin-block: 0.5rem;
		padding-left: 0.5rem;
		border-left: 1px solid var(--store-edge);
	}

	.qty input {
		width: 100%;
		min-width: 0;
		border: 0;
		background: transparent;
		font-size: 1rem;
		font-variant-numeric: tabular-nums;
		color: var(--color-foreground);
		outline: none;
	}

	.field input::placeholder,
	.qty input::placeholder {
		font-weight: 400;
		color: var(--color-muted-foreground);
	}

	kbd {
		position: absolute;
		top: 50%;
		right: 0.5rem;
		display: none;
		transform: translateY(-50%);
		padding: 0.125rem 0.4rem;
		border-radius: var(--radius-md);
		background-color: var(--store-quiet);
		font-family: inherit;
		font-size: 0.75rem;
		line-height: 1rem;
		color: var(--color-muted-foreground);
		pointer-events: none;
	}

	.actions {
		display: flex;
		flex-shrink: 0;
		gap: 0.25rem;
	}

	/* 16px until the layout is wide enough that iOS is no longer the target — below it, focus zooms. */
	@media (min-width: 48rem) {
		.field input,
		.qty input {
			font-size: 0.875rem;
		}
	}

	@media (min-width: 64rem) {
		kbd {
			display: block;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.composer {
			transition-duration: 1ms;
		}
	}
</style>
