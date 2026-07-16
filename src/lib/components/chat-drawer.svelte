<script lang="ts">
	import { Chat } from '@ai-sdk/svelte';
	import { DefaultChatTransport, getToolName, isToolUIPart } from 'ai';
	import * as Conversation from '$lib/components/ai-elements/conversation/index.js';
	import * as PromptInput from '$lib/components/ai-elements/prompt-input/index.js';
	import type { PromptInputMessage } from '$lib/components/ai-elements/prompt-input/index.js';
	import { Loader } from '$lib/components/ai-elements/loader/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { getActiveStore } from '$lib/active-store.svelte.js';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import WrenchIcon from '@lucide/svelte/icons/wrench';
	import CheckIcon from '@lucide/svelte/icons/check';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';

	const TOOL_LABELS: Record<string, string> = {
		list_items: 'Reading the list',
		add_item: 'Adding an item',
		update_item: 'Updating an item',
		set_item_checked: 'Checking an item off',
		remove_item: 'Removing an item',
		remove_items: 'Removing items',
		clear_checked: 'Clearing checked items'
	};

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const activeStore = getActiveStore();

	const chat = new Chat({
		transport: new DefaultChatTransport({ api: '/api/chat' })
	});

	// The tools are store-scoped server-side, so the active store has to ride along with each
	// request rather than being baked into the transport at construction.
	function handleSubmit(message: PromptInputMessage) {
		if (!message.text.trim()) return;
		chat.sendMessage({ text: message.text }, { body: { storeId: activeStore.current } });
	}

	const busy = $derived(chat.status === 'submitted' || chat.status === 'streaming');

	// A turn that is only tool calls so far has no text to show; keep the spinner up until
	// the model actually starts answering.
	const awaitingReply = $derived(
		busy && !chat.messages.at(-1)?.parts.some((p) => p.type === 'text' && p.text.length > 0)
	);
</script>

<Sheet.Root bind:open>
	<Sheet.Content side="right" class="flex w-full flex-col gap-0 p-0 sm:max-w-md">
		<!-- pr-12 keeps the clear-history button clear of the sheet's own close button -->
		<Sheet.Header class="flex-row items-start justify-between gap-2 space-y-0 pr-12">
			<div>
				<Sheet.Title>Assistant</Sheet.Title>
				<Sheet.Description>Ask me to add, remove, or check off items.</Sheet.Description>
			</div>
			{#if chat.messages.length > 0}
				<Button
					variant="ghost"
					size="icon"
					aria-label="Clear chat history"
					onclick={() => (chat.messages = [])}
				>
					<Trash2Icon />
				</Button>
			{/if}
		</Sheet.Header>
		<Separator />

		<Conversation.Root class="flex-1">
			<Conversation.Content class="gap-4">
				{#if chat.messages.length === 0}
					<Conversation.EmptyState
						title="No messages yet"
						description="Ask me to add, update, or remove items from your list."
					>
						{#snippet icon()}
							<SparklesIcon class="size-8" />
						{/snippet}
					</Conversation.EmptyState>
				{/if}

				{#each chat.messages as message (message.id)}
					{#each message.parts as part, i (i)}
						{#if part.type === 'text'}
							<div
								class={[
									'max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap',
									message.role === 'user'
										? 'bg-primary text-primary-foreground self-end'
										: 'bg-muted self-start'
								]}
							>
								{part.text}
							</div>
						{:else if isToolUIPart(part)}
							{@const name = getToolName(part)}
							<div class="text-muted-foreground flex items-center gap-2 self-start text-xs">
								{#if part.state === 'output-error'}
									<TriangleAlertIcon class="text-destructive size-3.5" />
								{:else if part.state === 'output-available'}
									<CheckIcon class="size-3.5 text-green-600" />
								{:else}
									<WrenchIcon class="size-3.5 animate-pulse" />
								{/if}
								{TOOL_LABELS[name] ?? name}
							</div>
						{/if}
					{/each}
				{/each}

				{#if awaitingReply}
					<div class="text-muted-foreground flex items-center gap-2 self-start text-xs">
						<Loader size={14} />
						Thinking…
					</div>
				{/if}

				{#if chat.error}
					<div class="text-destructive self-start text-xs">
						Something went wrong.
						<button class="underline" onclick={() => chat.regenerate()}>Retry</button>
					</div>
				{/if}
			</Conversation.Content>
			<Conversation.ScrollButton />
		</Conversation.Root>

		<div class="border-t p-4">
			<PromptInput.Root onSubmit={handleSubmit} class="w-full">
				<PromptInput.Body>
					<PromptInput.Textarea placeholder="Add milk and eggs…" />
				</PromptInput.Body>
				<PromptInput.Toolbar>
					<PromptInput.Tools />
					<PromptInput.Submit status={chat.status} onStop={() => chat.stop()} />
				</PromptInput.Toolbar>
			</PromptInput.Root>
		</div>
	</Sheet.Content>
</Sheet.Root>
