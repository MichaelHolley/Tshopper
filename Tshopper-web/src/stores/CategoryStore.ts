import { defineStore } from 'pinia'
import { useAuthStore } from './AuthStore'

export const useCategoryStore = defineStore('category', {
  actions: {
    async fetchCategories() {
      const authStore = useAuthStore()
      const response = await fetch(`${import.meta.env.VITE_API_URL}/Category`, {
        headers: { Authorization: `Bearer ${authStore.token}` },
      })
      if (!response.ok) throw new Error('Failed to fetch categories')
      return await response.json()
    },
    async addCategory(name: string) {
      const authStore = useAuthStore()
      const response = await fetch(`${import.meta.env.VITE_API_URL}/Category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({ name }),
      })
      if (!response.ok) throw new Error('Failed to add category')
    },
    async updateCategory(id: number, name: string) {
      const authStore = useAuthStore()
      const response = await fetch(`${import.meta.env.VITE_API_URL}/Category/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({ id, name }),
      })
      if (!response.ok) throw new Error('Failed to update category')
    },
    async deleteCategory(id: number) {
      const authStore = useAuthStore()
      const response = await fetch(`${import.meta.env.VITE_API_URL}/Category/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authStore.token}` },
      })
      if (!response.ok) throw new Error('Failed to delete category')
    },
  },
})
