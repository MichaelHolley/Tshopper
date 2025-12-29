import type { ShoppingItem } from '@/types'
import type { HubConnection } from '@microsoft/signalr'
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr'
import { defineStore } from 'pinia'
import { useAuthStore } from './AuthStore'
import { useRouter } from 'vue-router'

export const useShoppingListStore = defineStore('shoppingList', {
  state: () => ({
    items: [] as ShoppingItem[],
    connection: null as HubConnection | null,
  }),

  getters: {
    isConnected: (state) => state.connection?.state === HubConnectionState.Connected,
  },

  actions: {
    async initializeConnection() {
      const authStore = useAuthStore()
      const router = useRouter()

      const validToken = await authStore.validateToken()
      if (!validToken) {
        authStore.logout()
        router.push('/login')
        return
      }

      this.connection = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/ShoppingList`, {
          accessTokenFactory: () => {
            if (!authStore.token) {
              throw new Error('No authentication token available')
            }

            return authStore.token
          },
        })
        .withAutomaticReconnect()
        .build()

      this.connection.on('ReceiveUpdate', (items) => {
        console.log('🆕 New Update:', items)
        this.items = items
      })

      try {
        await this.connection.start()
        console.log('✅ SignalR Connected!')
        await this.getAllItems()
      } catch (err) {
        console.error('❌ SignalR Connection Error:', err)
      }
    },

    async reconnect() {
      if (!this.connection) return

      try {
        await this.connection.start()
        console.log('✅ SignalR Reconnected!')
        await this.getAllItems()
      } catch (error) {
        console.error('❌ Reconnection failed:', error)
      }
    },

    async disconnect() {
      if (this.connection) {
        try {
          await this.connection.stop()
          console.log('✅ SignalR Disconnected!')
        } catch (err) {
          console.error('❌ Error disconnecting SignalR:', err)
        }
      }
    },

    async getAllItems() {
      try {
        const items = await this.connection?.invoke('GetAllItems')
        this.items = items
      } catch (err) {
        console.error('❌ Error fetching items:', err)
      }
    },

    async addItem(item: string, quantity: string) {
      try {
        await this.connection?.invoke('AddItem', item, quantity)
        return true
      } catch (err) {
        console.error('❌ Error adding item:', err)
        return false
      }
    },

    async checkItem(itemId: number) {
      try {
        await this.connection?.invoke('CheckItem', itemId)
      } catch (err) {
        console.error('❌ Error checking item:', err)
      }
    },

    async uncheckItem(itemId: number) {
      try {
        await this.connection?.invoke('UncheckItem', itemId)
      } catch (err) {
        console.error('❌ Error unchecking item:', err)
      }
    },

    async toggleItem(itemId: number) {
      const item = this.items.find((i) => i.id === itemId)
      if (!item) return

      if (item.checked) {
        await this.uncheckItem(itemId)
      } else {
        await this.checkItem(itemId)
      }
    },

    async deleteItem(itemId: number) {
      try {
        await this.connection?.invoke('DeleteItem', itemId)
      } catch (err) {
        console.error('❌ Error deleting item:', err)
      }
    },

    async deleteAllCheckedItems() {
      try {
        await this.connection?.invoke('DeleteAllCheckedItems')
      } catch (err) {
        console.error('❌ Error deleting items:', err)
      }
    },

    async updateItem(itemId: number, item: string, quantity: string) {
      try {
        await this.connection?.invoke('UpdateItem', itemId, item, quantity)
        return true
      } catch (err) {
        console.error('❌ Error updating item:', err)
        return false
      }
    },

    async reorderItems(orderedItemIds: number[]): Promise<boolean> {
      try {
        await this.connection?.invoke('ReorderItems', orderedItemIds)
        return true
      } catch (err) {
        console.error('❌ Error reordering items:', err)
        return false
      }
    },
  },
})
