<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui'
import { computed } from 'vue'
import type { Category, ShoppingItem, Store } from '../types'

const props = defineProps<{
  item: ShoppingItem
  categories: Category[]
  stores: Store[]
  sortMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', itemId: number): void
  (e: 'delete', itemId: number): void
  (e: 'deleteAll'): void
  (e: 'edit', item: ShoppingItem): void
  (e: 'toggleCategory', itemId: number, categoryId: number): void
  (e: 'assignStore', itemId: number, storeId: number | null): void
}>()

const contextMenuItems = computed<ContextMenuItem[]>(() => {
  const items: ContextMenuItem[] = [
    [
      {
        label: `${props.item.item}`,
        type: 'label',
      },
    ],
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
        label: 'Assign Store',
        icon: 'tabler:building-store',
        children: [
          [
            {
              label: 'No store',
              icon: 'tabler:shopping-cart',
              checked: props.item.storeId == null,
              onSelect: () => {
                emit('assignStore', props.item.id, null)
              },
            },
            ...props.stores.map((store) => ({
              label: store.name,
              icon: 'tabler:building-store',
              checked: props.item.storeId === store.id,
              onSelect: () => {
                emit('assignStore', props.item.id, store.id)
              },
            })),
          ],
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
          emit('delete', props.item.id)
        },
      },
    ],
  ]

  if (props.item.checked) {
    items[2].push({
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
    class="w-full px-2 py-1 hover:bg-slate-950 gap-2 rounded-sm flex flex-row justify-start items-center"
  >
    <UIcon
      name="ci:drag-vertical"
      class="drag-handle size-5 text-neutral-500 hover:text-primary cursor-grab active:cursor-grabbing touch-none"
    />
    <span v-if="!!item.quantity" class="text-primary">
      {{ item.quantity }}
    </span>
    <span class="flex flex-row items-center">
      {{ item.item }}
    </span>
  </div>

  <UContextMenu v-else :items="contextMenuItems" :ui="{ content: 'w-48' }" :disabled="sortMode">
    <button
      class="w-full px-2 py-1 hover:bg-slate-950 gap-2 rounded-sm flex flex-row justify-start items-center hover:cursor-pointer"
      @click="emit('toggle', props.item.id)"
    >
      <span
        v-if="!!item.quantity"
        :class="item.checked ? 'line-through text-primary-800' : 'text-primary'"
      >
        {{ item.quantity }}
      </span>
      <span
        class="flex flex-row items-center"
        :class="{ 'line-through text-neutral-500': item.checked }"
      >
        {{ item.item }}
      </span>
    </button>
  </UContextMenu>
</template>
