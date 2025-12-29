<script setup lang="ts">
import { useShoppingListStore } from '@/stores/ShoppingListStore'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const shoppingListStore = useShoppingListStore()
const route = useRoute()

const checked = computed(() => shoppingListStore.items.filter((item) => item.checked).length)
const showInfo = computed(() => shoppingListStore.items?.length > 0)

const routeLogin = computed(() => route.path === '/login')
</script>

<template>
  <div class="flex justify-between items-center gap-2 py-1">
    <div>
      <h1
        class="text-2xl font-bold text-primary"
        :class="{ 'text-error-500!': shoppingListStore.isDisconnected && !routeLogin }"
      >
        Tshopper
      </h1>
    </div>
    <UButton
      v-if="shoppingListStore.isDisconnected"
      variant="outline"
      icon="ci:wifi-problem"
      size="sm"
      color="neutral"
      @click="shoppingListStore.reconnect()"
    >
      Reconnect
    </UButton>
    <div v-if="showInfo">
      <span class="text-sm text-neutral-500"
        >{{ checked }}/{{ shoppingListStore.items.length }}</span
      >
    </div>
  </div>
</template>
