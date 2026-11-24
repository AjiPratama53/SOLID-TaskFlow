<template>
  <!-- Invite card -->
  <v-card class="flex flex-col p-4 gap-2 bg-indigo-100">
    <div class="flex gap-2">
      <v-icon icon="mdi-account-plus-outline" />
      <h4>Undang rekan</h4>
    </div>
    <p class="font-light text-sm">
      Delegasikan subtugas lebih cepat dengan follow rekan Anda.
    </p>

    <v-btn
      elevation="0"
      class="bg-indigo-600 text-indigo-50"
      :disabled="users.isLoading || users.isAdding"
      @click="dialogOpen = true"
    >
      Undang
    </v-btn>
    <v-dialog v-model="dialogOpen" max-width="640">
      <v-card class="flex flex-col p-4 gap-4 w-full">
        <h4>Undang Rekan</h4>
        <v-text-field
          v-model="input"
          density="compact"
          autofocus
          hide-details="auto"
          class="w-full"
          clearable
          placeholder="WebID"
          variant="outlined"
          :disabled="users.isLoading || users.isAdding"
          @keyup.enter="handleInvite"
        />
        <v-alert type="error" v-if="error">{{ error }}</v-alert>
        <div class="flex justify-end">
          <v-btn
            :disabled="users.isLoading || users.isAdding"
            @click="closeDialog"
            class="text-indigo-600"
            variant="text"
            density="compact"
          >
            Batal
          </v-btn>
          <v-btn
            :loading="users.isAdding"
            :disabled="users.isLoading || users.isAdding"
            @click="handleInvite"
            class="text-indigo-600"
            variant="text"
            density="compact"
          >
            Undang
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { useUsersStore } from '@/stores/users'
import { ref } from 'vue'

const users = useUsersStore()
const input = ref('')
const error = ref('')
const dialogOpen = ref(false)

function closeDialog() {
  dialogOpen.value = false
  input.value = ''
  error.value = ''
}

async function handleInvite() {
  error.value = ''
  if (!input.value.trim()) {
    error.value = 'Masukkan WebID rekanmu.'
    return
  }

  const added = await users.post(input.value)
  if (!added) {
    error.value = users.error ?? 'Gagal menyimpan teman ke Solid Pod.'
    return
  }

  closeDialog()
}
</script>
