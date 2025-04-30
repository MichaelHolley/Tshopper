<script setup lang="ts">
import type { ShoppingItem } from './types'

defineProps<{
  item: ShoppingItem
}>()

defineEmits<{
  (e: 'toggle', item: ShoppingItem): void
}>()
</script>

<template>
  <div class="px-2 py-1 hover:bg-slate-950 rounded-sm flex flex-row items-center shadow">
    <span
      class="hover:cursor-pointer flex flex-row items-center"
      :class="{ 'line-through text-neutral-500': item.checked }"
      @click="$emit('toggle', item)"
    >
      <UIcon
        :name="item.checked ? 'ci:checkbox-check' : 'ci:checkbox-unchecked'"
        class="size-5 mr-1"
      />
      {{ item.item }}
    </span>
    <span :class="item.checked ? 'text-primary-800' : 'text-primary-400'" class="ml-8">
      {{ item.quantity }}
    </span>
  </div>
</template>
