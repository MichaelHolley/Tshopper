import type { ShoppingItem } from '@/types'
import type { HubConnection } from '@microsoft/signalr'
import { HubConnectionBuilder } from '@microsoft/signalr'
import { defineStore } from 'pinia'
import { useAuthStore } from './AuthStore'
import { useRouter } from 'vue-router'

type ConnectionState = 'Disconnected' | 'Connecting' | 'Connected'

export const useShoppingListStore = defineStore('shoppingList', {
  state: () => ({
    items: [] as ShoppingItem[],
    connection: null as HubConnection | null,
    connectionState: 'Disconnected' as ConnectionState,
    sortMode: false,
  }),

  getters: {
    isDisconnected: (state) => state.connectionState === 'Disconnected',
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

      this.connection.onclose(() => {
        this.connectionState = 'Disconnected'
      })

      this.connection.onreconnecting(() => {
        this.connectionState = 'Connecting'
      })

      this.connection.onreconnected(() => {
        this.connectionState = 'Connected'
      })

      this.connection.on('ReceiveUpdate', (items) => {
        console.log('🆕 New Update:', items)
        this.items = items
      })

      try {
        this.connectionState = 'Connecting'
        await this.connection.start()
        this.connectionState = 'Connected'
        console.log('✅ SignalR Connected!')
        await this.getAllItems()
      } catch (err) {
        console.error('❌ SignalR Connection Error:', err)
        this.connectionState = 'Disconnected'
      }
    },

    async reconnect() {
      if (!this.connection) return

      try {
        await this.connection.start()
        console.log('✅ SignalR Reconnected!')
        this.connectionState = 'Connected'
        await this.getAllItems()
      } catch (error) {
        console.error('❌ Reconnection failed:', error)
      }
    },

    async disconnect() {
      if (this.connection) {
        try {
          await this.connection.stop()
          this.connectionState = 'Disconnected'
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
        console.log('✅ Item Added!')
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
        console.log('✅ Item Updated!')
        return true
      } catch (err) {
        console.error('❌ Error updating item:', err)
        return false
      }
    },

    async reorderItems(orderedItemIds: number[]): Promise<boolean> {
      try {
        await this.connection?.invoke('ReorderItems', orderedItemIds)
        console.log('✅ Items Reordered!')
        return true
      } catch (err) {
        console.error('❌ Error reordering items:', err)
        return false
      }
    },

    toggleSortMode() {
      this.sortMode = !this.sortMode
    },
  },
})
