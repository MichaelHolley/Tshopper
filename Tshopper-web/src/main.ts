import './assets/main.css'

import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import ui from '@nuxt/ui/vue-plugin'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { useAuthStore } from './stores/AuthStore'

const app = createApp(App)

const router = createRouter({
  routes: [
    { path: '/login', component: () => import('./views/LoginView.vue') },
    { path: '/', component: () => import('./views/ShoppingListView.vue') },
    // { path: '/categories', component: () => import('./views/CategoriesView.vue') },
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
app.use(autoAnimatePlugin)
app.use(router)
app.use(ui)

app.mount('#app')
