<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui'
import { computed } from 'vue'
import type { Category, ShoppingItem } from '../types'

const props = defineProps<{
  item: ShoppingItem
  categories: Category[]
  sortMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', itemId: number): void
  (e: 'delete', itemId: number): void
  (e: 'deleteAll'): void
  (e: 'edit', item: ShoppingItem): void
  (e: 'toggleCategory', itemId: number, categoryId: number): void
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
            onSelect: () => {
              emit('toggleCategory', props.item.id, category.id)
            },
          })),
        ],
        disabled: true,
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
          emit('delete', props.item.id)
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
  <div
    v-if="sortMode"
    class="w-full px-2 py-1 hover:bg-slate-950 gap-2 rounded-sm flex flex-row justify-start items-center hover:cursor-pointer"
  >
    <span v-if="!!item.quantity" class="text-primary-400 select-none">
      {{ item.quantity }}
    </span>
    <span class="flex flex-row items-center select-none">
      {{ item.item }}
    </span>
  </div>

  <UContextMenu v-else :items="contextMenuItems" :ui="{ content: 'w-48' }" :disabled="sortMode">
    <button
      class="w-full px-2 py-1 hover:bg-slate-950 gap-2 rounded-sm flex flex-row justify-start items-center hover:cursor-pointer"
      @click="
        () => {
          if (sortMode) return
          emit('toggle', props.item.id)
        }
      "
    >
      <span
        v-if="!!item.quantity"
        :class="item.checked ? 'line-through text-primary-800' : 'text-primary-400'"
        class="select-none"
      >
        {{ item.quantity }}
      </span>
      <span
        class="flex flex-row items-center select-none"
        :class="{ 'line-through text-neutral-500': item.checked }"
      >
        {{ item.item }}
      </span>
    </button>
  </UContextMenu>
</template>
