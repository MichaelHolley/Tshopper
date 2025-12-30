<script lang="ts" setup>
import { computed, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/AuthStore'
import { useCategoryStore } from './stores/CategoryStore'
import { useShoppingListStore } from './stores/ShoppingListStore'

const route = useRoute()

const shoppingListStore = useShoppingListStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()

// Initialize stores when user authenticates
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      console.info('🚀 User authenticated - initializing stores')
      shoppingListStore.initializeConnection()
      categoryStore.getCategories()
    } else {
      shoppingListStore.disconnect()
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
    <div class="container mx-auto max-w-lg h-svh flex flex-col px-2">
      <NavBar class="mb-2 mt-1" />
      <div class="grow overflow-y-auto">
        <RouterView />
      </div>
      <TabNavigation v-if="!isLogin" />
    </div>
  </UApp>
</template>
