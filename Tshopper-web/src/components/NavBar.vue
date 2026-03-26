<script setup lang="ts">
import { useShoppingListStore } from '@/stores/ShoppingListStore'
import { useStoreStore } from '@/stores/StoreStore'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const emit = defineEmits<{
  (e: 'open-drawer'): void
}>()

const shoppingListStore = useShoppingListStore()
const storeStore = useStoreStore()
const route = useRoute()

const checked = computed(() => shoppingListStore.items.filter((item) => item.checked).length)
const showInfo = computed(() => shoppingListStore.items?.length > 0)
const routeLogin = computed(() => route.path === '/login')

const activeStoreName = computed(() => {
  if (storeStore.activeStoreId === null) return 'Unassigned'
  return storeStore.activeStore?.name ?? 'Unassigned'
})
</script>

<template>
  <div class="flex justify-between items-center gap-2 py-1">
    <!-- Left: hamburger (hidden on login) -->
    <div class="flex items-center gap-2">
      <UButton
        v-if="!routeLogin"
        variant="ghost"
        color="neutral"
        icon="tabler:menu-2"
        size="sm"
        @click="emit('open-drawer')"
      />
      <div>
        <h1
          class="text-2xl font-bold text-primary"
          :class="{
            'text-error-500!': !shoppingListStore.isConnected && !routeLogin,
            'animate-pulse': shoppingListStore.isConnecting,
          }"
        >
          Tshopper
        </h1>
      </div>
    </div>

    <!-- Center/Right: connection status + item count -->
    <div class="flex items-center gap-2">
      <div v-if="!shoppingListStore.isConnected && shoppingListStore.isConnecting && !routeLogin">
        <UButton variant="outline" icon="ci:wifi-off" size="sm" color="neutral" disabled>
          Connecting...
        </UButton>
      </div>
      <UButton
        v-if="!shoppingListStore.isConnected && !shoppingListStore.isConnecting && !routeLogin"
        variant="outline"
        icon="ci:wifi-problem"
        size="sm"
        color="neutral"
        @click="shoppingListStore.reconnect()"
      >
        Reconnect
      </UButton>
      <div v-if="showInfo">
        <span class="text-sm text-neutral-500">
          {{ checked }}/{{ shoppingListStore.items.length }}
        </span>
      </div>
    </div>
  </div>
</template>
