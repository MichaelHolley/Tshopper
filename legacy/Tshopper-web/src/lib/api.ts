import ky from 'ky'
import { useAuthStore } from '@/stores/AuthStore'

export const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const authStore = useAuthStore()
        if (authStore.token) {
          request.headers.set('Authorization', `Bearer ${authStore.token}`)
        }
      },
    ],
    afterResponse: [
      (_request, _options, response) => {
        if (response.status === 401) {
          useAuthStore().logout()
        }
      },
    ],
  },
})
