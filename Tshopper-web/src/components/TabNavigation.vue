<script lang="ts" setup>
import type { TabsItem } from '@nuxt/ui'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

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
  <UTabs
    v-model="activeTab"
    variant="link"
    :items="navItems"
    class="gap-4 w-full"
    :ui="{ trigger: 'grow' }"
  >
  </UTabs>
</template>
