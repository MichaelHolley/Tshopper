<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

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
