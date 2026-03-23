import { defineStore } from 'pinia'
import type { Store } from '@/types'
import { useAuthStore } from './AuthStore'

export const useStoreStore = defineStore('store', {
  state: () => ({
    stores: [] as Store[],
    activeStoreId: null as number | null,
  }),

  getters: {
    activeStore: (state): Store | null =>
      state.stores.find((s) => s.id === state.activeStoreId) ?? null,
  },

  actions: {
    async getStores() {
      const authStore = useAuthStore()
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/Store`, {
          headers: { Authorization: `Bearer ${authStore.token}` },
        })
        if (!response.ok) throw new Error('Failed to fetch stores')
        const data: Store[] = await response.json()
        this.stores = data
        return data
      } catch (err) {
        console.error('❌ Error fetching stores:', err)
        return []
      }
    },

    async addStore(name: string, color: string) {
      const authStore = useAuthStore()
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/Store`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({ name, color }),
        })
        if (!response.ok) throw new Error('Failed to add store')
        const created: Store = await response.json()
        this.stores.push(created)
        this.stores.sort((a, b) => a.name.localeCompare(b.name))
        console.log('✅ Store added!')
        return created
      } catch (err) {
        console.error('❌ Error adding store:', err)
        return null
      }
    },

    async updateStore(id: number, name: string, color: string) {
      const authStore = useAuthStore()
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/Store/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({ id, name, color }),
        })
        if (!response.ok) throw new Error('Failed to update store')
        const idx = this.stores.findIndex((s) => s.id === id)
        if (idx !== -1) {
          this.stores[idx] = { id, name, color }
          this.stores.sort((a, b) => a.name.localeCompare(b.name))
        }
        console.log('✅ Store updated!')
        return true
      } catch (err) {
        console.error('❌ Error updating store:', err)
        return false
      }
    },

    async deleteStore(id: number) {
      const authStore = useAuthStore()
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/Store/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authStore.token}` },
        })
        if (!response.ok) throw new Error('Failed to delete store')
        this.stores = this.stores.filter((s) => s.id !== id)
        if (this.activeStoreId === id) {
          this.activeStoreId = null
        }
        console.log('✅ Store deleted!')
        return true
      } catch (err) {
        console.error('❌ Error deleting store:', err)
        return false
      }
    },

    setActiveStore(id: number | null) {
      this.activeStoreId = id
    },
  },
})
