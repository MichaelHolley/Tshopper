<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui'
import type { ShoppingItem } from '../types'

const props = defineProps<{
  item: ShoppingItem
}>()

const emit = defineEmits<{
  (e: 'toggle', item: ShoppingItem): void
  (e: 'delete', item: ShoppingItem): void
}>()

const contextMenuItems = [
  {
    label: 'Delete',
    icon: 'tabler:trash',
    onSelect: () => {
      emit('delete', props.item)
    },
  },
] satisfies ContextMenuItem[]
</script>

<template>
  <UContextMenu :items="contextMenuItems" :ui="{ content: 'w-48' }">
    <div
      class="w-full px-2 py-1 hover:bg-slate-950 rounded-sm flex flex-row justify-between items-center shadow hover:cursor-pointer"
      @click="emit('toggle', props.item)"
    >
      <span
        class="flex flex-row items-center"
        :class="{ 'line-through text-neutral-500': item.checked }"
      >
        {{ item.item }}
      </span>
      <span
        :class="item.checked ? 'line-through text-primary-800' : 'text-primary-400'"
        class="ml-8"
      >
        {{ item.quantity }}
      </span>
    </div>
  </UContextMenu>
</template>
