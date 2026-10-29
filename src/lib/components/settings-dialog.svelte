<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import QueryBoundary from '#lib/components/query-boundary.svelte';
	import StoreSettings from '#lib/components/store-settings.svelte';
	import { theme, type ThemeMode } from '#lib/theme.svelte.js';
	import {
		disableProgressNotifications,
		enableProgressNotifications,
		getNotificationState,
		type NotificationState
	} from '#lib/notifications.js';
	import { RadioGroup } from 'bits-ui';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const themeModes: { value: ThemeMode; label: string; icon: typeof SunIcon }[] = [
		{ value: 'light', label: 'Light', icon: SunIcon },
		{ value: 'dark', label: 'Dark', icon: MoonIcon },
		{ value: 'system', label: 'System', icon: MonitorIcon }
	];

	let notificationState = $state<NotificationState>({ status: 'unsupported' });
	const notificationsOn = $derived(
		notificationState.status === 'granted' && notificationState.enabled
	);
	const notificationHint = $derived(
		notificationState.status === 'unsupported'
			? 'Not available in this browser.'
			: notificationState.status === 'denied'
				? 'Blocked. Allow notifications for Tshopper in your browser or device settings.'
				: 'Shows how many items are left while Tshopper runs in the background.'
	);

	onMount(() => {
		notificationState = getNotificationState();
	});

	async function setNotifications(on: boolean) {
		try {
			notificationState = on
				? await enableProgressNotifications()
				: await disableProgressNotifications();
		} catch {
			toast.error('Could not change notifications');
		}
	}
</script>

{#snippet storesSkeleton()}
	<div class="flex animate-pulse flex-col gap-px overflow-hidden rounded-lg" aria-hidden="true">
		{#each { length: 3 }, i (i)}
			<div class="bg-muted h-11"></div>
		{/each}
	</div>
{/snippet}

<Dialog.Root bind:open>
	<Dialog.Content
		class="flex max-h-[calc(100svh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
	>
		<Dialog.Header class="border-b px-5 pt-5 pb-4">
			<Dialog.Title class="text-base">Settings</Dialog.Title>
		</Dialog.Header>

		<div class="flex flex-col gap-8 overflow-y-auto px-5 pt-5 pb-6">
			<section aria-labelledby="settings-stores" class="flex flex-col gap-3">
				<div class="flex flex-col gap-0.5">
					<h3 id="settings-stores" class="font-semibold">Stores</h3>
					<p class="text-muted-foreground text-xs">Shared with everyone in your household.</p>
				</div>
				<QueryBoundary message="Could not load stores." skeleton={storesSkeleton}>
					<StoreSettings />
				</QueryBoundary>
			</section>

			<section aria-labelledby="settings-device" class="flex flex-col gap-3">
				<div class="flex flex-col gap-0.5">
					<h3 id="settings-device" class="font-semibold">This device</h3>
					<p class="text-muted-foreground text-xs">Only changes Tshopper here.</p>
				</div>

				<div class="flex flex-col divide-y">
					<div class="flex items-center justify-between gap-4 pb-3">
						<span id="settings-appearance">Appearance</span>
						<RadioGroup.Root
							value={theme.mode}
							onValueChange={(value) => theme.set(value as ThemeMode)}
							orientation="horizontal"
							aria-labelledby="settings-appearance"
							class="bg-muted flex rounded-lg p-0.5"
						>
							{#each themeModes as { value, label, icon: Icon } (value)}
								<RadioGroup.Item
									{value}
									class="text-muted-foreground hover:text-foreground data-[state=checked]:bg-background data-[state=checked]:text-foreground focus-visible:ring-ring/50 flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium outline-none focus-visible:ring-2 data-[state=checked]:shadow-xs"
								>
									<Icon aria-hidden="true" class="size-3.5" />
									{label}
								</RadioGroup.Item>
							{/each}
						</RadioGroup.Root>
					</div>

					<label class="flex items-start justify-between gap-4 pt-3">
						<span class="flex flex-col gap-0.5">
							<span>Shopping progress notifications</span>
							<span class="text-muted-foreground text-xs">{notificationHint}</span>
						</span>
						<Switch
							class="mt-0.5"
							disabled={notificationState.status === 'unsupported' ||
								notificationState.status === 'denied'}
							bind:checked={() => notificationsOn, setNotifications}
						/>
					</label>
				</div>
			</section>
		</div>
	</Dialog.Content>
</Dialog.Root>
