<script lang="ts" setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/AuthStore'
import { useShoppingListStore } from './stores/ShoppingListStore'
import { useStoreStore } from './stores/StoreStore'
import SideDrawer from './components/SideDrawer.vue'

const route = useRoute()

const shoppingListStore = useShoppingListStore()
const authStore = useAuthStore()
const storeStore = useStoreStore()

const drawerOpen = ref(false)

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      console.info('🚀 User authenticated - initializing stores')
      shoppingListStore.initializeConnection()
      storeStore.getStores()
    } else {
      shoppingListStore.disconnect()
      drawerOpen.value = false
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  shoppingListStore.disconnect()
})

const isLogin = computed(() => route.path == '/login')
</script>

<template>
  <UApp>
    <SideDrawer :open="drawerOpen && !isLogin" @close="drawerOpen = false" />
    <div class="container mx-auto max-w-lg h-svh flex flex-col px-2">
      <NavBar class="mb-2 mt-1" @open-drawer="drawerOpen = true" />
      <div class="grow overflow-y-auto">
        <RouterView />
      </div>
    </div>
  </UApp>
</template>
