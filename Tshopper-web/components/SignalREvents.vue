<script setup lang="ts">
import type { HubConnection } from "@microsoft/signalr";
import { inject, ref, onMounted } from "vue";

const shoppingList = ref<{ id: number; item: string; quantity: number }[]>([]);
const signalr: HubConnection | undefined = inject("signalr");

onMounted(() => {
  if (signalr) {
    signalr.on("ReceiveUpdate", (item) => {
      console.log("🆕 New Update:", item);
      shoppingList.value.push(item); // Add new item to the list
    });
  }
});
</script>

<template>
  <div>
    <h2>🛒 Shopping List</h2>
    <ul>
      <li v-for="item in shoppingList" :key="item.id">
        {{ item.item }} (x{{ item.quantity }})
      </li>
    </ul>
  </div>
</template>
