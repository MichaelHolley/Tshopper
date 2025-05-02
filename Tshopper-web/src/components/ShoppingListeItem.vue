<script setup lang="ts">
import type { ShoppingItem } from '../types'

defineProps<{
  item: ShoppingItem
}>()

defineEmits<{
  (e: 'toggle', item: ShoppingItem): void
}>()
</script>

<template>
  <div
    class="w-full px-2 py-1 hover:bg-slate-950 rounded-sm flex flex-row justify-between items-center shadow hover:cursor-pointer"
    @click="$emit('toggle', item)"
  >
    <span
      class="flex flex-row items-center"
      :class="{ 'line-through text-neutral-500': item.checked }"
    >
      {{ item.item }}
    </span>
    <span :class="item.checked ? 'line-through text-primary-800' : 'text-primary-400'" class="ml-8">
      {{ item.quantity }}
    </span>
  </div>
</template>
