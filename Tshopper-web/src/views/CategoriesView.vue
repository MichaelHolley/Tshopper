<script setup lang="ts">
import { useCategoryStore } from '@/stores/CategoryStore'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { onMounted, reactive, ref } from 'vue'

interface Category {
  id: number
  name: string
}

const editingCategory = ref<Category | null>(null)
const state = reactive<{ name: string }>({ name: '' })
const error = ref('')
const categoryStore = useCategoryStore()

const updateCategories = async () => {
  error.value = ''
  try {
    await categoryStore.getCategories()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}

const addOrUpdateCategory = async (event: FormSubmitEvent<{ name: string }>) => {
  if (!event.data.name) return
  error.value = ''

  try {
    if (editingCategory.value) {
      await categoryStore.updateCategory(editingCategory.value.id, event.data.name.trim())
      editingCategory.value = null
    } else {
      if (categoryStore.categories.some((cat) => cat.name === event.data.name.trim())) {
        error.value = 'Category name already exists'
        return
      }

      await categoryStore.addCategory(event.data.name)
    }
    state.name = ''
    await updateCategories()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}

const startEditCategory = (cat: Category) => {
  error.value = ''
  editingCategory.value = cat
  state.name = cat.name
}

const cancelEdit = () => {
  error.value = ''
  editingCategory.value = null
  state.name = ''
}

const deleteCategory = async (cat: Category) => {
  error.value = ''
  try {
    await categoryStore.deleteCategory(cat.id)
    await updateCategories()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}

const validate = (state: Partial<{ name: string }>): FormError[] => {
  const errors = []
  if (!state.name) errors.push({ name: 'name', message: 'Required' })
  return errors
}

onMounted(updateCategories)
</script>

<template>
  <UForm
    :validate="validate"
    :state="state"
    class="flex flex-row gap-2"
    @submit="addOrUpdateCategory"
  >
    <UFormField name="name" class="grow">
      <UInput v-model="state.name" placeholder="Category name" required class="w-full" />
    </UFormField>

    <div>
      <div class="flex flex-row gap-2">
        <UButton v-if="editingCategory" variant="outline" icon="maki:cross" @click="cancelEdit" />
        <UButton type="submit" :icon="editingCategory ? 'ci:arrow-reload-02' : 'ci:add-plus'">
          {{ editingCategory ? 'Update' : 'Add' }}
        </UButton>
      </div>
    </div>
  </UForm>
  <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
  <ul class="mt-4">
    <li
      v-for="cat in categoryStore.categories"
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
