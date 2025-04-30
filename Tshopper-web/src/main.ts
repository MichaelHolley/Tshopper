import './assets/main.css'

import ui from '@nuxt/ui/vue-plugin'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'

const app = createApp(App)

const router = createRouter({
  routes: [
    { path: '/login', component: () => import('./components/LoginForm.vue') },
    { path: '/', component: () => import('./components/ShoppingList.vue') },
  ],
  history: createWebHistory(),
})

app.use(createPinia())
app.use(router)
app.use(ui)

app.mount('#app')
