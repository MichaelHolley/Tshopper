<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { useCategoryStore } from '@/stores/CategoryStore'

interface Category {
  id: number
  name: string
}

const categories = ref<Category[]>([])
const editingCategory = ref<Category | null>(null)
const state = reactive<{ name: string }>({ name: '' })
const loading = ref(false)
const error = ref('')
const categoryStore = useCategoryStore()

const fetchCategories = async () => {
  loading.value = true
  error.value = ''
  try {
    categories.value = await categoryStore.fetchCategories()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

const addOrUpdateCategory = async (event: FormSubmitEvent<{ name: string }>) => {
  if (!event.data.name) return
  loading.value = true
  error.value = ''
  try {
    if (editingCategory.value) {
      await categoryStore.updateCategory(editingCategory.value.id, event.data.name)
      editingCategory.value = null
    } else {
      await categoryStore.addCategory(event.data.name)
    }
    state.name = ''
    await fetchCategories()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

const startEditCategory = (cat: Category) => {
  editingCategory.value = cat
  state.name = cat.name
}

const cancelEdit = () => {
  editingCategory.value = null
  state.name = ''
}

const deleteCategory = async (cat: Category) => {
  loading.value = true
  error.value = ''
  try {
    await categoryStore.deleteCategory(cat.id)
    await fetchCategories()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

const validate = (state: Partial<{ name: string }>): FormError[] => {
  const errors = []
  if (!state.name) errors.push({ name: 'name', message: 'Required' })
  return errors
}

onMounted(fetchCategories)
</script>

<template>
  <UForm
    :validate="validate"
    :state="state"
    class="flex flex-row gap-2"
    @submit="addOrUpdateCategory"
  >
    <UFormField name="name">
      <UInput v-model="state.name" placeholder="Category name" :required="true" />
    </UFormField>

    <div class="flex flex-row gap-2">
      <UButton v-if="editingCategory" variant="outline" icon="maki:cross" @click="cancelEdit" />
      <UButton type="submit" icon="ci:add-plus">
        {{ editingCategory ? 'Update' : 'Add' }}
      </UButton>
    </div>
  </UForm>
  <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
  <ul class="mt-4">
    <li
      v-for="cat in categories"
      :key="cat.id"
      class="flex flex-row justify-between items-center py-1"
    >
      <span>{{ cat.name }}</span>
      <div class="flex flex-row gap-2">
        <UButton size="xs" icon="tabler:edit" variant="ghost" @click="startEditCategory(cat)" />
        <UButton
          size="xs"
          icon="tabler:trash"
          color="error"
          variant="ghost"
          @click="deleteCategory(cat)"
        />
      </div>
    </li>
  </ul>
</template>