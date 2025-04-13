<script setup lang="ts">
import { useAuthStore } from "~/stores/AuthStore";

const authStore = useAuthStore();
</script>

<template>
  <UApp>
    <div class="container mx-auto px-2">
      <NavBar class="mb-2" />
      <ShoppingList v-if="authStore.isAuthenticated" />
      <LoginForm v-else />
      <NuxtRouteAnnouncer />
    </div>
  </UApp>
</template>
