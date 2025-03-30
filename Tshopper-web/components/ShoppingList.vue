<script setup lang="ts">
import type { HubConnection } from "@microsoft/signalr";
import { HubConnectionBuilder } from "@microsoft/signalr";
import type { FormError, FormSubmitEvent } from "@nuxt/ui";
import { onMounted, ref } from "vue";
import type { ItemFormState, ShoppingItem } from "./types";

const VISIBLE_CHECKED = 3;

const shoppingList = ref<ShoppingItem[]>([]);
const conn = ref<HubConnection | null>(null);
const checkedCollapsed = ref(true);
const itemInput = useTemplateRef("itemInput");

const activeItems = computed(() => {
  return shoppingList.value.filter((item) => !item.checked);
});

const checkedItems = computed(() => {
  return shoppingList.value.filter((item) => item.checked);
});

const mergedItems = computed(() => {
  let checked = checkedItems.value;

  if (checkedCollapsed.value) {
    checked = checked.slice(0, VISIBLE_CHECKED);
  }

  return [...activeItems.value, ...checked];
});

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

      itemInput.value?.inputRef?.focus();
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

onUnmounted(() => {
  if (conn.value) {
    conn.value
      .stop()
      .then(() => console.log("✅ SignalR Disconnected!"))
      .catch((err) => console.error("❌ Error disconnecting SignalR:", err));
  }
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
      <UInput
        ref="itemInput"
        v-model="state.item"
        placeholder="Item"
        :required="true"
      />
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
      <li v-for="item in mergedItems" :key="item.id" class="flex">
        <ShoppingListItem :item="item" @toggle="toggleItem" />
      </li>
    </ul>
    <UButton
      v-if="checkedItems.length > VISIBLE_CHECKED"
      class="flex flex-row justify-center items-center gap-1"
      variant="ghost"
      @click="
        () => {
          checkedCollapsed = !checkedCollapsed;
        }
      "
    >
      <UIcon
        :name="checkedCollapsed ? 'ci:chevron-down' : 'ci:chevron-up'"
        class="size-5 text-primary-400"
      />
      <span class="text-neutral-200"
        >Show {{ checkedCollapsed ? "more" : "less" }}</span
      >
    </UButton>
  </div>
</template>
