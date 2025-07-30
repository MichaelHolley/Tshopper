<script lang="ts" setup>
import { useAuthStore } from '@/stores/AuthStore'
import { useShoppingListStore } from '@/stores/ShoppingListStore'
import { exportToCsvFile } from '@/utils/csv-export'
import { computed, ref } from 'vue'

const name = ref('')
const file = ref<File | null>(null)

const shoppingListStore = useShoppingListStore()

const hasItems = computed(() => shoppingListStore.items.length > 0)

const exportCsv = () => {
  exportToCsvFile(shoppingListStore.items, 'shopping-list.csv')
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    file.value = target.files[0]
  }
}

const submitForm = async () => {
  const formData = new FormData()
  formData.append('name', name.value)
  if (file.value) {
    formData.append('file', file.value)
  }

  try {
    const authStore = useAuthStore()

    const response = await fetch(`${import.meta.env.VITE_API_URL}/Import`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    alert('Form submitted successfully!')
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('Error submitting form.')
  }
}
</script>

<template>
  <div class="flex flex-row gap-4 items-center mb-8">
    <p>Export your data</p>
    <UButton icon="tabler:file-arrow-right" @click="exportCsv" :disabled="!hasItems">
      Export
    </UButton>
  </div>
  <form class="flex flex-col gap-2" @submit.prevent="submitForm">
    <div class="flex flex-row gap-4 justify-between items-center">
      <p>Import</p>
      <UInput type="file" accept=".csv" @change="handleFileUpload" />
    </div>
    <div class="flex flex-row justify-end">
      <UButton type="submit" icon="tabler:file-upload" :disabled="!file">Import</UButton>
    </div>
  </form>
</template>
