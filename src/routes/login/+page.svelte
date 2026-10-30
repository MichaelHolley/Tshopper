<script lang="ts">
	import { login } from '#lib/auth.remote.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';

	let showPassword = $state(false);
</script>

<svelte:head><title>Sign in · Tshopper</title></svelte:head>

<main
	class="bg-secondary text-secondary-foreground flex min-h-svh items-center justify-center px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
>
	<div class="w-full max-w-sm">
		<h1 class="text-6xl leading-none font-extrabold tracking-tighter sm:text-7xl">Tshopper</h1>
		<p class="text-secondary-foreground/70 mt-3 text-lg">Your household's shopping list.</p>

		<form {...login} class="mt-12 flex flex-col gap-2">
			<Label for="password">Password</Label>
			<div class="relative">
				<Input
					id="password"
					{...login.fields._password.as('password')}
					type={showPassword ? 'text' : 'password'}
					autocomplete="current-password"
					class="border-secondary-foreground/25 text-secondary-foreground focus-visible:border-primary focus-visible:ring-primary/30 h-11 bg-black/15 pr-11 dark:bg-black/15"
					autofocus
				/>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class="text-secondary-foreground/60 hover:text-secondary-foreground absolute inset-y-0 right-0 h-full w-11 hover:bg-transparent dark:hover:bg-transparent"
					aria-label={showPassword ? 'Hide password' : 'Show password'}
					aria-pressed={showPassword}
					onclick={() => (showPassword = !showPassword)}
				>
					{#if showPassword}
						<EyeOffIcon />
					{:else}
						<EyeIcon />
					{/if}
				</Button>
			</div>
			{#if login.result?.error}
				<p class="text-sm font-medium text-red-300" role="alert">{login.result.error}</p>
			{/if}
			<Button type="submit" class="mt-4 h-11 w-full text-base font-semibold">Sign in</Button>
		</form>
	</div>
</main>
