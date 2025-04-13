<script setup lang="ts">
import { useAuthStore } from "~/stores/useAuthStore";

const authStore = useAuthStore();

const authenticate = async (password: string) => {
  const isAuthenticated = await authStore.authenticate(password);
  if (!isAuthenticated) {
    console.error("❌ Failed to authenticate");
    return;
  }
};
</script>

<template>
  <UApp>
    <div class="container mx-auto px-2">
      <NavBar class="mb-2" />
      <ShoppingList v-if="authStore.isAuthenticated" />
      <LoginForm v-else @login="authenticate" />
      <NuxtRouteAnnouncer />
    </div>
  </UApp>
</template>
