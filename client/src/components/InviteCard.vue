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

    <v-btn elevation="0" class="bg-indigo-600 text-indigo-50"
      >Undang
      <v-dialog
        activator="parent"
        max-width="640"
        v-slot:default="{ isActive = false }"
      >
        <v-card class="flex flex-col p-4 gap-4 w-full" v-if="isActive">
          <!-- <div> -->
          <h4>Undang Rekan</h4>
          <v-text-field
            density="compact"
            autofocus
            hide-details="auto"
            class="w-full"
            clearable
            placeholder="WebID"
            variant="outlined"
            v-model="input"
            @keyup.enter="handleInvite(true, () => (isActive.value = false))"
          />
          <v-alert type="error" v-if="error">{{ error }}</v-alert>
          <!-- </div> -->
          <div class="flex justify-end">
            <v-btn
              @click="handleInvite(false, () => (isActive.value = false))"
              class="text-indigo-600"
              variant="text"
              density="compact"
              >Batal</v-btn
            >
            <v-btn
              @click="handleInvite(true, () => (isActive.value = false))"
              class="text-indigo-600"
              variant="text"
              density="compact"
              >Undang</v-btn
            >
          </div>
        </v-card>
      </v-dialog>
    </v-btn>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')
const error = ref('')

function handleInvite(proceed = true, cb: Function) {
  try {
    if (proceed && !input.value) throw new Error('Masukkan WebID rekanmu')

    // Post to friends in solid pod
    if (proceed) alert(`${input.value} telah diundang`)

    input.value = ''
    error.value = ''
    cb()
  } catch (e) {
    error.value = e.message
  }
}
</script>
