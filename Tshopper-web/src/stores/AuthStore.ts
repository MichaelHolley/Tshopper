import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('auth_token') as string | null,
  }),

  actions: {
    async authenticate(password: string) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/Auth/Login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        })

        if (!response.ok) {
          throw new Error('Authentication failed')
        }

        const data = await response.json()
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/Auth/Validate`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            this.logout()
          }
          return false
        }

        return true
      } catch (error) {
        console.error('Token validation error:', error)
        this.logout()

        return false
      }
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
  },
})
