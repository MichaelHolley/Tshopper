import { defineStore } from 'pinia'
import type { Category } from '../types'
import { useAuthStore } from './AuthStore'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [] as Category[],
  }),
  actions: {
    async getCategories() {
      const authStore = useAuthStore()
      const response = await fetch(`${import.meta.env.VITE_API_URL}/Category`, {
        headers: { Authorization: `Bearer ${authStore.token}` },
      })
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      this.categories = data
      return data
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
