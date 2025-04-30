<script setup lang="ts">
import { useAuthStore } from '@/stores/AuthStore'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

interface LoginFormState {
  password: string
}

const router = useRouter()
const authStore = useAuthStore()

const state = reactive<LoginFormState>({
  password: '',
})

const loading = ref(false)
const error = ref('')

const validate = (state: Partial<LoginFormState>): FormError[] => {
  const errors = []
  if (!state.password) errors.push({ name: 'password', message: 'Required' })
  return errors
}

const handleSubmit = async (event: FormSubmitEvent<LoginFormState>) => {
  loading.value = true
  error.value = ''

  try {
    const isAuthenticated = await authStore.authenticate(event.data.password)
    if (!isAuthenticated) {
      error.value = 'Invalid password'
    } else {
      router.push('/')
    }
  } catch (e) {
    error.value = 'Authentication failed'
    console.error('❌ Failed to authenticate:', e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-8">
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">Login</h2>
      </template>

      <UForm :validate="validate" :state="state" @submit="handleSubmit">
        <UFormField label="Password" name="password">
          <UInput
            v-model="state.password"
            type="password"
            placeholder="Enter password"
            :required="true"
            autocomplete="current-password"
          />
        </UFormField>

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
