import type { ShoppingItem } from '@/types'
import type { HubConnection } from '@microsoft/signalr'
import { HubConnectionBuilder } from '@microsoft/signalr'
import { defineStore } from 'pinia'
import { useAuthStore } from './AuthStore'
import { useRouter } from 'vue-router'
import { addLog } from '@/utils/action-logger'

type ConnectionState = 'Disconnected' | 'Connecting' | 'Connected'

export const useShoppingListStore = defineStore('shoppingList', {
  state: () => ({
    items: [] as ShoppingItem[],
    connection: null as HubConnection | null,
    connectionState: 'Disconnected' as ConnectionState,
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
        addLog('initializeConnection', 'Connection failed: Invalid token', 'error')
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
        addLog('connection', 'Connection closed', 'info')
      })

      this.connection.onreconnecting(() => {
        this.connectionState = 'Connecting'
        addLog('connection', 'Reconnecting...', 'info')
      })

      this.connection.onreconnected(() => {
        this.connectionState = 'Connected'
        addLog('connection', 'Reconnected successfully', 'success')
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
        addLog('initializeConnection', 'Connection initialized successfully', 'success')
        await this.getAllItems()
      } catch (err) {
        console.error('❌ SignalR Connection Error:', err)
        this.connectionState = 'Disconnected'
        addLog('initializeConnection', `Connection error: ${err}`, 'error')
      }
    },

    async reconnect() {
      if (!this.connection) return

      try {
        await this.connection.start()
        console.log('✅ SignalR Reconnected!')
        this.connectionState = 'Connected'
        addLog('reconnect', 'Manually reconnected successfully', 'success')
        await this.getAllItems()
      } catch (error) {
        console.error('❌ Reconnection failed:', error)
        addLog('reconnect', `Reconnection failed: ${error}`, 'error')
      }
    },

    async disconnect() {
      if (this.connection) {
        try {
          await this.connection.stop()
          this.connectionState = 'Disconnected'
          console.log('✅ SignalR Disconnected!')
          addLog('disconnect', 'Disconnected successfully', 'success')
        } catch (err) {
          console.error('❌ Error disconnecting SignalR:', err)
          addLog('disconnect', `Disconnect error: ${err}`, 'error')
        }
      }
    },

    async getAllItems() {
      try {
        const items = await this.connection?.invoke('GetAllItems')
        this.items = items
        addLog('getAllItems', `Fetched ${items?.length || 0} items`, 'success')
      } catch (err) {
        addLog('getAllItems', `Error fetching items: ${err}`, 'error')
      }
    },

    async addItem(item: string, quantity: string) {
      try {
        await this.connection?.invoke('AddItem', item, quantity)
        addLog('addItem', `Added: ${item} (qty: ${quantity})`, 'success')
        return true
      } catch (err) {
        addLog('addItem', `Error adding ${item}: ${err}`, 'error')
        return false
      }
    },

    async checkItem(itemId: number) {
      try {
        await this.connection?.invoke('CheckItem', itemId)
        addLog('checkItem', `Checked item #${itemId}`, 'success')
      } catch (err) {
        addLog('checkItem', `Error checking item #${itemId}: ${err}`, 'error')
      }
    },

    async uncheckItem(itemId: number) {
      try {
        await this.connection?.invoke('UncheckItem', itemId)
        addLog('uncheckItem', `Unchecked item #${itemId}`, 'success')
      } catch (err) {
        addLog('uncheckItem', `Error unchecking item #${itemId}: ${err}`, 'error')
      }
    },

    async deleteItem(itemId: number) {
      try {
        await this.connection?.invoke('DeleteItem', itemId)
        addLog('deleteItem', `Deleted item #${itemId}`, 'success')
      } catch (err) {
        addLog('deleteItem', `Error deleting item #${itemId}: ${err}`, 'error')
      }
    },

    async deleteAllCheckedItems() {
      try {
        await this.connection?.invoke('DeleteAllCheckedItems')
        addLog('deleteAllCheckedItems', 'Deleted all checked items', 'success')
      } catch (err) {
        addLog('deleteAllCheckedItems', `Error deleting checked items: ${err}`, 'error')
      }
    },

    async updateItem(itemId: number, item: string, quantity: string) {
      try {
        await this.connection?.invoke('UpdateItem', itemId, item, quantity)
        addLog('updateItem', `Updated item #${itemId}: ${item} (qty: ${quantity})`, 'success')
        return true
      } catch (err) {
        addLog('updateItem', `Error updating item #${itemId}: ${err}`, 'error')
        return false
      }
    },
  },
})
