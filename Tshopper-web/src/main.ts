import './assets/main.css'

import ui from '@nuxt/ui/vue-plugin'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/AuthStore'

const app = createApp(App)

const router = createRouter({
  routes: [
    { path: '/login', component: () => import('./views/LoginForm.vue') },
    { path: '/', component: () => import('./views/ShoppingList.vue') },
  ],
  history: createWebHistory(),
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated && to.path !== '/login') {
    return '/login'
  }
})

app.use(createPinia())
app.use(router)
app.use(ui)

app.mount('#app')
