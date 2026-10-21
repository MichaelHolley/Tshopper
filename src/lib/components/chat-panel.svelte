<script lang="ts">
	import { getToolName, isFileUIPart, isToolUIPart, type ToolUIPart } from 'ai';
	import * as MessageScroller from '#lib/components/ui/message-scroller/index.js';
	import * as Message from '#lib/components/ui/message/index.js';
	import * as Bubble from '#lib/components/ui/bubble/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import * as Trace from '#lib/components/ui/trace/index.js';
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import * as Attachment from '#lib/components/ui/attachment/index.js';
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { getActiveStore } from '#lib/active-store.svelte.js';
	import { getChat } from '#lib/assistant.svelte.js';
	import { refreshStoreData } from '#lib/stores.remote.js';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import WrenchIcon from '@lucide/svelte/icons/wrench';
	import CheckIcon from '@lucide/svelte/icons/check';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import XIcon from '@lucide/svelte/icons/x';
	import PaperclipIcon from '@lucide/svelte/icons/paperclip';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import SquareIcon from '@lucide/svelte/icons/square';

	const TOOL_LABELS: Record<string, string> = {
		list_items: 'Reading the list',
		add_items: 'Adding to the list',
		update_item: 'Updating an item',
		set_item_checked: 'Checking an item off',
		remove_items: 'Removing items',
		clear_checked: 'Clearing checked items',
		reorder_items: 'Reordering the list'
	};

	// Kept in sync with the server's own limit in /api/chat;
	const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

	let { variant, onClose }: { variant: 'sheet' | 'docked'; onClose: () => void } = $props();

	const activeStore = getActiveStore();
	const chat = getChat();

	let text = $state('');
	let image = $state<File | null>(null);
	let attachmentError = $state<string | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);

	const imagePreview = $derived(image ? URL.createObjectURL(image) : null);

	$effect(() => {
		const url = imagePreview;
		return () => {
			if (url) URL.revokeObjectURL(url);
		};
	});

	// The tools are store-scoped server-side, so the active store has to ride along with each
	// request rather than being baked into the transport at construction.
	async function request(run: (options: { body: { storeId: string | null } }) => Promise<void>) {
		const storeId = activeStore.current;
		await run({ body: { storeId } });
		// The assistant writes through /api/chat rather than a command, so nothing else refreshes
		// the suggestions it just added to.
		refreshStoreData(storeId).catch(() => {});
	}

	const send = (message: Parameters<typeof chat.sendMessage>[0]) =>
		request((options) => chat.sendMessage(message, options));

	const retry = () => request((options) => chat.regenerate(options));

	const busy = $derived(chat.status === 'submitted' || chat.status === 'streaming');
	const canSend = $derived(text.trim().length > 0 || image !== null);

	function handleFileChange(event: Event & { currentTarget: HTMLInputElement }) {
		const picked = event.currentTarget.files?.[0];
		event.currentTarget.value = '';
		if (!picked) return;

		if (image) {
			attachmentError = 'Only one image can be attached.';
		} else if (!picked.type.startsWith('image/')) {
			attachmentError = 'Only image files can be attached.';
		} else if (picked.size > MAX_IMAGE_BYTES) {
			attachmentError = 'Images must be smaller than 4 MB.';
		} else {
			attachmentError = null;
			image = picked;
		}
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;

		const trimmed = text.trim();
		let files: FileList | undefined;
		if (image) {
			// sendMessage takes a FileList, which can only be built through DataTransfer.
			const transfer = new DataTransfer();
			transfer.items.add(image);
			files = transfer.files;
		}

		// An image on its own is a valid prompt, but sending text: '' would add an empty text part.
		const message = trimmed ? { text: trimmed, files } : files ? { files } : null;
		if (!message) return;

		text = '';
		image = null;
		attachmentError = null;
		void send(message);
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) {
		if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
			event.preventDefault();
			event.currentTarget.form?.requestSubmit();
		}
	}

	const SUGGESTIONS = [
		{
			label: 'Sort by supermarket aisle',
			prompt:
				'Reorder the list so items appear in the order you would find them walking through a typical German supermarket.'
		}
	];

	function sendSuggestion(prompt: string) {
		attachmentError = null;
		void send({ text: prompt });
	}

	function toolStatus(part: Pick<ToolUIPart, 'state'>): Trace.TraceLineStatus | undefined {
		if (part.state === 'output-available') return undefined;
		if (part.state === 'output-error' || part.state === 'output-denied') return 'error';
		return busy ? 'running' : 'error';
	}

	// A turn that is only tool calls so far has no text to show; keep the spinner up until
	// the model actually starts answering.
	const awaitingReply = $derived(
		busy && !chat.messages.at(-1)?.parts.some((p) => p.type === 'text' && p.text.length > 0)
	);

	const DESCRIPTION = 'Ask me to add, remove, or check off items.';
</script>

<div class="bg-card flex min-h-0 flex-1 flex-col">
	<div class="flex flex-row items-start justify-between gap-2 p-4">
		<div class="flex flex-col gap-0.5">
			{#if variant === 'sheet'}
				<Sheet.Title>Assistant</Sheet.Title>
				<Sheet.Description>{DESCRIPTION}</Sheet.Description>
			{:else}
				<h2 class="text-foreground text-base font-medium">Assistant</h2>
				<p class="text-muted-foreground text-sm">{DESCRIPTION}</p>
			{/if}
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
			<Button variant="ghost" size="icon-sm" aria-label="Close assistant" onclick={onClose}>
				<XIcon />
			</Button>
		</div>
	</div>
	<Separator />

	<MessageScroller.Provider autoScroll>
		<MessageScroller.Root class="min-h-0 flex-1">
			<MessageScroller.Viewport>
				<MessageScroller.Content class="gap-4 p-4" role="log" aria-live="polite" aria-busy={busy}>
					{#if chat.messages.length === 0}
						<Empty.Root class="flex-1">
							<Empty.Header>
								<Empty.Media variant="icon">
									<SparklesIcon />
								</Empty.Media>
								<Empty.Title>No messages yet</Empty.Title>
								<Empty.Description>
									Ask me to add, update, or remove items from your list.
								</Empty.Description>
							</Empty.Header>
							<Empty.Content class="flex-row flex-wrap justify-center">
								{#each SUGGESTIONS as { label, prompt } (prompt)}
									<Button variant="outline" size="sm" onclick={() => sendSuggestion(prompt)}>
										{label}
									</Button>
								{/each}
							</Empty.Content>
						</Empty.Root>
					{/if}

					{#each chat.messages as message (message.id)}
						{@const isUser = message.role === 'user'}
						<MessageScroller.Item messageId={message.id} scrollAnchor={isUser}>
							<Message.Root align={isUser ? 'end' : 'start'}>
								<Message.Content>
									{#each message.parts as part, i (i)}
										{#if part.type === 'text'}
											<Bubble.Root
												align={isUser ? 'end' : 'start'}
												variant={isUser ? 'default' : 'muted'}
											>
												<Bubble.Content class="whitespace-pre-wrap">{part.text}</Bubble.Content>
											</Bubble.Root>
										{:else if isFileUIPart(part) && part.mediaType.startsWith('image/')}
											<img
												src={part.url}
												alt={part.filename ?? 'Attached image'}
												class="max-h-64 max-w-[80%] rounded-xl border object-contain"
											/>
										{:else if isToolUIPart(part)}
											{@const name = getToolName(part)}
											{@const status = toolStatus(part)}
											<Trace.Line {status}>
												<Trace.Icon>
													{#if status === 'error'}
														<TriangleAlertIcon />
													{:else if status === 'running'}
														<WrenchIcon />
													{:else}
														<CheckIcon class="text-primary" />
													{/if}
												</Trace.Icon>
												<Trace.Title>{TOOL_LABELS[name] ?? name}</Trace.Title>
											</Trace.Line>
										{/if}
									{/each}
								</Message.Content>
							</Message.Root>
						</MessageScroller.Item>
					{/each}

					{#if awaitingReply}
						<div class="text-muted-foreground flex items-center gap-2 text-sm">
							<Spinner aria-hidden="true" />
							Thinking…
						</div>
					{/if}

					{#if chat.error}
						<div class="text-destructive flex items-center gap-2 text-sm">
							Something went wrong.
							<Button variant="link" size="xs" class="text-destructive px-0" onclick={retry}>
								Retry
							</Button>
						</div>
					{/if}
				</MessageScroller.Content>
			</MessageScroller.Viewport>
			<MessageScroller.Button />
		</MessageScroller.Root>
	</MessageScroller.Provider>

	<div class="border-t p-4">
		<form onsubmit={handleSubmit}>
			<input
				bind:this={fileInput}
				type="file"
				accept="image/*"
				class="sr-only"
				tabindex={-1}
				aria-hidden="true"
				onchange={handleFileChange}
			/>
			<InputGroup.Root>
				{#if image && imagePreview}
					<InputGroup.Addon align="block-start">
						<Attachment.Root size="xs">
							<Attachment.Media variant="image">
								<img src={imagePreview} alt={image.name} />
							</Attachment.Media>
							<Attachment.Content>
								<Attachment.Title class="max-w-40">{image.name}</Attachment.Title>
							</Attachment.Content>
							<Attachment.Actions>
								<Attachment.Action aria-label="Remove image" onclick={() => (image = null)}>
									<XIcon />
								</Attachment.Action>
							</Attachment.Actions>
						</Attachment.Root>
					</InputGroup.Addon>
				{/if}
				<InputGroup.Textarea
					bind:value={text}
					placeholder="Add milk and eggs…"
					aria-label="Message the assistant"
					onkeydown={handleKeydown}
				/>
				<InputGroup.Addon align="block-end" class="justify-between">
					<InputGroup.Button
						size="icon-sm"
						aria-label="Add an image"
						onclick={() => fileInput?.click()}
					>
						<PaperclipIcon />
					</InputGroup.Button>
					{#if busy}
						<InputGroup.Button
							variant="default"
							size="icon-sm"
							aria-label="Stop"
							onclick={() => chat.stop()}
						>
							<SquareIcon />
						</InputGroup.Button>
					{:else}
						<InputGroup.Button
							type="submit"
							variant="default"
							size="icon-sm"
							aria-label="Send"
							disabled={!canSend}
						>
							<ArrowUpIcon />
						</InputGroup.Button>
					{/if}
				</InputGroup.Addon>
			</InputGroup.Root>
		</form>
		{#if attachmentError}
			<p class="text-destructive mt-2 text-xs">{attachmentError}</p>
		{/if}
	</div>
</div>
