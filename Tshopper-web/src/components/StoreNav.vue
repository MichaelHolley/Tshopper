<script setup lang="ts">
import { useShoppingListStore } from '@/stores/ShoppingListStore'
import { useStoreStore } from '@/stores/StoreStore'
import { useRouter } from 'vue-router'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const storeStore = useStoreStore()
const shoppingListStore = useShoppingListStore()
const router = useRouter()

async function selectStore(id: number | null) {
  await shoppingListStore.setActiveStore(id)
  await router.push('/')
  emit('close')
}

function navigateTo(path: string) {
  router.push(path)
  emit('close')
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <!-- Store list header -->
    <p class="text-xs font-semibold uppercase tracking-wider text-neutral-500 px-2 mb-1">Stores</p>

    <!-- Unassigned (no store) -->
    <button
      class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left"
      :class="
        storeStore.activeStoreId === null
          ? 'bg-primary/15 text-primary'
          : 'text-neutral-300 hover:bg-neutral-800'
      "
      @click="selectStore(null)"
    >
      <span
        class="size-3 rounded-full border-2 flex-shrink-0"
        :class="storeStore.activeStoreId === null ? 'border-primary' : 'border-neutral-500'"
      />
      <span>Unassigned</span>
    </button>

    <!-- Individual stores -->
    <button
      v-for="store in storeStore.stores"
      :key="store.id"
      class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left"
      :class="
        storeStore.activeStoreId === store.id
          ? 'bg-primary/15 text-primary'
          : 'text-neutral-300 hover:bg-neutral-800'
      "
      @click="selectStore(store.id)"
    >
      <span class="size-3 rounded-full flex-shrink-0" :style="{ backgroundColor: store.color }" />
      <span>{{ store.name }}</span>
    </button>

    <p v-if="storeStore.stores.length === 0" class="text-xs text-neutral-500 px-3 py-1 italic">
      No stores yet
    </p>

    <div class="border-t border-neutral-800 my-2" />

    <!-- Navigation links -->
    <p class="text-xs font-semibold uppercase tracking-wider text-neutral-500 px-2 mb-1">
      Navigation
    </p>

    <button
      class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors w-full text-left"
      @click="navigateTo('/data')"
    >
      <UIcon name="tabler:file-arrow-right" class="size-4 flex-shrink-0" />
      <span>Data Transfer</span>
    </button>
  </div>
</template>
