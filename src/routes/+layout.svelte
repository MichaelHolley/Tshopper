<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href="/app-icon.svg" /></svelte:head>
{@render children()}
