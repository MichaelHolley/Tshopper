import { defineStore } from 'pinia'
import { api } from '@/lib/api'

export interface UserPreferences {
  defaultStoreId: number | null
}

export const usePreferencesStore = defineStore('preferences', {
  state: (): UserPreferences => ({
    defaultStoreId: null,
  }),

  actions: {
    async getPreferences() {
      try {
        const data = await api.get('Preferences').json<UserPreferences>()
        this.defaultStoreId = data.defaultStoreId
        return data
      } catch (err) {
        console.error('❌ Error fetching preferences:', err)
        return null
      }
    },

    async updatePreferences(patch: Partial<UserPreferences>) {
      try {
        const updated = await api
          .put('Preferences', { json: { ...this.$state, ...patch } })
          .json<UserPreferences>()
        this.defaultStoreId = updated.defaultStoreId
        return updated
      } catch (err) {
        console.error('❌ Error updating preferences:', err)
        return null
      }
    },
  },
})
