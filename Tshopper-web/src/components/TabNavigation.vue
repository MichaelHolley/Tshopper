<script lang="ts" setup>
import { useCategoryStore } from '@/stores/CategoryStore'
import { useShoppingListStore } from '@/stores/ShoppingListStore'
import type { TabsItem } from '@nuxt/ui'
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const shoppingListStore = useShoppingListStore()
const categoryStore = useCategoryStore()

const navItems = [
  {
    label: 'Shopping List',
    value: '/',
    description: 'Manage your shopping list',
    icon: 'tabler:shopping-cart',
    slot: 'shoppinglist' as const,
  },
  // {
  //   label: 'Categories',
  //   value: '/categories',
  //   description: 'Manage your categories',
  //   icon: 'tabler:category',
  //   slot: 'categories' as const,
  //   disabled: true,
  // },
  {
    label: 'Data Transfer',
    value: '/data',
    description: 'Export & Import your data',
    icon: 'tabler:file-arrow-right',
    slot: 'data' as const,
  },
] satisfies TabsItem[]

const activeTab = computed({
  get() {
    return (route.path as string) || '/'
  },
  set(tab) {
    router.push({
      path: `${tab}`,
    })
  },
})

const handleVisibilityChange = () => {
  if (shoppingListStore.connectionState === 'Disconnected') {
    alert('Not connected to Backend-Service')
  }
}

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)

  shoppingListStore.initializeConnection()
  categoryStore.getCategories()
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)

  shoppingListStore.disconnect()
})
</script>

<template>
  <UTabs
    v-model="activeTab"
    variant="link"
    :items="navItems"
    class="gap-4 w-full"
    :ui="{ trigger: 'grow' }"
  >
  </UTabs>
</template>
