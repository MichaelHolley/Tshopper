<script lang="ts">
	import { logout } from '#lib/auth.remote.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import SettingsDialog from '#lib/components/settings-dialog.svelte';
	import ChatDrawer from '#lib/components/chat-drawer.svelte';
	import ChatPanel from '#lib/components/chat-panel.svelte';
	import QueryBoundary from '#lib/components/query-boundary.svelte';
	import StoreNav from '#lib/components/store-nav.svelte';
	import ThemeToggle from '#lib/components/theme-toggle.svelte';
	import StoreRail from '#lib/components/store-rail.svelte';
	import ViewSwitch from '#lib/components/view-switch.svelte';
	import { setActiveStore } from '#lib/active-store.svelte.js';
	import { getItems } from '#lib/items.remote.js';
	import { getStores, refreshStoreData } from '#lib/stores.remote.js';
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

	// If the active store is deleted (here or in another session), fall back to Unassigned.
	$effect(() => {
		const stores = storesQuery.current;
		if (
			stores &&
			activeStore.current !== null &&
			!stores.some((s) => s.id === activeStore.current)
		) {
			activeStore.current = null;
		}
	});

	// A backgrounded/locked phone has its socket killed while frozen, but `navigator.onLine`
	// never flips, so SvelteKit's active recovery misses it. Reconnect the live list when the
	// tab returns to the foreground, and catch up on what other sessions changed meanwhile.
	function recoverQueries() {
		if (document.visibilityState !== 'visible') return;
		getItems().reconnect();
		refreshStoreData(activeStore.current).catch(() => {});
	}
</script>

<svelte:document onvisibilitychange={recoverQueries} />

{#snippet railSkeleton()}
	<div class="flex animate-pulse flex-col gap-1.5 p-3 pt-8" aria-hidden="true">
		{#each { length: 4 }, i (i)}
			<div class="bg-muted h-9 rounded-lg"></div>
		{/each}
	</div>
{/snippet}

{#snippet navSkeleton()}
	<div class="flex animate-pulse gap-1.5 pb-1 lg:hidden" aria-hidden="true">
		{#each { length: 3 }, i (i)}
			<div class="bg-muted h-8 w-24 shrink-0 rounded-md"></div>
		{/each}
	</div>
{/snippet}

{#snippet listSkeleton()}
	<div class="flex animate-pulse flex-col gap-2" aria-hidden="true">
		<div class="bg-muted h-12 rounded-xl"></div>
		{#each { length: 5 }, i (i)}
			<div class="bg-muted h-11 rounded-xl"></div>
		{/each}
	</div>
{/snippet}

<div class="flex min-h-svh flex-col lg:h-svh lg:overflow-hidden">
	<header
		class="bg-background/80 border-border sticky top-0 z-40 shrink-0 border-b pt-[env(safe-area-inset-top)] backdrop-blur lg:static"
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
				<ThemeToggle />
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
		<div class="border-border hidden w-56 shrink-0 overflow-y-auto border-r lg:block">
			<QueryBoundary message="Could not load stores." skeleton={railSkeleton}>
				<StoreRail />
			</QueryBoundary>
		</div>

		<main class="@container min-w-0 flex-1 lg:overflow-y-auto">
			<div
				class="gutter mx-auto flex w-full max-w-2xl flex-col gap-2 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] @3xl:max-w-6xl"
			>
				<ViewSwitch />
				<QueryBoundary message="Could not load stores." skeleton={navSkeleton}>
					<StoreNav class="lg:hidden" />
				</QueryBoundary>
				<QueryBoundary message="Could not load your list." skeleton={listSkeleton}>
					{@render children()}
				</QueryBoundary>
			</div>
		</main>

		{#if wide.current && assistantOpen}
			<aside class="border-border flex w-88 shrink-0 flex-col border-l">
				<ChatPanel variant="docked" onClose={() => (assistantOpen = false)} />
			</aside>
		{/if}
	</div>
</div>

<SettingsDialog bind:open={settingsOpen} />

{#if !wide.current}
	<ChatDrawer bind:open={assistantOpen} />
{/if}
