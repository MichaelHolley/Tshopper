<script lang="ts">
	import './layout.css';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href="/app-icon.svg" /></svelte:head>
{@render children()}
<Toaster />
