<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import QueryBoundary from '$lib/components/query-boundary.svelte';
	import { addStore, deleteStore, getStores, updateStore } from '$lib/stores.remote';
	import { getPreferences, setDefaultStore } from '$lib/preferences.remote';
	import { toast } from 'svelte-sonner';
	import { toastError } from '$lib/toast';
	import {
		disableProgressNotifications,
		enableProgressNotifications,
		getNotificationState,
		type NotificationState
	} from '$lib/notifications';
	import type { StoreEntry } from '$lib/store-entries';
	import type { Store } from '$lib/server/db/schema';
	import { onMount } from 'svelte';
	import CheckIcon from '@lucide/svelte/icons/check';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import ShoppingCartIcon from '@lucide/svelte/icons/shopping-cart';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import XIcon from '@lucide/svelte/icons/x';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const DEFAULT_COLOR = '#22c55e';

	// Awaited in the markup rather than the script: the dialog itself must stay mounted and
	// openable, so only the two data-backed sections suspend behind their boundaries.
	const storesQuery = getStores();
	const preferencesQuery = getPreferences();

	let newName = $state('');
	let newColor = $state(DEFAULT_COLOR);
	let editingId = $state<string | null>(null);
	let editName = $state('');
	let editColor = $state(DEFAULT_COLOR);
	let notificationState = $state<NotificationState>({ status: 'unsupported' });

	onMount(() => {
		notificationState = getNotificationState();
	});

	async function toggleNotifications() {
		try {
			notificationState =
				notificationState.status === 'granted' && notificationState.enabled
					? await disableProgressNotifications()
					: await enableProgressNotifications();
		} catch {
			toast.error('Could not change notification settings');
		}
	}

	function defaultStoreOptions(stores: Store[]): StoreEntry[] {
		return [
			{ id: null, name: 'Unassigned', color: null },
			...stores.map((s) => ({
				id: s.id as string | null,
				name: s.name,
				color: s.color as string | null
			}))
		];
	}

	async function create(event: SubmitEvent) {
		event.preventDefault();
		if (!newName.trim()) return;
		try {
			await addStore({ name: newName, color: newColor });
			newName = '';
			newColor = DEFAULT_COLOR;
		} catch {
			toast.error('Could not create store');
		}
	}

	function startEdit(store: Store) {
		editingId = store.id;
		editName = store.name;
		editColor = store.color;
	}

	async function saveEdit() {
		if (!editName.trim() || !editingId) return;
		try {
			await updateStore({ id: editingId, name: editName, color: editColor });
			editingId = null;
		} catch {
			toast.error('Could not save store');
		}
	}
</script>

{#snippet rowsSkeleton(count: number)}
	<div class="flex animate-pulse flex-col gap-2 py-2" aria-hidden="true">
		{#each { length: count }, i (i)}
			<div class="bg-muted h-8 rounded-md"></div>
		{/each}
	</div>
{/snippet}

{#snippet optionsSkeleton()}
	{@render rowsSkeleton(3)}
{/snippet}

{#snippet storesSkeleton()}
	{@render rowsSkeleton(2)}
{/snippet}

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Settings</Dialog.Title>
			<Dialog.Description>Shared by everyone in the household.</Dialog.Description>
		</Dialog.Header>

		<section class="flex flex-col gap-1">
			<h3 class="text-sm font-medium">Default store</h3>
			<p class="text-muted-foreground pb-1 text-xs">The list Tshopper opens on.</p>

			<QueryBoundary message="Could not load the default store." skeleton={optionsSkeleton}>
				{@const options = defaultStoreOptions(await storesQuery)}
				{@const defaultStoreId = (await preferencesQuery).defaultStoreId}
				<div role="radiogroup" aria-label="Default store" class="flex flex-col">
					{#each options as option (option.id ?? 'unassigned')}
						<button
							type="button"
							role="radio"
							aria-checked={defaultStoreId === option.id}
							class="hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-2 text-left"
							onclick={() =>
								setDefaultStore(option.id).catch(toastError('Could not set default store'))}
						>
							{#if option.color}
								<span
									aria-hidden="true"
									class="size-3 shrink-0 rounded-full"
									style={`background-color: ${option.color}`}
								></span>
							{:else}
								<ShoppingCartIcon
									aria-hidden="true"
									class="text-muted-foreground size-3 shrink-0"
								/>
							{/if}
							<span class="flex-1 truncate">{option.name}</span>
							{#if defaultStoreId === option.id}
								<CheckIcon aria-hidden="true" class="size-4 shrink-0" />
							{/if}
						</button>
					{/each}
				</div>
			</QueryBoundary>
		</section>

		<section class="flex flex-col gap-2 border-t pt-4">
			<div>
				<h3 class="text-sm font-medium">Shopping progress notifications</h3>
				<p class="text-muted-foreground text-xs">
					Shows the active list's checked-item count while Tshopper is running in the background.
					Updates pause if your device suspends the app.
				</p>
			</div>

			{#if notificationState.status === 'unsupported'}
				<p class="text-muted-foreground text-sm">
					Notifications are not available in this browser.
				</p>
			{:else if notificationState.status === 'denied'}
				<p class="text-muted-foreground text-sm">
					Notifications are blocked. Enable them in your browser or device settings.
				</p>
			{:else}
				<Button variant="outline" onclick={toggleNotifications}>
					{notificationState.enabled ? 'Disable notifications' : 'Enable notifications'}
				</Button>
			{/if}
		</section>

		<section class="flex flex-col gap-2 border-t pt-4">
			<div>
				<h3 class="text-sm font-medium">Stores</h3>
				<p class="text-muted-foreground text-xs">Deleting a store moves its items to Unassigned.</p>
			</div>

			<QueryBoundary message="Could not load stores." skeleton={storesSkeleton}>
				<ul class="flex flex-col">
					{#each await storesQuery as store (store.id)}
						<li class="flex items-center gap-2 border-b py-2">
							{#if editingId === store.id}
								<input
									type="color"
									bind:value={editColor}
									class="size-8 shrink-0 rounded"
									aria-label={`Color for ${store.name}`}
								/>
								<Input
									bind:value={editName}
									class="h-8"
									autocomplete="off"
									aria-label="Store name"
								/>
								<Button
									size="icon"
									class="size-8 shrink-0"
									aria-label="Save store changes"
									disabled={!editName.trim()}
									onclick={saveEdit}
								>
									<CheckIcon />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									class="size-8 shrink-0"
									aria-label="Cancel editing store"
									onclick={() => (editingId = null)}
								>
									<XIcon />
								</Button>
							{:else}
								<span
									aria-hidden="true"
									class="size-4 shrink-0 rounded-full"
									style={`background-color: ${store.color}`}
								></span>
								<span class="flex-1 truncate">{store.name}</span>
								<Button
									variant="ghost"
									size="icon"
									class="size-8 shrink-0"
									aria-label={`Edit ${store.name}`}
									onclick={() => startEdit(store)}
								>
									<PencilIcon />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									class="text-destructive size-8 shrink-0"
									aria-label={`Delete ${store.name}`}
									onclick={() => deleteStore(store.id).catch(toastError('Could not delete store'))}
								>
									<Trash2Icon />
								</Button>
							{/if}
						</li>
					{:else}
						<li class="text-muted-foreground py-2 text-sm">No stores yet.</li>
					{/each}
				</ul>
			</QueryBoundary>

			<form onsubmit={create} class="flex items-center gap-2 pt-1">
				<input
					type="color"
					bind:value={newColor}
					class="size-9 shrink-0 rounded"
					aria-label="New store color"
				/>
				<Input
					bind:value={newName}
					placeholder="New store name"
					autocomplete="off"
					aria-label="New store name"
				/>
				<Button type="submit" class="shrink-0" disabled={!newName.trim()}>Add</Button>
			</form>
		</section>
	</Dialog.Content>
</Dialog.Root>
