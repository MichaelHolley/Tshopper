<script setup lang="ts">
import { api } from '@/lib/api'
import { useStoreStore } from '@/stores/StoreStore'
import type { ChatMessage } from '@/types'
import { computed, ref, watch } from 'vue'

const open = defineModel<boolean>('open', { required: true })

const storeStore = useStoreStore()

const history = ref<ChatMessage[]>([])
const input = ref('')
const status = ref<'ready' | 'submitted' | 'error'>('ready')

watch(input, () => {
  if (status.value === 'error') status.value = 'ready'
})

// Map to UChatMessages / UChatMessage parts format
const uiMessages = computed(() =>
  history.value.map((msg, i) => ({
    id: String(i),
    role: msg.role as 'user' | 'assistant',
    parts: [{ type: 'text' as const, id: String(i), text: msg.content }],
  })),
)

async function onSubmit() {
  const message = input.value.trim()
  if (!message || status.value === 'submitted') return

  input.value = ''
  history.value.push({ role: 'user', content: message })
  status.value = 'submitted'

  try {
    const response = await api
      .post('Chat', {
        json: {
          message,
          history: history.value.slice(0, -1),
          storeId: storeStore.activeStoreId,
        },
      })
      .json<{ reply: string; updatedHistory: ChatMessage[] }>()

    history.value = response.updatedHistory
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
      <UChatPrompt
        v-model="input"
        placeholder="Add milk, remove bread…"
        variant="subtle"
        :disabled="status === 'submitted'"
        @submit="onSubmit"
      >
        <UChatPromptSubmit
          :status="status"
          @reload="onSubmit"
        />
      </UChatPrompt>
    </template>
  </USlideover>
</template>
