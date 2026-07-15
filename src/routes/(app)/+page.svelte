<script lang="ts">
	import { logout } from '$lib/auth.remote';
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<svelte:head><title>Tshopper</title></svelte:head>

<main class="mx-auto flex min-h-svh max-w-md flex-col gap-4 p-4">
	<div class="flex items-center justify-between">
		<h1 class="text-xl font-semibold">Tshopper</h1>
		<form {...logout}>
			<Button type="submit" variant="outline" size="sm">Sign out</Button>
		</form>
	</div>
	<p class="text-muted-foreground text-sm">You're signed in. Shopping list coming next.</p>
</main>
