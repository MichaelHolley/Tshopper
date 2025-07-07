<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui'
import { computed } from 'vue'
import type { Cateogy, ShoppingItem } from '../types'

const props = defineProps<{
  item: ShoppingItem
  categories: Cateogy[]
}>()

const emit = defineEmits<{
  (e: 'toggle', item: ShoppingItem): void
  (e: 'delete', item: ShoppingItem): void
  (e: 'deleteAll'): void
  (e: 'edit', item: ShoppingItem): void
}>()

const contextMenuItems = computed<ContextMenuItem[]>(() => {
  const items = [
    [
      {
        label: 'Category',
        icon: 'tabler:category',
        children: [
          props.categories.map((category) => ({
            label: category.name,
            icon: 'tabler:category',
            // onSelect: () => {
            //   emit('toggle', { ...props.item, categoryId: category.id })
            // },
          })),
        ],
      },
      {
        label: 'Edit',
        icon: 'tabler:edit',
        onSelect: () => {
          emit('edit', props.item)
        },
      },
    ],
    [
      {
        label: 'Delete',
        icon: 'tabler:trash',
        onSelect: () => {
          emit('delete', props.item)
        },
      },
    ],
  ]

  if (props.item.checked) {
    items[1].push({
      label: 'Delete all checked',
      icon: 'tabler:trash',
      onSelect: () => {
        emit('deleteAll')
      },
    })
  }

  return items
})
</script>

<template>
  <UContextMenu :items="contextMenuItems" :ui="{ content: 'w-48' }">
    <div
      class="w-full px-2 py-1 hover:bg-slate-950 rounded-sm flex flex-row justify-between items-center hover:cursor-pointer"
      @click="emit('toggle', props.item)"
    >
      <span
        class="flex flex-row items-center select-none"
        :class="{ 'line-through text-neutral-500': item.checked }"
      >
        {{ item.item }}
      </span>
      <span
        :class="item.checked ? 'line-through text-primary-800' : 'text-primary-400'"
        class="ml-8 select-none"
      >
        {{ item.quantity }}
      </span>
    </div>
  </UContextMenu>
</template>
