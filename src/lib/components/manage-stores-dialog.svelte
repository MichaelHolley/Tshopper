<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { addStore, updateStore, deleteStore } from '$lib/stores.remote';
	import type { Store } from '$lib/server/db/schema';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';

	let { open = $bindable(false), stores }: { open?: boolean; stores: Store[] } = $props();

	const DEFAULT_COLOR = '#22c55e';

	let newName = $state('');
	let newColor = $state(DEFAULT_COLOR);
	let editingId = $state<string | null>(null);
	let editName = $state('');
	let editColor = $state(DEFAULT_COLOR);

	async function create(event: SubmitEvent) {
		event.preventDefault();
		if (!newName.trim()) return;
		await addStore({ name: newName, color: newColor });
		newName = '';
		newColor = DEFAULT_COLOR;
	}

	function startEdit(store: Store) {
		editingId = store.id;
		editName = store.name;
		editColor = store.color;
	}

	async function saveEdit() {
		if (!editName.trim() || !editingId) return;
		await updateStore({ id: editingId, name: editName, color: editColor });
		editingId = null;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Manage stores</Dialog.Title>
			<Dialog.Description>Deleting a store moves its items to Unassigned.</Dialog.Description>
		</Dialog.Header>

		<ul class="flex flex-col">
			{#each stores as store (store.id)}
				<li class="flex items-center gap-2 border-b py-2">
					{#if editingId === store.id}
						<input type="color" bind:value={editColor} class="size-8 shrink-0 rounded" />
						<Input bind:value={editName} class="h-8" autocomplete="off" />
						<Button size="icon" class="size-8 shrink-0" onclick={saveEdit}><CheckIcon /></Button>
						<Button
							variant="ghost"
							size="icon"
							class="size-8 shrink-0"
							onclick={() => (editingId = null)}
						>
							<XIcon />
						</Button>
					{:else}
						<span class="size-4 shrink-0 rounded-full" style={`background-color: ${store.color}`}
						></span>
						<span class="flex-1 truncate">{store.name}</span>
						<Button
							variant="ghost"
							size="icon"
							class="size-8 shrink-0"
							aria-label="Rename store"
							onclick={() => startEdit(store)}
						>
							<PencilIcon />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							class="text-destructive size-8 shrink-0"
							aria-label="Delete store"
							onclick={() => deleteStore(store.id)}
						>
							<Trash2Icon />
						</Button>
					{/if}
				</li>
			{:else}
				<li class="text-muted-foreground py-2 text-sm">No stores yet.</li>
			{/each}
		</ul>

		<form onsubmit={create} class="flex items-center gap-2 pt-2">
			<input type="color" bind:value={newColor} class="size-9 shrink-0 rounded" />
			<Input bind:value={newName} placeholder="New store name" autocomplete="off" />
			<Button type="submit" class="shrink-0" disabled={!newName.trim()}>Add</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
