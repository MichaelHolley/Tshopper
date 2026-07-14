<script setup lang="ts">
import { api } from '@/lib/api'
import { useStoreStore } from '@/stores/StoreStore'
import type { ChatImageAttachment, ChatImagePreview, ChatMessage } from '@/types'
import { computed, ref, watch } from 'vue'

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_IMAGES = 4
const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB, mirrors the backend limit

const open = defineModel<boolean>('open', { required: true })

const storeStore = useStoreStore()

const history = ref<ChatMessage[]>([])
const input = ref('')
const attachments = ref<ChatImageAttachment[]>([])
const status = ref<'ready' | 'submitted' | 'error'>('ready')
const attachmentError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

watch(input, () => {
  if (status.value === 'error') status.value = 'ready'
})

// Map to UChatMessages / UChatMessage parts format. Image previews (local-only) are
// rendered as file parts ahead of the text.
const uiMessages = computed(() =>
  history.value.map((msg, i) => ({
    id: String(i),
    role: msg.role as 'user' | 'assistant',
    parts: [
      ...(msg.imagePreviews ?? []).map((preview, j) => ({
        type: 'file' as const,
        mediaType: preview.mediaType,
        url: preview.url,
        filename: `image-${i}-${j}`,
      })),
      // Skip an empty text part so image-only turns don't render a blank bubble.
      ...(msg.content ? [{ type: 'text' as const, id: String(i), text: msg.content }] : []),
    ],
  })),
)

function openFilePicker() {
  attachmentError.value = ''
  fileInput.value?.click()
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function onFilesSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files ?? [])
  // Reset so re-selecting the same file fires the change event again.
  target.value = ''
  attachmentError.value = ''

  for (const file of files) {
    if (attachments.value.length >= MAX_IMAGES) {
      attachmentError.value = `You can attach at most ${MAX_IMAGES} images.`
      break
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      attachmentError.value = 'Only PNG, JPEG, and WebP images are supported.'
      continue
    }
    if (file.size > MAX_IMAGE_BYTES) {
      attachmentError.value = 'Each image must be 5 MB or smaller.'
      continue
    }

    const dataUrl = await readAsDataUrl(file)
    // Re-check after the await: a second overlapping selection could have filled the slots.
    if (attachments.value.length >= MAX_IMAGES) {
      attachmentError.value = `You can attach at most ${MAX_IMAGES} images.`
      break
    }
    // Strip the "data:<type>;base64," prefix — the API expects raw base64.
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
    attachments.value.push({
      id: crypto.randomUUID(),
      mediaType: file.type,
      data: base64,
      previewUrl: dataUrl,
    })
  }
}

function removeAttachment(index: number) {
  attachments.value.splice(index, 1)
  attachmentError.value = ''
}

async function onSubmit() {
  const message = input.value.trim()
  const images = attachments.value
  if ((!message && images.length === 0) || status.value === 'submitted') return

  const imagePreviews: ChatImagePreview[] = images.map((a) => ({
    url: a.previewUrl,
    mediaType: a.mediaType,
  }))

  input.value = ''
  attachments.value = []
  attachmentError.value = ''
  history.value.push({ role: 'user', content: message, imagePreviews })
  status.value = 'submitted'

  try {
    const response = await api
      .post('Chat', {
        json: {
          message,
          // Send prior turns as text only — images live on the current turn (below).
          // Fall back to a placeholder so an image-only turn isn't sent as empty content.
          history: history.value
            .slice(0, -1)
            .map(({ role, content }) => ({ role, content: content || '[image]' })),
          storeId: storeStore.activeStoreId,
          images: images.map(({ mediaType, data }) => ({ mediaType, data })),
        },
      })
      .json<{ reply: string }>()

    // Append the assistant reply locally rather than replacing history with the server
    // copy, which has no imagePreviews and would drop the just-sent thumbnails.
    history.value.push({ role: 'assistant', content: response.reply })
    status.value = 'ready'
  } catch {
    history.value.push({
      role: 'assistant',
      content: 'Something went wrong. Please try again.',
    })
    status.value = 'error'
  }
}

function clearHistory() {
  history.value = []
  attachments.value = []
  attachmentError.value = ''
  status.value = 'ready'
}
</script>

<template>
  <USlideover v-model:open="open" title="AI Assistant" side="right">
    <template #actions>
      <UButton
        v-if="history.length > 0"
        color="neutral"
        variant="ghost"
        icon="i-tabler-trash"
        size="sm"
        title="Clear conversation"
        @click="clearHistory"
      />
    </template>

    <template #body>
      <!-- Empty state -->
      <div
        v-if="history.length === 0"
        class="flex flex-col items-center justify-center h-full gap-4 px-4 text-neutral-500"
      >
        <UIcon name="i-tabler-message-circle-2" class="size-12" />
        <p class="text-sm text-center">Ask me to add, update, or remove items from your list.</p>
        <div class="flex flex-col gap-2 w-full mt-2">
          <button
            v-for="suggestion in [
              'Add milk and eggs',
              'Remove all checked items',
              'Change butter quantity to 2',
            ]"
            :key="suggestion"
            class="text-xs text-left px-3 py-2 rounded-lg border border-neutral-700 text-neutral-400 hover:border-primary hover:text-primary transition-colors"
            @click="input = suggestion"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <UChatMessages
        v-else
        :messages="uiMessages"
        :status="status"
        should-auto-scroll
        class="h-full"
      />
    </template>

    <template #footer>
      <div class="w-full flex flex-col gap-2">
        <!-- Staged attachments -->
        <div v-if="attachments.length > 0" class="flex flex-wrap gap-2">
          <div
            v-for="(attachment, index) in attachments"
            :key="attachment.id"
            class="relative size-16 rounded-lg overflow-hidden border border-neutral-700"
          >
            <img :src="attachment.previewUrl" alt="Attachment preview" class="size-full object-cover" />
            <button
              type="button"
              class="absolute top-0.5 right-0.5 rounded-full bg-neutral-900/80 p-0.5 text-neutral-200 hover:text-white"
              title="Remove image"
              @click="removeAttachment(index)"
            >
              <UIcon name="i-tabler-x" class="size-3.5" />
            </button>
          </div>
        </div>

        <p v-if="attachmentError" class="text-xs text-error">{{ attachmentError }}</p>

        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          class="hidden"
          @change="onFilesSelected"
        />

        <UChatPrompt
          v-model="input"
          placeholder="Add milk, remove bread…"
          variant="subtle"
          :disabled="status === 'submitted'"
          @submit="onSubmit"
        >
          <template #leading>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-tabler-photo-plus"
              size="sm"
              title="Attach image"
              :disabled="status === 'submitted' || attachments.length >= MAX_IMAGES"
              @click="openFilePicker"
            />
          </template>

          <UChatPromptSubmit :status="status" @reload="onSubmit" />
        </UChatPrompt>
      </div>
    </template>
  </USlideover>
</template>
