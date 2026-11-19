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
    <v-text-field
      v-if="isInputting"
      autofocus
      density="compact"
      class="bg-white"
      hide-details
      clearable
      placeholder="WebID"
      variant="outlined"
      v-model="input"
      @keyup.enter="handleInput"
    />

    <v-btn
      elevation="0"
      class="bg-indigo-600 text-indigo-50"
      @click="handleInput"
      >Undang</v-btn
    >
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isInputting = ref(false)
const input = ref('')

const emit = defineEmits<{
  invite: [value: string]
}>()

function handleInput() {
  isInputting.value = !isInputting.value

  if (!input.value) return
  emit('invite', input.value)
  input.value = ''
}
</script>
