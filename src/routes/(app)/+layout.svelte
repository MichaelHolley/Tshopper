<script lang="ts">
	import { logout } from '$lib/auth.remote';
	import { Button } from '$lib/components/ui/button/index.js';
	import SettingsDialog from '$lib/components/settings-dialog.svelte';
	import ChatDrawer from '$lib/components/chat-drawer.svelte';
	import { setActiveStore } from '$lib/active-store.svelte.js';
	import { getItems } from '$lib/items.remote';
	import { getStores } from '$lib/stores.remote';
	import { getPreferences } from '$lib/preferences.remote';
	import { untrack } from 'svelte';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import LogOutIcon from '@lucide/svelte/icons/log-out';

	let { data, children } = $props();

	let assistantOpen = $state(false);
	let settingsOpen = $state(false);

	// Seeded once from the default-store preference; later preference edits must not yank the
	// list out from under someone who has since switched stores by hand.
	const activeStore = setActiveStore(untrack(() => data.defaultStoreId));

	// A backgrounded/locked phone has its socket killed while frozen, but `navigator.onLine`
	// never flips, so SvelteKit's active recovery misses it. Reconnect the live queries when the
	// tab returns to the foreground.
	function recoverLiveQueries() {
		if (document.visibilityState !== 'visible') return;
		getStores().reconnect();
		getItems(activeStore.current).reconnect();
		// Only active while the settings dialog is mounted; reconnecting it otherwise would open a
		// connection nothing consumes.
		if (settingsOpen) getPreferences().reconnect();
	}
</script>

<svelte:document onvisibilitychange={recoverLiveQueries} />

<div class="flex min-h-svh flex-col">
	<header class="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
		<div class="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-2 px-4">
			<a href="/" class="text-lg font-semibold tracking-tight">Tshopper</a>
			<div class="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon"
					aria-label="Open assistant"
					onclick={() => (assistantOpen = true)}
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

	<main class="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-2 px-4 py-4">
		{@render children()}
	</main>
</div>

<SettingsDialog bind:open={settingsOpen} />

<ChatDrawer bind:open={assistantOpen} />
