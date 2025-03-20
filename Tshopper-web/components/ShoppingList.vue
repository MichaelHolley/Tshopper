<script setup lang="ts">
import type { HubConnection } from "@microsoft/signalr";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { onMounted, ref } from "vue";
import type { FormError, FormSubmitEvent } from "@nuxt/ui";
import type { ItemFormState, ShoppingItem } from "./types";

const shoppingList = ref<ShoppingItem[]>([]);
const conn = ref<HubConnection | null>(null);

const state = reactive<ItemFormState>({
  item: "",
  amount: 1,
});

const addItem = (event: FormSubmitEvent<ItemFormState>) => {
  conn.value
    ?.invoke("AddItem", event.data.item, event.data.amount)
    .then(() => {
      console.log("✅ Item Added!");
      state.item = "";
      state.amount = 1;
    })
    .catch((err) => console.error("❌ Error adding item:", err));
};

const validate = (state: Partial<ItemFormState>): FormError[] => {
  const errors = [];
  if (!state.item) errors.push({ name: "item", message: "Required" });
  if (!state.amount) errors.push({ name: "amount", message: "Required" });
  if (state.amount && state.amount < 1)
    errors.push({ name: "amount", message: "Must be greater than 0" });
  return errors;
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
  <div class="p-3 flex flex-col gap-4">
    <div>
      <ul>
        <li v-for="item in shoppingList" :key="item.id" class="flex">
          <div class="px-2 py-1 hover:bg-slate-950 rounded-sm">
            <span
              :class="{ 'line-through': item.checked }"
              class="hover:cursor-pointer"
              @click="toggleItem(item)"
            >
              {{ item.item }}
            </span>
            <span
              class="ml-4 text-primary-400"
              :class="{
                'text-primary-800': item.checked,
              }"
              >{{ item.quantity }}</span
            >
          </div>
        </li>
      </ul>
    </div>
    <div class="flex">
      <UForm
        :validate="validate"
        :state="state"
        class="border border-gray-700 rounded-2xl space-y-4 p-4"
        @submit="addItem"
      >
        <UFormField label="Item" name="item">
          <UInput v-model="state.item" />
        </UFormField>

        <UFormField label="Amount" name="amount">
          <UInput v-model="state.amount" type="text" />
        </UFormField>

        <UButton type="submit">Add</UButton>
      </UForm>
    </div>
  </div>
</template>
