<script lang="ts">
	import { logout } from '$lib/auth.remote';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import SettingsDialog from '$lib/components/settings-dialog.svelte';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import LogOutIcon from '@lucide/svelte/icons/log-out';

	let { children } = $props();

	let assistantOpen = $state(false);
	let settingsOpen = $state(false);
</script>

<div class="flex min-h-svh flex-col">
	<header class="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
		<div class="mx-auto flex h-14 w-full max-w-md items-center justify-between gap-2 px-4">
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

	<main class="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-4">
		{@render children()}
	</main>
</div>

<SettingsDialog bind:open={settingsOpen} />

<Sheet.Root bind:open={assistantOpen}>
	<Sheet.Content side="right" class="flex w-full flex-col gap-0 sm:max-w-md">
		<Sheet.Header>
			<Sheet.Title>Assistant</Sheet.Title>
			<Sheet.Description>Ask me to add, remove, or check off items.</Sheet.Description>
		</Sheet.Header>
		<Separator />
		<div class="text-muted-foreground flex flex-1 items-center justify-center p-6 text-sm">
			Chat assistant coming soon.
		</div>
	</Sheet.Content>
</Sheet.Root>
