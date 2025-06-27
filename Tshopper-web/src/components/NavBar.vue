<script setup lang="ts">
import { useShoppingListStore } from '@/stores/ShoppingListStore'
import type { TabsItem } from '@nuxt/ui'
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const store = useShoppingListStore()
const route = useRoute()
const router = useRouter()

const checked = computed(() => store.items.filter((item) => item.checked).length)
const showInfo = computed(() => store.items?.length > 0)

onMounted(() => {
  store.initializeConnection()
})

onUnmounted(() => {
  store.disconnect()
})

const navItems = [
  {
    label: 'Shopping List',
    value: '/',
    description: 'Manage your shopping list',
    icon: 'tabler:shopping-cart',
    slot: 'shoppinglist' as const,
  },
  {
    label: 'Categories',
    value: '/categories',
    description: 'Manage your categories',
    icon: 'tabler:category',
    slot: 'categories' as const,
    disabled: true,
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
</script>

<template>
  <div class="flex justify-between items-center gap-2 py-1">
    <div><h1 class="text-2xl font-bold text-primary-400">Tshopper</h1></div>
    <div
      v-if="store.isDisconnected"
      v-show="route.path != '/login'"
      @click="store.reconnect()"
      class="cursor-pointer"
    >
      <span class="text-sm text-neutral-500">Reconnect</span>
    </div>
    <div v-if="showInfo">
      <span class="text-sm text-neutral-500">{{ checked }}/{{ store.items.length }}</span>
    </div>
  </div>
  <UTabs
    v-model="activeTab"
    variant="link"
    :items="navItems"
    class="gap-4 w-full"
    :ui="{ trigger: 'grow' }"
  >
  </UTabs>
</template>
