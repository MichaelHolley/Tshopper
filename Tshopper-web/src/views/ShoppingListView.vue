<script setup lang="ts">
import ShoppingListItem from '@/components/ShoppingListItem.vue'
import ShoppingListForm from '@/components/ShoppingListForm.vue'
import { useCategoryStore } from '@/stores/CategoryStore'
import { useShoppingListStore } from '@/stores/ShoppingListStore'
import type { FormSubmitEvent } from '@nuxt/ui'
import { computed, ref, watch } from 'vue'
import type { ItemFormState, ShoppingItem } from '../types'
import draggable from 'vuedraggable'

const VISIBLE_CHECKED = 3

const shoppingListStore = useShoppingListStore()
const categoryStore = useCategoryStore()
const checkedCollapsed = ref(true)
const showDeleteAllDialog = ref(false)
const editingItem = ref<ShoppingItem | null>(null)
const draggableItems = ref<ShoppingItem[]>([])
const sortMode = ref(false)

const activeItems = computed(() => {
  return shoppingListStore.items.filter((item) => !item.checked)
})

const checkedItems = computed(() => {
  return shoppingListStore.items.filter((item) => !!item.checked)
})

const mergedItems = computed(() => {
  let checked = checkedItems.value
  if (checkedCollapsed.value) {
    checked = checked.slice(0, VISIBLE_CHECKED)
  }
  return [...activeItems.value, ...checked]
})

watch(
  activeItems,
  (newItems) => {
    draggableItems.value = [...newItems]
  },
  { immediate: true },
)

const addOrUpdateItem = async (
  event: FormSubmitEvent<ItemFormState>,
  onSuccess: () => void,
) => {
  if (editingItem.value) {
    const success = await shoppingListStore.updateItem(
      editingItem.value.id,
      event.data.item.trim(),
      event.data.quantity.trim(),
    )

    if (success) {
      editingItem.value = null
      onSuccess()
    }
  } else {
    const success = await shoppingListStore.addItem(
      event.data.item.trim(),
      event.data.quantity.trim(),
    )

    if (success) {
      onSuccess()
    }
  }
}

const toggleItem = (itemId: number) => {
  shoppingListStore.toggleItem(itemId)
}

const deleteItem = (itemId: number) => {
  shoppingListStore.deleteItem(itemId)
}

const handleDeleteAll = () => {
  showDeleteAllDialog.value = true
}

const confirmDeleteAll = () => {
  shoppingListStore.deleteAllCheckedItems()
  showDeleteAllDialog.value = false
}

const startEditItem = (item: ShoppingItem) => {
  editingItem.value = item
}

const cancelEdit = () => {
  editingItem.value = null
}

const toggleCategory = (itemId: number, categoryId: number) => {
  console.log('toggleCategory', itemId, categoryId)
}

const toggleCheckedCollapsed = () => {
  checkedCollapsed.value = !checkedCollapsed.value
}

const toggleSortMode = () => {
  sortMode.value = !sortMode.value
}

const handleDragEnd = async () => {
  const orderedIds = draggableItems.value.map((item) => item.id)
  await shoppingListStore.reorderItems(orderedIds)
}
</script>

<template>
  <ShoppingListForm :editingItem="editingItem" @submit="addOrUpdateItem" @cancel="cancelEdit" />

  <!-- Sort Mode Toggle Button -->
  <div class="mt-3 flex flex-row justify-between items-center">
    <UButton
      :variant="sortMode ? 'solid' : 'outline'"
      :color="sortMode ? 'primary' : 'neutral'"
      icon="tabler:arrows-sort"
      @click="toggleSortMode"
      :disabled="shoppingListStore.isDisconnected"
    >
      Sort-Mode
    </UButton>

    <!-- Sort Mode Active Badge -->
    <div v-if="sortMode" class="text-sm text-primary">Long-press and drag to reorder</div>
  </div>

  <div class="mt-3">
    <!-- Normal Mode: Single merged list with auto-animate -->
    <template v-if="!sortMode">
      <ul v-auto-animate="{ duration: 300, delay: 300 }">
        <li v-for="item in mergedItems" :key="item.id" class="flex">
          <ShoppingListItem
            :item="item"
            :sortMode="false"
            @toggle="toggleItem"
            @delete="deleteItem"
            @delete-all="handleDeleteAll"
            @edit="startEditItem"
            @toggle-category="toggleCategory"
            :categories="categoryStore.categories"
          />
        </li>
      </ul>
    </template>

    <!-- Sort Mode: Separate draggable unchecked and non-draggable checked -->
    <template v-else>
      <draggable
        :list="draggableItems"
        @end="handleDragEnd"
        item-key="id"
        :animation="200"
        ghost-class="opacity-50"
        handle=".drag-handle"
        :delay="150"
        :delayOnTouchOnly="true"
        :touchStartThreshold="5"
        :forceFallback="false"
        :fallbackTolerance="3"
      >
        <template #item="{ element }">
          <ShoppingListItem :item="element" :sortMode="true" :categories="[]" />
        </template>
      </draggable>
    </template>

    <div class="flex flex-row justify-center">
      <UButton
        v-if="checkedItems.length > VISIBLE_CHECKED && sortMode === false"
        class="flex flex-row justify-center items-center gap-1"
        variant="ghost"
        @click="toggleCheckedCollapsed"
      >
        <UIcon
          :name="checkedCollapsed ? 'ci:chevron-down' : 'ci:chevron-up'"
          class="size-5 text-primary"
        />
        <span class="text-neutral-200">Show {{ checkedCollapsed ? 'more' : 'less' }}</span>
      </UButton>
    </div>
  </div>

  <UModal
    v-model:open="showDeleteAllDialog"
    title="Confirm Delete"
    description="This action requires confirmation"
  >
    <template #body>
      <p>Are you sure you want to delete all checked items? This action cannot be undone.</p>
      <div class="flex flex-row justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="showDeleteAllDialog = false">
          Cancel
        </UButton>
        <UButton color="error" variant="solid" @click="confirmDeleteAll"> Delete All </UButton>
      </div>
    </template>
  </UModal>
</template>
