<script lang="ts">
	import { page } from '$app/state';

	const views = [
		{ href: '/', label: 'List' },
		{ href: '/basics', label: 'Basics' }
	] as const;
</script>

<nav aria-label="View" class="bg-muted inline-flex self-start rounded-lg p-0.5">
	{#each views as view (view.href)}
		{@const active = page.url.pathname === view.href}
		<a
			href={view.href}
			aria-current={active ? 'page' : undefined}
			class={[
				'rounded-md px-3 py-1 text-sm font-medium transition-colors',
				active
					? 'bg-background text-foreground shadow-sm'
					: 'text-muted-foreground hover:text-foreground'
			]}
		>
			{view.label}
		</a>
	{/each}
</nav>
