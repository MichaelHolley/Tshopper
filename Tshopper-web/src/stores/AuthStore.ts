import { defineStore } from 'pinia'
import ky from 'ky'

// Use a base ky instance without auth hooks to avoid circular dependency with api.ts
const authApi = ky.create({ prefixUrl: import.meta.env.VITE_API_URL })

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('auth_token') as string | null,
  }),

  actions: {
    async authenticate(password: string) {
      try {
        const data = await authApi.post('Auth/Login', { json: { password } }).json<{ token: string }>()
        this.setToken(data.token)
        return true
      } catch (error) {
        console.error('❌ Authentication Error:', error)
        return false
      }
    },

    setToken(token: string | null) {
      this.token = token
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    },

    logout() {
      this.setToken(null)
    },

    async validateToken() {
      if (!this.token) return false

      try {
        await authApi.get('Auth/Validate', {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        return true
      } catch (error) {
        console.error('❌ Token validation error:', error)
        this.logout()
        return false
      }
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
  },
})
