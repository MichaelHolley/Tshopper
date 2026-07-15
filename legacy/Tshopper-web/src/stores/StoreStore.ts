import { defineStore } from 'pinia'
import type { Store } from '@/types'
import { api } from '@/lib/api'

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
      try {
        const data = await api.get('Store').json<Store[]>()
        this.stores = data
        return data
      } catch (err) {
        console.error('❌ Error fetching stores:', err)
        return []
      }
    },

    async addStore(name: string, color: string) {
      try {
        const created = await api.post('Store', { json: { name, color } }).json<Store>()
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
      try {
        await api.put(`Store/${id}`, { json: { id, name, color } })
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
      try {
        await api.delete(`Store/${id}`)
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
