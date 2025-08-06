<script setup lang="ts">
import ShoppingListItem from '@/components/ShoppingListItem.vue'
import { useCategoryStore } from '@/stores/CategoryStore'
import { useShoppingListStore } from '@/stores/ShoppingListStore'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { computed, reactive, ref } from 'vue'
import type { ItemFormState, ShoppingItem } from '../types'

const VISIBLE_CHECKED = 3

const shoppingListStore = useShoppingListStore()
const categoryStore = useCategoryStore()
const checkedCollapsed = ref(true)
const showDeleteAllDialog = ref(false)
const editingItem = ref<ShoppingItem | null>(null)

const state = reactive<ItemFormState>({
  item: '',
  amount: '',
})

const activeItems = computed(() => {
  return shoppingListStore.items.filter((item) => !item.checked)
})

const checkedItems = computed(() => {
  return shoppingListStore.items.filter((item) => item.checked)
})

const mergedItems = computed(() => {
  let checked = checkedItems.value
  if (checkedCollapsed.value) {
    checked = checked.slice(0, VISIBLE_CHECKED)
  }
  return [...activeItems.value, ...checked]
})

const addOrUpdateItem = async (event: FormSubmitEvent<ItemFormState>) => {
  if (editingItem.value) {
    const success = await shoppingListStore.updateItem(
      editingItem.value.id,
      event.data.item,
      event.data.amount,
    )
    if (success) {
      editingItem.value = null
      state.item = ''
      state.amount = ''
    }
  } else {
    const success = await shoppingListStore.addItem(event.data.item, event.data.amount)
    if (success) {
      state.item = ''
      state.amount = ''
    }
  }
}

const validate = (state: Partial<ItemFormState>): FormError[] => {
  const errors = []
  if (!state.item) errors.push({ name: 'item', message: 'Required' })
  return errors
}

const toggleItem = (itemId: number) => {
  const item = shoppingListStore.items.find((i) => i.id === itemId)
  if (!item) return
  if (item.checked) {
    shoppingListStore.uncheckItem(item.id)
  } else {
    shoppingListStore.checkItem(item.id)
  }
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
  state.item = item.item
  state.amount = item.quantity
}

const cancelEdit = () => {
  editingItem.value = null
  state.item = ''
  state.amount = ''
}

const toggleCategory = (itemId: number, categoryId: number) => {
  console.log('toggleCategory', itemId, categoryId)
}
</script>

<template>
  <UForm :validate="validate" :state="state" class="flex flex-row gap-2" @submit="addOrUpdateItem">
    <UFormField name="item">
      <UInput v-model="state.item" placeholder="Item" :required="true" />
    </UFormField>

    <UFormField name="amount">
      <UInput v-model="state.amount" placeholder="Amount" />
    </UFormField>

    <div>
      <div class="flex flex-row gap-2">
        <UButton v-if="editingItem" variant="outline" icon="maki:cross" @click="cancelEdit">
        </UButton>
        <UButton type="submit" icon="ci:add-plus" class="float-end">
          {{ editingItem ? 'Update' : 'Add' }}
        </UButton>
      </div>
    </div>
  </UForm>
  <div class="mt-3">
    <ul v-auto-animate="{ duration: 300, delay: 300 }">
      <li v-for="item in mergedItems" :key="item.id" class="flex">
        <ShoppingListItem
          :item="item"
          @toggle="toggleItem"
          @delete="deleteItem"
          @delete-all="handleDeleteAll"
          @edit="startEditItem"
          @toggle-category="toggleCategory"
          :categories="categoryStore.categories"
        />
      </li>
    </ul>
    <div class="flex flex-row justify-center">
      <UButton
        v-if="checkedItems.length > VISIBLE_CHECKED"
        class="flex flex-row justify-center items-center gap-1"
        variant="ghost"
        @click="
          () => {
            checkedCollapsed = !checkedCollapsed
          }
        "
      >
        <UIcon
          :name="checkedCollapsed ? 'ci:chevron-down' : 'ci:chevron-up'"
          class="size-5 text-primary-400"
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
