<script setup lang="ts">
import { useShoppingListStore } from '@/stores/ShoppingListStore'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const store = useShoppingListStore()
const route = useRoute()

const checked = computed(() => store.items.filter((item) => item.checked).length)
const showInfo = computed(() => store.items?.length > 0)
</script>

<template>
  <div class="flex justify-between items-center gap-2 py-1">
    <div><h1 class="text-2xl font-bold text-primary-400">Tshopper</h1></div>
    <div
      v-if="store.isDisconnected"
      v-show="route.path != '/login'"
      @click="store.reconnect()"
      class="cursor-pointer"
    >
      <span class="text-sm text-neutral-500">Reconnect</span>
    </div>
    <div v-if="showInfo">
      <span class="text-sm text-neutral-500">{{ checked }}/{{ store.items.length }}</span>
    </div>
  </div>
</template>
