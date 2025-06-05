<script setup lang="ts">
import { useShoppingListStore } from '@/stores/ShoppingListStore'
import { computed } from 'vue'

const store = useShoppingListStore()

const checked = computed(() => store.items.filter((item) => item.checked).length)
</script>

<template>
  <div class="flex justify-between items-center gap-2 py-1">
    <div><h1 class="text-2xl font-bold text-primary-400">Tshopper</h1></div>
    <div>
      <span class="text-sm text-neutral-500">{{ checked }}/{{ store.items.length }}</span>
    </div>
  </div>
</template>
