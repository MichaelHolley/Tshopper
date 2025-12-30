<script setup lang="ts">
import type { ItemFormState, ShoppingItem } from '@/types'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { onMounted, reactive, useTemplateRef, watch } from 'vue'

interface Props {
  editingItem: ShoppingItem | null
}

interface Emits {
  (e: 'submit', event: FormSubmitEvent<ItemFormState>, onSuccess: () => void): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const itemForm = useTemplateRef('itemForm')
const itemInput = useTemplateRef('itemInput')

const state = reactive<ItemFormState>({
  item: '',
  quantity: '',
})

onMounted(() => {
  const storedState = localStorage.getItem('itemFormState')
  if (storedState) {
    try {
      const parsedState = JSON.parse(storedState)
      state.item = parsedState.item || ''
      state.quantity = parsedState.quantity || ''
    } catch (error) {
      console.error('Failed to parse stored form state:', error)
      localStorage.removeItem('itemFormState')
    }
  }
})

watch(
  () => props.editingItem,
  (newEditingItem) => {
    if (newEditingItem) {
      state.item = newEditingItem.item
      state.quantity = newEditingItem.quantity
    } else {
      state.item = ''
      state.quantity = ''
    }
  },
)

watch(
  state,
  (newState) => {
    if (props.editingItem) return
    localStorage.setItem('itemFormState', JSON.stringify(newState))
  },
  { deep: true },
)

const validate = (state: Partial<ItemFormState>): FormError[] => {
  const errors = []
  if (!state.item) errors.push({ name: 'item', message: 'Required' })
  return errors
}

const handleSubmit = (event: FormSubmitEvent<ItemFormState>) => {
  const onSuccess = () => {
    if (!props.editingItem) {
      clearForm()
      itemInput.value?.inputRef?.focus()
    }
  }

  emit('submit', event, onSuccess)
}

const clearForm = () => {
  state.item = ''
  state.quantity = ''
  localStorage.removeItem('itemFormState')
  itemForm.value?.setErrors([])
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <UForm
    :validate="validate"
    :state="state"
    class="flex flex-row gap-2"
    @submit="handleSubmit"
    ref="itemForm"
  >
    <UFormField name="item" class="grow">
      <UInput
        v-model="state.item"
        placeholder="Item"
        :required="true"
        class="w-full"
        ref="itemInput"
      />
    </UFormField>
    <UFormField name="quantity">
      <UInput v-model="state.quantity" placeholder="Quantity" />
    </UFormField>
    <div>
      <div class="flex flex-row gap-2">
        <UButton v-if="editingItem" variant="outline" icon="maki:cross" @click="handleCancel">
        </UButton>
        <UButton
          type="submit"
          :icon="editingItem ? 'ci:arrow-reload-02' : 'ci:add-plus'"
          class="float-end"
        >
          {{ editingItem ? 'Update' : 'Add' }}
        </UButton>
      </div>
    </div>
  </UForm>
</template>
