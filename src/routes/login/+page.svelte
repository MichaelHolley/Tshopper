<script lang="ts">
	import { login } from '$lib/auth.remote';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
</script>

<svelte:head><title>Sign in · Tshopper</title></svelte:head>

<main class="flex min-h-svh items-center justify-center p-4">
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title>Tshopper</Card.Title>
			<Card.Description>Enter the household password to continue.</Card.Description>
		</Card.Header>
		<form {...login}>
			<Card.Content class="space-y-2">
				<Label for="password">Password</Label>
				<Input
					id="password"
					{...login.fields._password.as('password')}
					autocomplete="current-password"
					autofocus
				/>
				{#if login.result?.error}
					<p class="text-destructive text-sm">{login.result.error}</p>
				{/if}
			</Card.Content>
			<Card.Footer class="mt-4">
				<Button type="submit" class="w-full">Sign in</Button>
			</Card.Footer>
		</form>
	</Card.Root>
</main>
