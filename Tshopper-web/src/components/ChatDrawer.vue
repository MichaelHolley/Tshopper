<script setup lang="ts">
import { api } from '@/lib/api'
import { useStoreStore } from '@/stores/StoreStore'
import type { ChatMessage } from '@/types'
import { nextTick, ref } from 'vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const storeStore = useStoreStore()

const history = ref<ChatMessage[]>([])
const input = ref('')
const loading = ref(false)
const messagesEl = ref<HTMLElement | null>(null)

async function scrollToBottom() {
  await nextTick()
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

async function send() {
  const message = input.value.trim()
  if (!message || loading.value) return

  input.value = ''
  history.value.push({ role: 'user', content: message })
  await scrollToBottom()

  loading.value = true
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
  } catch (err) {
    history.value.push({
      role: 'assistant',
      content: 'Sorry, something went wrong. Please try again.',
    })
    console.error('Chat error:', err)
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    send()
  }
}

function clearHistory() {
  history.value = []
}
</script>

<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div v-if="open" class="fixed inset-0 z-40 bg-black/50" @click="emit('close')" />
  </Transition>

  <!-- Drawer panel -->
  <Transition name="drawer-right">
    <div
      v-if="open"
      class="fixed top-0 right-0 z-50 h-full w-80 sm:w-96 bg-neutral-900 border-l border-neutral-800 flex flex-col shadow-2xl"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-800 shrink-0">
        <div class="flex items-center gap-2">
          <UIcon name="tabler:message-circle" class="size-5 text-primary" />
          <h2 class="text-base font-semibold text-white">AI Assistant</h2>
        </div>
        <div class="flex items-center gap-1">
          <UButton
            v-if="history.length > 0"
            variant="ghost"
            color="neutral"
            icon="tabler:trash"
            size="sm"
            title="Clear conversation"
            @click="clearHistory"
          />
          <UButton
            variant="ghost"
            color="neutral"
            icon="tabler:x"
            size="sm"
            @click="emit('close')"
          />
        </div>
      </div>

      <!-- Messages -->
      <div ref="messagesEl" class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        <!-- Empty state -->
        <div
          v-if="history.length === 0"
          class="flex-1 flex flex-col items-center justify-center gap-3 text-neutral-500 py-12"
        >
          <UIcon name="tabler:message-circle-2" class="size-12" />
          <p class="text-sm text-center">
            Ask me to add, update, or remove items from your shopping list.
          </p>
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

        <!-- Message bubbles -->
        <template v-else>
          <div
            v-for="(msg, i) in history"
            :key="i"
            :class="[
              'flex',
              msg.role === 'user' ? 'justify-end' : 'justify-start',
            ]"
          >
            <div
              :class="[
                'max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-tr-sm'
                  : 'bg-neutral-800 text-neutral-100 rounded-tl-sm',
              ]"
            >
              {{ msg.content }}
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="loading" class="flex justify-start">
            <div class="bg-neutral-800 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
              <span
                v-for="n in 3"
                :key="n"
                class="size-1.5 rounded-full bg-neutral-400 animate-bounce"
                :style="{ animationDelay: `${(n - 1) * 150}ms` }"
              />
            </div>
          </div>
        </template>
      </div>

      <!-- Input -->
      <div class="border-t border-neutral-800 px-3 py-3 shrink-0">
        <div class="flex gap-2 items-end">
          <textarea
            v-model="input"
            placeholder="Add milk, remove bread…"
            rows="1"
            :disabled="loading"
            class="flex-1 resize-none bg-neutral-800 text-white text-sm placeholder-neutral-500 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 max-h-28 overflow-y-auto"
            @keydown="handleKeydown"
            @input="($event.target as HTMLTextAreaElement).style.height = 'auto'; ($event.target as HTMLTextAreaElement).style.height = ($event.target as HTMLTextAreaElement).scrollHeight + 'px'"
          />
          <UButton
            icon="tabler:send-2"
            color="primary"
            variant="solid"
            size="sm"
            :disabled="!input.trim() || loading"
            class="shrink-0 mb-0.5"
            @click="send"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-right-enter-active,
.drawer-right-leave-active {
  transition: transform 0.25s ease;
}
.drawer-right-enter-from,
.drawer-right-leave-to {
  transform: translateX(100%);
}

@keyframes bounce-dot {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-4px); }
}
.animate-bounce {
  animation: bounce-dot 1s infinite;
}
</style>
