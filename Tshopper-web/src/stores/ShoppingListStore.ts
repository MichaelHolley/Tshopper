import type { ShoppingItem } from '@/types'
import type { HubConnection } from '@microsoft/signalr'
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr'
import { defineStore } from 'pinia'
import { useAuthStore } from './AuthStore'
import { useStoreStore } from './StoreStore'
import { useRouter } from 'vue-router'

export const useShoppingListStore = defineStore('shoppingList', {
  state: () => ({
    items: [] as ShoppingItem[],
    connection: null as HubConnection | null,
    connectionState: HubConnectionState.Connecting,
    statePollingInterval: null as number | null,
  }),

  getters: {
    isConnected: (state) => state.connectionState === HubConnectionState.Connected,
    isConnecting: (state) =>
      state.connectionState === HubConnectionState.Connecting ||
      state.connectionState === HubConnectionState.Reconnecting,
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

      this.connection.on('ReceiveUpdate', (storeId: number | null, items: ShoppingItem[]) => {
        const storeStore = useStoreStore()
        if (storeId === storeStore.activeStoreId) {
          this.items = items
        }
      })

      if (this.statePollingInterval !== null) {
        clearInterval(this.statePollingInterval)
      }

      this.statePollingInterval = window.setInterval(() => {
        this.connectionState = this.connection?.state || HubConnectionState.Disconnected
      }, 250)

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
      if (this.statePollingInterval !== null) {
        clearInterval(this.statePollingInterval)
        this.statePollingInterval = null
      }

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
      const storeStore = useStoreStore()
      try {
        const items = await this.connection?.invoke('GetAllItems', storeStore.activeStoreId)
        this.items = items
      } catch (err) {
        console.error('❌ Error fetching items:', err)
      }
    },

    async addItem(item: string, quantity: string) {
      const storeStore = useStoreStore()
      try {
        await this.connection?.invoke('AddItem', item, quantity, storeStore.activeStoreId)
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
      const storeStore = useStoreStore()
      try {
        await this.connection?.invoke('DeleteItem', itemId, storeStore.activeStoreId)
      } catch (err) {
        console.error('❌ Error deleting item:', err)
      }
    },

    async deleteAllCheckedItems() {
      const storeStore = useStoreStore()
      try {
        await this.connection?.invoke('DeleteAllCheckedItems', storeStore.activeStoreId)
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
      const storeStore = useStoreStore()
      try {
        await this.connection?.invoke('ReorderItems', orderedItemIds, storeStore.activeStoreId)
        return true
      } catch (err) {
        console.error('❌ Error reordering items:', err)
        return false
      }
    },

    async moveItemToStore(itemId: number, targetStoreId: number | null): Promise<boolean> {
      const storeStore = useStoreStore()
      try {
        await this.connection?.invoke('MoveItemToStore', itemId, targetStoreId, storeStore.activeStoreId)
        return true
      } catch (err) {
        console.error('❌ Error moving item to store:', err)
        return false
      }
    },

    async setActiveStore(id: number | null) {
      const storeStore = useStoreStore()
      storeStore.setActiveStore(id)
      this.items = []
      await this.getAllItems()
    },
  },
})
