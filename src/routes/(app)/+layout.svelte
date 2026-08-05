<script lang="ts">
	import { logout } from '$lib/auth.remote';
	import { Button } from '$lib/components/ui/button/index.js';
	import SettingsDialog from '$lib/components/settings-dialog.svelte';
	import ChatDrawer from '$lib/components/chat-drawer.svelte';
	import ChatPanel from '$lib/components/chat-panel.svelte';
	import StoreNav from '$lib/components/store-nav.svelte';
	import StoreRail from '$lib/components/store-rail.svelte';
	import { setActiveStore } from '$lib/active-store.svelte.js';
	import { getItems, getItemCounts } from '$lib/items.remote';
	import { getStores } from '$lib/stores.remote';
	import { getPreferences } from '$lib/preferences.remote';
	import { untrack } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import LogOutIcon from '@lucide/svelte/icons/log-out';

	let { data, children } = $props();

	let assistantOpen = $state(false);
	let settingsOpen = $state(false);

	const wide = new MediaQuery('(min-width: 80rem)');

	// Seeded once from the default-store preference; later preference edits must not yank the
	// list out from under someone who has since switched stores by hand.
	const activeStore = setActiveStore(untrack(() => data.defaultStoreId));

	const storesQuery = getStores();
	const stores = $derived(storesQuery.current ?? []);
	const storeColor = $derived(stores.find((s) => s.id === activeStore.current)?.color);

	// A backgrounded/locked phone has its socket killed while frozen, but `navigator.onLine`
	// never flips, so SvelteKit's active recovery misses it. Reconnect the live queries when the
	// tab returns to the foreground.
	function recoverLiveQueries() {
		if (document.visibilityState !== 'visible') return;
		getStores().reconnect();
		getItems(activeStore.current).reconnect();
		getItemCounts().reconnect();
		// Only active while the settings dialog is mounted; reconnecting it otherwise would open a
		// connection nothing consumes.
		if (settingsOpen) getPreferences().reconnect();
	}
</script>

<svelte:document onvisibilitychange={recoverLiveQueries} />

<div
	class="app-shell flex min-h-svh flex-col lg:h-svh lg:overflow-hidden"
	style={storeColor ? `--store-color: ${storeColor}` : undefined}
>
	<header
		class="sticky top-0 z-40 shrink-0 border-b pt-[env(safe-area-inset-top)] backdrop-blur lg:static"
		style="background-color: color-mix(in oklab, var(--store-canvas) 82%, transparent); border-color: var(--store-edge)"
	>
		<div
			class="gutter mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-2 lg:mx-0 lg:max-w-none"
		>
			<a href="/" class="text-lg font-semibold tracking-tight">Tshopper</a>
			<div class="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon"
					aria-label="Toggle assistant"
					aria-pressed={assistantOpen}
					onclick={() => (assistantOpen = !assistantOpen)}
				>
					<SparklesIcon />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					aria-label="Open settings"
					onclick={() => (settingsOpen = true)}
				>
					<SettingsIcon />
				</Button>
				<form {...logout}>
					<Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
						<LogOutIcon />
					</Button>
				</form>
			</div>
		</div>
	</header>

	<div class="flex min-h-0 flex-1">
		<div
			class="hidden w-56 shrink-0 overflow-y-auto border-r lg:block"
			style="border-color: var(--store-edge)"
		>
			<StoreRail {stores} />
		</div>

		<main class="@container min-w-0 flex-1 lg:overflow-y-auto">
			<div
				class="gutter mx-auto flex w-full max-w-2xl flex-col gap-2 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] @3xl:max-w-6xl"
			>
				<StoreNav {stores} class="lg:hidden" />
				{@render children()}
			</div>
		</main>

		{#if wide.current && assistantOpen}
			<aside class="flex w-88 shrink-0 flex-col border-l">
				<ChatPanel variant="docked" onClose={() => (assistantOpen = false)} />
			</aside>
		{/if}
	</div>
</div>

<SettingsDialog bind:open={settingsOpen} />

{#if !wide.current}
	<ChatDrawer bind:open={assistantOpen} />
{/if}
