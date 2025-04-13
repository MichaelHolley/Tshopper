<script setup lang="ts">
import type { FormError, FormSubmitEvent } from "@nuxt/ui";
import { ref } from "vue";

const emit = defineEmits(["login"]);

const state = reactive({
  password: "",
});

const loading = ref(false);
const error = ref("");

const validate = (state: Partial<{ password: string }>): FormError[] => {
  const errors = [];
  if (!state.password) errors.push({ name: "password", message: "Required" });
  return errors;
};

const handleSubmit = async (event: FormSubmitEvent<{ password: string }>) => {
  loading.value = true;
  error.value = "";

  try {
    await emit("login", event.data.password);
  } catch {
    error.value = "Invalid password";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto mt-8">
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">Login</h2>
      </template>

      <UForm :validate="validate" :state="state" @submit="handleSubmit">
        <UFormGroup label="Password" name="password">
          <UInput
            v-model="state.password"
            type="password"
            placeholder="Enter password"
            :required="true"
            autocomplete="current-password"
          />
        </UFormGroup>

        <div v-if="error" class="text-red-500 text-sm mt-2">
          {{ error }}
        </div>

        <div class="mt-4">
          <UButton type="submit" block :loading="loading">Login</UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
