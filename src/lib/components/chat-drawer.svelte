<script lang="ts">
	import { Chat } from '@ai-sdk/svelte';
	import { DefaultChatTransport, getToolName, isFileUIPart, isToolUIPart } from 'ai';
	import * as Conversation from '$lib/components/ai-elements/conversation/index.js';
	import * as PromptInput from '$lib/components/ai-elements/prompt-input/index.js';
	import type {
		AttachmentError,
		PromptInputMessage
	} from '$lib/components/ai-elements/prompt-input/index.js';
	import { Loader } from '$lib/components/ai-elements/loader/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { getActiveStore } from '$lib/active-store.svelte.js';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import WrenchIcon from '@lucide/svelte/icons/wrench';
	import CheckIcon from '@lucide/svelte/icons/check';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import XIcon from '@lucide/svelte/icons/x';

	const TOOL_LABELS: Record<string, string> = {
		list_items: 'Reading the list',
		add_item: 'Adding an item',
		update_item: 'Updating an item',
		set_item_checked: 'Checking an item off',
		remove_items: 'Removing items',
		clear_checked: 'Clearing checked items',
		reorder_items: 'Reordering the list'
	};

	// Kept in sync with the server's own limit in /api/chat; this copy only buys a friendlier message.
	const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const activeStore = getActiveStore();

	const chat = new Chat({
		transport: new DefaultChatTransport({ api: '/api/chat' })
	});

	let attachmentError = $state<string | null>(null);

	// The library's own messages are file-generic and plural, which reads wrong for a one-image flow.
	function handleAttachmentError(err: AttachmentError) {
		attachmentError =
			err.code === 'accept'
				? 'Only image files can be attached.'
				: err.code === 'max_file_size'
					? 'Images must be smaller than 4 MB.'
					: 'Only one image can be attached.';
	}

	// The tools are store-scoped server-side, so the active store has to ride along with each
	// request rather than being baked into the transport at construction.
	function handleSubmit(message: PromptInputMessage) {
		attachmentError = null;

		const text = message.text.trim();
		const files = message.files;
		const body = { storeId: activeStore.current };

		// An image on its own is a valid prompt, but sending text: '' would add an empty text part.
		if (!text) {
			if (!files?.length) return;
			chat.sendMessage({ files }, { body });
			return;
		}

		chat.sendMessage({ text, files }, { body });
	}

	const busy = $derived(chat.status === 'submitted' || chat.status === 'streaming');

	// A turn that is only tool calls so far has no text to show; keep the spinner up until
	// the model actually starts answering.
	const awaitingReply = $derived(
		busy && !chat.messages.at(-1)?.parts.some((p) => p.type === 'text' && p.text.length > 0)
	);
</script>

<Sheet.Root bind:open>
	<Sheet.Content
		side="right"
		showCloseButton={false}
		class="flex w-full flex-col gap-0 p-0 sm:max-w-md"
	>
		<Sheet.Header class="flex-row items-center justify-between gap-2 space-y-0">
			<div>
				<Sheet.Title>Assistant</Sheet.Title>
				<Sheet.Description>Ask me to add, remove, or check off items.</Sheet.Description>
			</div>
			<div class="flex items-center gap-1">
				{#if chat.messages.length > 0}
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Clear chat history"
						onclick={() => (chat.messages = [])}
					>
						<Trash2Icon />
					</Button>
				{/if}
				<Sheet.Close>
					{#snippet child({ props })}
						<Button variant="ghost" size="icon-sm" aria-label="Close" {...props}>
							<XIcon />
						</Button>
					{/snippet}
				</Sheet.Close>
			</div>
		</Sheet.Header>
		<Separator />

		<Conversation.Root class="min-h-0 flex-1">
			<Conversation.Content class="min-h-0 flex-1 gap-4 overflow-y-auto">
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
						{:else if isFileUIPart(part) && part.mediaType.startsWith('image/')}
							<img
								src={part.url}
								alt={part.filename ?? 'Attached image'}
								class={[
									'max-h-64 max-w-[85%] rounded-lg border object-contain',
									message.role === 'user' ? 'self-end' : 'self-start'
								]}
							/>
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
			<!-- Attachment chips render tooltips, which throw without a provider in scope. -->
			<Tooltip.Provider>
				<PromptInput.Root
					onSubmit={handleSubmit}
					accept="image/*"
					multiple={false}
					maxFiles={1}
					maxFileSize={MAX_IMAGE_BYTES}
					onError={handleAttachmentError}
					onFileAdd={() => (attachmentError = null)}
					class="w-full"
				>
					<PromptInput.Body>
						<div class="attachment-list">
							<PromptInput.Attachments>
								{#snippet children(attachment)}
									<PromptInput.Attachment data={attachment} />
								{/snippet}
							</PromptInput.Attachments>
						</div>
						<PromptInput.Textarea placeholder="Add milk and eggs…" />
					</PromptInput.Body>
					<PromptInput.Toolbar>
						<PromptInput.Tools>
							<PromptInput.ActionMenu>
								<PromptInput.ActionMenuTrigger />
								<PromptInput.ActionMenuContent>
									<PromptInput.ActionAddAttachments label="Add an image" />
								</PromptInput.ActionMenuContent>
							</PromptInput.ActionMenu>
						</PromptInput.Tools>
						<PromptInput.Submit status={chat.status} onStop={() => chat.stop()} />
					</PromptInput.Toolbar>
				</PromptInput.Root>
			</Tooltip.Provider>
			{#if attachmentError}
				<p class="text-destructive mt-2 text-xs">{attachmentError}</p>
			{/if}
		</div>
	</Sheet.Content>
</Sheet.Root>

<style>
	/* The chip's remove button reveals on hover, which never resolves on touch. */
	.attachment-list :global(button[aria-label='Remove image']) {
		opacity: 1;
	}
</style>
