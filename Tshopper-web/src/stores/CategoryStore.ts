import { defineStore } from 'pinia'
import type { Category, ItemCategory } from '../types'
import { useAuthStore } from './AuthStore'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [] as Category[],
    itemCategories: [] as ItemCategory[],
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

    async getItemCategories() {
      const authStore = useAuthStore()
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ItemCategory`, {
        headers: { Authorization: `Bearer ${authStore.token}` },
      })
      if (!response.ok) throw new Error('Failed to fetch item categories')
      const data = await response.json()
      this.itemCategories = data
      return data
    },

    async updateItemCategory(itemName: string, categoryId: number) {
      const authStore = useAuthStore()
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ItemCategory`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({ itemName, categoryId }),
      })
      if (!response.ok) throw new Error('Failed to update item category')
    },

    async deleteItemCategory(id: number) {
      const authStore = useAuthStore()
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ItemCategory/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authStore.token}` },
      })
      if (!response.ok) throw new Error('Failed to delete item category')
    },
  },
})
