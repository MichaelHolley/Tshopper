<script lang="ts">
	import * as AlertDialog from '#lib/components/ui/alert-dialog/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { addStore, deleteStore, getStores, updateStore } from '#lib/stores.remote.js';
	import { getPreferences, setDefaultStore } from '#lib/preferences.remote.js';
	import { orderStoreEntries, type StoreEntry } from '#lib/store-entries.js';
	import { toastError } from '#lib/toast.js';
	import { toast } from 'svelte-sonner';
	import { RadioGroup } from 'bits-ui';
	import { flip } from 'svelte/animate';
	import { MediaQuery } from 'svelte/reactivity';
	import CheckIcon from '@lucide/svelte/icons/check';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import HouseIcon from '@lucide/svelte/icons/house';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';

	const SWATCHES = [
		{ name: 'Green', value: '#22c55e' },
		{ name: 'Teal', value: '#14b8a6' },
		{ name: 'Blue', value: '#3b82f6' },
		{ name: 'Violet', value: '#8b5cf6' },
		{ name: 'Pink', value: '#ec4899' },
		{ name: 'Red', value: '#ef4444' },
		{ name: 'Orange', value: '#f97316' },
		{ name: 'Yellow', value: '#eab308' }
	];
	const DEFAULT_COLOR = SWATCHES[0].value;

	// Hatching marks Unassigned as "no store" rather than a store with a grey brand color.
	const UNASSIGNED_STRIPE =
		'repeating-linear-gradient(135deg, var(--border) 0 3px, transparent 3px 6px)';

	const [stores, preferences] = $derived(await Promise.all([getStores(), getPreferences()]));
	const entries = $derived(orderStoreEntries(stores, preferences.defaultStoreId));

	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

	const isSwatch = (color: string) => SWATCHES.some((swatch) => swatch.value === color);

	type Draft = { id: string | null; name: string; color: string };

	let draft = $state<Draft | null>(null);
	let saving = $state(false);
	let deleteOpen = $state(false);
	// Kept after closing so the title doesn't blank out during the close animation.
	let deleteTarget = $state<StoreEntry | null>(null);

	function edit(entry: StoreEntry) {
		draft = { id: entry.id, name: entry.name, color: entry.color ?? DEFAULT_COLOR };
	}

	async function save(event: SubmitEvent) {
		event.preventDefault();
		if (!draft || !draft.name.trim()) return;
		const { id, name, color } = draft;
		saving = true;
		try {
			await (id === null ? addStore({ name, color }) : updateStore({ id, name, color }));
			draft = null;
		} catch {
			toast.error(id === null ? 'Could not add store' : 'Could not save store');
		} finally {
			saving = false;
		}
	}

	function askDelete(entry: StoreEntry) {
		deleteTarget = entry;
		deleteOpen = true;
	}

	function confirmDelete() {
		const id = deleteTarget?.id;
		if (!id) return;
		if (draft?.id === id) draft = null;
		deleteStore(id).catch(toastError('Could not delete store'));
	}
</script>

{#snippet editor(current: Draft)}
	<form onsubmit={save} class="flex flex-col gap-3 py-3 pr-3 pl-5">
		<Input
			bind:value={current.name}
			placeholder="Store name"
			autocomplete="off"
			aria-label="Store name"
			autofocus
		/>
		<div class="flex items-center gap-2">
			<RadioGroup.Root
				bind:value={current.color}
				aria-label="Store color"
				orientation="horizontal"
				class="flex flex-wrap items-center gap-1.5"
			>
				{#each SWATCHES as swatch (swatch.value)}
					<RadioGroup.Item
						value={swatch.value}
						aria-label={swatch.name}
						class="ring-offset-popover focus-visible:ring-ring data-[state=checked]:ring-foreground grid size-7 place-items-center rounded-full ring-offset-2 outline-none focus-visible:ring-2 data-[state=checked]:ring-2"
						style={`background-color: ${swatch.value}`}
					/>
				{/each}
			</RadioGroup.Root>
			<label
				class={[
					'ring-offset-popover has-focus-visible:ring-ring relative size-7 shrink-0 cursor-pointer rounded-full ring-offset-2 has-focus-visible:ring-2',
					!isSwatch(current.color) && 'ring-foreground ring-2'
				]}
				style={isSwatch(current.color)
					? 'background: conic-gradient(#ef4444, #eab308, #22c55e, #3b82f6, #8b5cf6, #ef4444)'
					: `background-color: ${current.color}`}
			>
				<input
					type="color"
					bind:value={current.color}
					class="absolute inset-0 size-full cursor-pointer opacity-0"
					aria-label="Custom color"
				/>
			</label>
		</div>
		<div class="flex justify-end gap-2">
			<Button type="button" variant="ghost" size="sm" onclick={() => (draft = null)}>Cancel</Button>
			<Button type="submit" size="sm" disabled={saving || !current.name.trim()}>
				{current.id === null ? 'Add store' : 'Save'}
			</Button>
		</div>
	</form>
{/snippet}

{#snippet stripe(color: string | null)}
	<span
		aria-hidden="true"
		class="absolute inset-y-0 left-0 w-1.5"
		style={color ? `background-color: ${color}` : `background: ${UNASSIGNED_STRIPE}`}
	></span>
{/snippet}

<ul class="bg-card divide-y overflow-hidden rounded-lg border">
	{#each entries as entry (entry.id)}
		{@const isDefault = entry.id === preferences.defaultStoreId}
		<li class="relative" animate:flip={{ duration: reducedMotion.current ? 0 : 180 }}>
			{#if draft && draft.id !== null && draft.id === entry.id}
				{@render stripe(draft.color)}
				{@render editor(draft)}
			{:else}
				{@render stripe(entry.color)}
				<div class="flex h-11 items-center gap-1 pr-1.5 pl-5">
					{#if entry.id === null}
						<span class="text-muted-foreground min-w-0 flex-1 truncate">{entry.name}</span>
					{:else}
						<button
							type="button"
							class="hover:text-foreground/80 min-w-0 flex-1 truncate py-2 text-left font-medium"
							aria-label={`Edit ${entry.name}`}
							onclick={() => edit(entry)}
						>
							{entry.name}
						</button>
					{/if}
					{#if isDefault}
						<span class="text-muted-foreground flex shrink-0 items-center gap-1 pr-1 text-xs">
							<HouseIcon aria-hidden="true" class="size-3.5" />
							Opens first
						</span>
					{/if}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Button
									{...props}
									variant="ghost"
									size="icon-sm"
									class="text-muted-foreground shrink-0"
									aria-label={`Options for ${entry.name}`}
								>
									<EllipsisIcon />
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end" class="min-w-44">
							<DropdownMenu.Item
								disabled={isDefault}
								onSelect={() =>
									setDefaultStore(entry.id).catch(toastError('Could not change the first store'))}
							>
								{#if isDefault}<CheckIcon />{:else}<HouseIcon />{/if}
								Open first
							</DropdownMenu.Item>
							{#if entry.id !== null}
								<DropdownMenu.Item onSelect={() => edit(entry)}>
									<PencilIcon />
									Edit
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item variant="destructive" onSelect={() => askDelete(entry)}>
									<Trash2Icon />
									Delete
								</DropdownMenu.Item>
							{/if}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			{/if}
		</li>
	{/each}
	<li class="relative">
		{#if draft && draft.id === null}
			{@render stripe(draft.color)}
			{@render editor(draft)}
		{:else}
			<button
				type="button"
				class="text-muted-foreground hover:text-foreground hover:bg-muted/50 flex h-11 w-full items-center gap-2 pl-5 text-left transition-colors"
				onclick={() => (draft = { id: null, name: '', color: DEFAULT_COLOR })}
			>
				<PlusIcon aria-hidden="true" class="size-4" />
				Add store
			</button>
		{/if}
	</li>
</ul>

<AlertDialog.Root bind:open={deleteOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete {deleteTarget?.name}?</AlertDialog.Title>
			<AlertDialog.Description>
				Items on its list move to Unassigned. Its basics and suggestions are deleted.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action variant="destructive" onclick={confirmDelete}>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
