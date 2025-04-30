<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, useTemplateRef } from 'vue'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import type { ItemFormState, ShoppingItem } from './types'
import { useShoppingListStore } from '@/stores/ShoppingListStore'

const VISIBLE_CHECKED = 3

const store = useShoppingListStore()
const checkedCollapsed = ref(true)
const itemInput = useTemplateRef('itemInput')

const state = reactive<ItemFormState>({
  item: '',
  amount: '',
})

const activeItems = computed(() => {
  return store.items.filter((item) => !item.checked)
})

const checkedItems = computed(() => {
  return store.items.filter((item) => item.checked)
})

const mergedItems = computed(() => {
  let checked = checkedItems.value
  if (checkedCollapsed.value) {
    checked = checked.slice(0, VISIBLE_CHECKED)
  }
  return [...activeItems.value, ...checked]
})

const addItem = async (event: FormSubmitEvent<ItemFormState>) => {
  const success = await store.addItem(event.data.item, event.data.amount)
  if (success) {
    state.item = ''
    state.amount = ''
    itemInput.value?.inputRef?.focus()
  }
}

const validate = (state: Partial<ItemFormState>): FormError[] => {
  const errors = []
  if (!state.item) errors.push({ name: 'item', message: 'Required' })
  return errors
}

const toggleItem = (item: ShoppingItem) => {
  if (item.checked) {
    store.uncheckItem(item.id)
  } else {
    store.checkItem(item.id)
  }
}

onMounted(() => {
  store.initializeConnection()
})

onUnmounted(() => {
  store.disconnect()
})
</script>

<template>
  <UForm :validate="validate" :state="state" class="flex flex-row gap-2" @submit="addItem">
    <UFormField name="item">
      <UInput ref="itemInput" v-model="state.item" placeholder="Item" :required="true" />
    </UFormField>

    <UFormField name="amount">
      <UInput v-model="state.amount" placeholder="Amount" />
    </UFormField>

    <div>
      <UButton type="submit" icon="ci:add-plus" class="float-end"> Add </UButton>
    </div>
  </UForm>
  <div class="mt-3">
    <ul v-auto-animate="{ duration: 300, delay: 300 }">
      <li v-for="item in mergedItems" :key="item.id" class="flex">
        <ShoppingListItem :item="item" @toggle="toggleItem" />
      </li>
    </ul>
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
</template>
