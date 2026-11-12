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
      density="compact"
      class="bg-white"
      hide-details
      clearable
      placeholder="WebID"
      variant="outlined"
    />

    <v-btn
      elevation="0"
      class="bg-indigo-600 text-indigo-50"
      @click="isInputting = !isInputting"
      >Undang</v-btn
    >
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isInputting = ref(false)
</script>
