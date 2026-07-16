<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { addItem, updateItem } from '$lib/items.remote';
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
		} finally {
			pending = false;
		}
	}

	function cancel() {
		editing = null;
		item = '';
		quantity = '';
	}
</script>

<form onsubmit={submit} class="flex gap-2">
	<Input bind:ref={inputRef} bind:value={item} placeholder="Add an item" autocomplete="off" />
	<Input bind:value={quantity} placeholder="Qty" class="w-20 shrink-0" autocomplete="off" />
	<Button type="submit" size="icon" class="shrink-0" disabled={!item.trim() || pending}>
		{#if editing}<CheckIcon />{:else}<PlusIcon />{/if}
	</Button>
	{#if editing}
		<Button type="button" variant="ghost" size="icon" class="shrink-0" onclick={cancel}>
			<XIcon />
		</Button>
	{/if}
</form>
