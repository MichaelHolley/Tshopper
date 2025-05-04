import { defineStore } from 'pinia'
import type { HubConnection } from '@microsoft/signalr'
import { HubConnectionBuilder } from '@microsoft/signalr'
import { useAuthStore } from './AuthStore'
import type { ShoppingItem } from '@/types'

export const useShoppingListStore = defineStore('shoppingList', {
  state: () => ({
    items: [] as ShoppingItem[],
    connection: null as HubConnection | null,
  }),

  actions: {
    async initializeConnection() {
      const authStore = useAuthStore()

      this.connection = new HubConnectionBuilder()
        .withUrl(`/api/ShoppingList`, {
          accessTokenFactory: () => authStore.token!,
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

    async getAllItems() {
      try {
        const items = await this.connection?.invoke('GetAllItems')
        this.items = items
      } catch (err) {
        console.error('❌ Error fetching items:', err)
      }
    },

    async addItem(item: string, amount: string) {
      try {
        await this.connection?.invoke('AddItem', item, amount)
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
  },
})
