<script setup lang="ts">
import { useStoreStore } from '@/stores/StoreStore'
import type { Store } from '@/types'
import { reactive, ref } from 'vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const storeStore = useStoreStore()

// ── New store form ──────────────────────────────────────────────────────────
const newStoreName = ref('')
const newStoreColor = ref('#6366f1')
const addError = ref('')
const addLoading = ref(false)

async function handleAddStore() {
  addError.value = ''
  const name = newStoreName.value.trim()
  if (!name) {
    addError.value = 'Store name is required.'
    return
  }
  addLoading.value = true
  const result = await storeStore.addStore(name, newStoreColor.value)
  addLoading.value = false
  if (result) {
    newStoreName.value = ''
    newStoreColor.value = '#6366f1'
  } else {
    addError.value = 'Failed to add store. Please try again.'
  }
}

// ── Edit store form ─────────────────────────────────────────────────────────
const editingStore = ref<Store | null>(null)
const editState = reactive({ name: '', color: '#6366f1' })
const editError = ref('')
const editLoading = ref(false)

function startEdit(store: Store) {
  editingStore.value = store
  editState.name = store.name
  editState.color = store.color
  editError.value = ''
}

function cancelEdit() {
  editingStore.value = null
  editError.value = ''
}

async function handleUpdateStore() {
  if (!editingStore.value) return
  editError.value = ''
  const name = editState.name.trim()
  if (!name) {
    editError.value = 'Store name is required.'
    return
  }
  editLoading.value = true
  const success = await storeStore.updateStore(editingStore.value.id, name, editState.color)
  editLoading.value = false
  if (success) {
    editingStore.value = null
  } else {
    editError.value = 'Failed to update store. Please try again.'
  }
}

// ── Delete store ────────────────────────────────────────────────────────────
const deletingStoreId = ref<number | null>(null)
const deleteError = ref('')

async function handleDeleteStore(id: number) {
  deleteError.value = ''
  deletingStoreId.value = id
  const success = await storeStore.deleteStore(id)
  deletingStoreId.value = null
  if (!success) {
    deleteError.value = 'Failed to delete store. Please try again.'
  }
  // if the store being edited was deleted, cancel edit
  if (editingStore.value?.id === id) {
    editingStore.value = null
  }
}

function handleClose() {
  editingStore.value = null
  addError.value = ''
  editError.value = ''
  deleteError.value = ''
  emit('close')
}
</script>

<template>
  <Transition name="backdrop">
    <div v-if="open" class="fixed inset-0 z-60 bg-black/60" @click="handleClose" />
  </Transition>

  <Transition name="modal">
    <div
      v-if="open"
      class="fixed inset-0 z-70 flex items-center justify-center p-4 pointer-events-none"
    >
      <div
        class="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-md pointer-events-auto flex flex-col max-h-[80vh]"
        @click.stop
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-5 py-4 border-b border-neutral-800 shrink-0"
        >
          <h2 class="text-base font-semibold text-white">Manage Stores</h2>
          <UButton variant="ghost" color="neutral" icon="tabler:x" size="sm" @click="handleClose" />
        </div>

        <!-- Body -->
        <div class="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">
          <!-- Add new store -->
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              Add Store
            </p>
            <div class="flex items-center gap-2">
              <input
                v-model="newStoreName"
                type="text"
                placeholder="Store name"
                maxlength="80"
                class="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                @keydown.enter.prevent="handleAddStore"
              />
              <label class="relative cursor-pointer shrink-0" title="Pick color">
                <input v-model="newStoreColor" type="color" class="sr-only" />
                <span
                  class="block size-9 rounded-lg border-2 border-neutral-600 hover:border-primary transition-colors"
                  :style="{ backgroundColor: newStoreColor }"
                />
              </label>
              <UButton icon="tabler:plus" size="sm" :loading="addLoading" @click="handleAddStore" />
            </div>
            <p v-if="addError" class="text-xs text-red-400 mt-1">{{ addError }}</p>
          </div>

          <div class="border-t border-neutral-800" />

          <!-- Existing stores list -->
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              Existing Stores
            </p>

            <p v-if="storeStore.stores.length === 0" class="text-sm text-neutral-500 italic">
              No stores yet.
            </p>

            <div v-else class="flex flex-col gap-2">
              <div
                v-for="store in storeStore.stores"
                :key="store.id"
                class="border border-neutral-800 rounded-lg overflow-hidden"
              >
                <!-- View mode -->
                <div v-if="editingStore?.id !== store.id" class="flex items-center gap-3 px-3 py-2">
                  <span
                    class="size-3 rounded-full shrink-0"
                    :style="{ backgroundColor: store.color }"
                  />
                  <span class="flex-1 text-sm text-neutral-200 truncate">{{ store.name }}</span>
                  <div class="flex items-center gap-1 shrink-0">
                    <UButton
                      variant="ghost"
                      color="neutral"
                      icon="tabler:pencil"
                      size="xs"
                      title="Rename"
                      @click="startEdit(store)"
                    />
                    <UButton
                      variant="ghost"
                      color="error"
                      icon="tabler:trash"
                      size="xs"
                      title="Delete"
                      :loading="deletingStoreId === store.id"
                      @click="handleDeleteStore(store.id)"
                    />
                  </div>
                </div>

                <!-- Edit mode -->
                <div v-else class="px-3 py-2 flex flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <input
                      v-model="editState.name"
                      type="text"
                      placeholder="Store name"
                      maxlength="80"
                      class="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      @keydown.enter.prevent="handleUpdateStore"
                      @keydown.escape.prevent="cancelEdit"
                    />
                    <label class="relative cursor-pointer shrink-0" title="Pick color">
                      <input v-model="editState.color" type="color" class="sr-only" />
                      <span
                        class="block size-9 rounded-lg border-2 border-neutral-600 hover:border-primary transition-colors"
                        :style="{ backgroundColor: editState.color }"
                      />
                    </label>
                  </div>
                  <p v-if="editError" class="text-xs text-red-400">{{ editError }}</p>
                  <div class="flex items-center gap-2">
                    <UButton
                      size="xs"
                      icon="tabler:check"
                      :loading="editLoading"
                      @click="handleUpdateStore"
                    >
                      Save
                    </UButton>
                    <UButton
                      size="xs"
                      variant="ghost"
                      color="neutral"
                      icon="tabler:x"
                      @click="cancelEdit"
                    >
                      Cancel
                    </UButton>
                  </div>
                </div>
              </div>
            </div>

            <p v-if="deleteError" class="text-xs text-red-400 mt-2">{{ deleteError }}</p>
          </div>
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

.modal-enter-active,
.modal-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
