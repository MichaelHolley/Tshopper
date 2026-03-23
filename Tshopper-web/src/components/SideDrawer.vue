<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'
import { useShoppingListStore } from '@/stores/ShoppingListStore'
import { useRouter } from 'vue-router'
import StoreNav from './StoreNav.vue'
import ManageStoresModal from './ManageStoresModal.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const authStore = useAuthStore()
const shoppingListStore = useShoppingListStore()
const router = useRouter()

const manageStoresOpen = ref(false)

function openManageStores() {
  manageStoresOpen.value = true
}

function closeManageStores() {
  manageStoresOpen.value = false
}

function logout() {
  shoppingListStore.disconnect()
  authStore.logout()
  router.push('/login')
  emit('close')
}
</script>

<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div
      v-if="open"
      class="fixed inset-0 z-40 bg-black/50"
      @click="emit('close')"
    />
  </Transition>

  <!-- Drawer panel -->
  <Transition name="drawer">
    <div
      v-if="open"
      class="fixed top-0 left-0 z-50 h-full w-72 bg-neutral-900 border-r border-neutral-800 flex flex-col shadow-2xl"
    >
      <!-- Drawer header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <h2 class="text-lg font-bold text-primary">Tshopper</h2>
        <UButton
          variant="ghost"
          color="neutral"
          icon="tabler:x"
          size="sm"
          @click="emit('close')"
        />
      </div>

      <!-- Store & navigation list -->
      <div class="flex-1 overflow-y-auto px-3 py-4">
        <StoreNav @close="emit('close')" />
      </div>

      <!-- Drawer footer: manage stores + logout -->
      <div class="border-t border-neutral-800 px-3 py-3 flex flex-col gap-1">
        <button
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors w-full text-left"
          @click="openManageStores"
        >
          <UIcon name="tabler:building-store" class="size-4 flex-shrink-0" />
          <span>Manage Stores</span>
        </button>
        <button
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:bg-neutral-800 hover:text-red-400 transition-colors w-full text-left"
          @click="logout"
        >
          <UIcon name="tabler:logout" class="size-4 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  </Transition>

  <!-- Manage Stores modal (rendered outside the drawer stacking context) -->
  <ManageStoresModal :open="manageStoresOpen" @close="closeManageStores" />
</template>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(-100%);
}
</style>
