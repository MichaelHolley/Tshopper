<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';

	let {
		message = 'Could not load this.',
		skeleton,
		children
	}: { message?: string; skeleton?: Snippet; children: Snippet } = $props();
</script>

<svelte:boundary>
	{@render children()}

	{#snippet pending()}
		{@render skeleton?.()}
	{/snippet}

	{#snippet failed(_error: unknown, reset: () => void)}
		<div class="text-muted-foreground flex flex-col items-center gap-3 py-8 text-sm">
			<p>{message}</p>
			<Button variant="outline" size="sm" onclick={reset}>
				<RefreshCwIcon />
				Try again
			</Button>
		</div>
	{/snippet}
</svelte:boundary>
