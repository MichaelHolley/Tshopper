<script setup lang="ts">
import { useCategoryStore } from '@/stores/CategoryStore'
import { useShoppingListStore } from '@/stores/ShoppingListStore'
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const shoppingListStore = useShoppingListStore()
const categoryStore = useCategoryStore()
const route = useRoute()

const checked = computed(() => shoppingListStore.items.filter((item) => item.checked).length)
const showInfo = computed(() => shoppingListStore.items?.length > 0)

onMounted(() => {
  shoppingListStore.initializeConnection()
  categoryStore.getCategories()
})

onUnmounted(() => {
  shoppingListStore.disconnect()
})
</script>

<template>
  <div class="flex justify-between items-center gap-2 py-1">
    <div><h1 class="text-2xl font-bold text-primary-400">Tshopper</h1></div>
    <div
      v-if="shoppingListStore.isDisconnected"
      v-show="route.path != '/login'"
      @click="shoppingListStore.reconnect()"
      class="cursor-pointer"
    >
      <span class="text-sm text-neutral-500">Reconnect</span>
    </div>
    <div v-if="showInfo">
      <span class="text-sm text-neutral-500"
        >{{ checked }}/{{ shoppingListStore.items.length }}</span
      >
    </div>
  </div>
</template>
