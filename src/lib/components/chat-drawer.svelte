<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import ChatPanel from '$lib/components/chat-panel.svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();
</script>

<Sheet.Root bind:open>
	<Sheet.Content
		side="right"
		showCloseButton={false}
		class="flex w-full flex-col gap-0 p-0 sm:max-w-md"
	>
		<ChatPanel variant="sheet" onClose={() => (open = false)} />
	</Sheet.Content>
</Sheet.Root>
