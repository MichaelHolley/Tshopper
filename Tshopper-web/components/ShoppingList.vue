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
  amount: "",
});

const addItem = (event: FormSubmitEvent<ItemFormState>) => {
  conn.value
    ?.invoke("AddItem", event.data.item, event.data.amount)
    .then(() => {
      console.log("✅ Item Added!");
      state.item = "";
      state.amount = "";
    })
    .catch((err) => console.error("❌ Error adding item:", err));
};

const validate = (state: Partial<ItemFormState>): FormError[] => {
  const errors = [];
  if (!state.item) errors.push({ name: "item", message: "Required" });
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
    .withUrl(`http://localhost:5157/shoppingList`)
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
  <UForm
    :validate="validate"
    :state="state"
    class="flex flex-row gap-2"
    @submit="addItem"
  >
    <UFormField name="item">
      <UInput v-model="state.item" placeholder="Item" :required="true" />
    </UFormField>

    <UFormField name="amount">
      <UInput v-model="state.amount" placeholder="Amount" />
    </UFormField>

    <div>
      <UButton type="submit" icon="ci:add-plus" class="float-end">
        Add
      </UButton>
    </div>
  </UForm>
  <div class="mt-3">
    <ul v-auto-animate="{ duration: 300, delay: 300 }">
      <li v-for="item in shoppingList" :key="item.id" class="flex">
        <div
          class="px-2 py-1 hover:bg-slate-950 rounded-sm flex flex-row items-center shadow"
        >
          <span
            :class="{ 'line-through text-neutral-500': item.checked }"
            class="hover:cursor-pointer flex flex-row items-center"
            @click="toggleItem(item)"
          >
            <UIcon
              :name="
                item.checked ? 'ci:checkbox-check' : 'ci:checkbox-unchecked'
              "
              class="size-5 mr-1"
            />{{ item.item }}
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
</template>
