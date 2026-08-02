<script lang="ts">
	import { login } from '$lib/auth.remote';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';

	let showPassword = $state(false);
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
				<div class="relative">
					<Input
						id="password"
						{...login.fields._password.as('password')}
						type={showPassword ? 'text' : 'password'}
						autocomplete="current-password"
						class="pr-9"
						autofocus
					/>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						class="absolute inset-y-0 right-0 h-full w-9 hover:bg-transparent"
						aria-label={showPassword ? 'Hide password' : 'Show password'}
						aria-pressed={showPassword}
						onclick={() => (showPassword = !showPassword)}
					>
						{#if showPassword}
							<EyeOffIcon class="text-muted-foreground size-4" />
						{:else}
							<EyeIcon class="text-muted-foreground size-4" />
						{/if}
					</Button>
				</div>
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
