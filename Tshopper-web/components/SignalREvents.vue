<script setup lang="ts">
import type { HubConnection } from "@microsoft/signalr";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { onMounted, ref } from "vue";

interface ShoppingItem {
  id: number;
  item: string;
  quantity: number;
  checked: boolean;
}

const shoppingList = ref<ShoppingItem[]>([]);
const conn = ref<HubConnection | null>(null);
const inputItem = ref("");
const inputAmount = ref(1);

const addItem = () => {
  conn.value
    ?.invoke("AddItem", inputItem.value, inputAmount.value)
    .then(() => {
      console.log("✅ Item Added!");
      inputItem.value = "";
      inputAmount.value = 1;
    })
    .catch((err) => console.error("❌ Error adding item:", err));
};

const checkItem = (itemId: number) => {
  conn.value
    ?.invoke("CheckItem", itemId)
    .then((result) => {
      console.log("✅ Item Checked:", result);
    })
    .catch((err) => console.error("❌ Error checking item:", err));
};

const uncheckItem = (itemId: number) => {
  conn.value
    ?.invoke("UncheckItem", itemId)
    .then((result) => {
      console.log("✅ Item Unchecked:", result);
    })
    .catch((err) => console.error("❌ Error unchecking item:", err));
};

const toggleItem = (item: ShoppingItem) => {
  if (item.checked) {
    uncheckItem(item.id);
  } else {
    checkItem(item.id);
  }
};

onMounted(() => {
  const connection: HubConnection = new HubConnectionBuilder()
    .withUrl(`http://localhost:5157/shoppingListHub`)
    .withAutomaticReconnect()
    .build();

  conn.value = connection;

  connection.on("ReceiveUpdate", (items) => {
    console.log("🆕 New Update:", items);
    shoppingList.value = items;
  });

  connection
    .start()
    .then(() => {
      console.log("✅ SignalR Connected!");

      connection
        .invoke("GetAllItems")
        .then((items) => {
          shoppingList.value = items;
        })
        .catch((err) => console.error("❌ Error fetching items:", err));
    })
    .catch((err) => console.error("❌ SignalR Connection Error:", err));
});
</script>

<template>
  <div>
    <h2>Shopping List</h2>
    <ul>
      <li v-for="item in shoppingList" :key="item.id" @click="toggleItem(item)">
        <span>{{ item.item }}</span> - <span>x{{ item.quantity }}</span
        ><span>{{ item.checked ? "✅" : "" }}</span>
      </li>
    </ul>
  </div>
  <div>
    <input v-model="inputItem" type="text" required placeholder="Item" />
    <input
      v-model="inputAmount"
      type="number"
      min-value="1"
      required
      placeholder="Amount"
    />
    <button @click="addItem">Add</button>
  </div>
</template>
