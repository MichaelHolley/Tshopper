<script lang="ts">
	import * as PromptInput from '$lib/components/ai-elements/prompt-input/index.js';
	import { getAttachmentsContext } from '$lib/components/ai-elements/prompt-input/index.js';
	import ImageIcon from '@lucide/svelte/icons/image';

	const attachments = getAttachmentsContext();
</script>

<PromptInput.Button
	aria-label="Attach an image"
	disabled={attachments.attachments.length > 0}
	onclick={() => attachments.openFileDialog()}
>
	<ImageIcon class="size-4" />
</PromptInput.Button>
