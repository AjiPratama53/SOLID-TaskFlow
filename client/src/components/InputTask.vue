<template>
  <!-- InputTask field -->
  <div class="flex flex-col gap-4 w-full items-start">
    <!-- Inputs -->
    <div class="flex flex-col gap-2 w-full">
      <v-text-field
        density="compact"
        autofocus
        hide-details="auto"
        class="w-full"
        clearable
        placeholder="Judul"
        variant="outlined"
      />
      <v-textarea
        density="compact"
        hide-details="auto"
        class="w-full"
        clearable
        placeholder="Deskripsi"
        variant="outlined"
      />
      <div class="flex gap-2 items-center">
        <p>Tenggat:</p>
        <DateTimePicker />
      </div>
      <!-- <v-date-input class="w-100" label="Tenggat" variant="outlined" /> -->
      <!-- <v-time-input class="w-100" label="Tenggat" variant="outlined" /> -->
    </div>

    <!-- Attachments -->
    <!-- Actions -->
    <div class="flex w-full justify-between">
      <div class="flex gap-1">
        <v-btn
          rounded="none"
          elevation="0"
          variant="text"
          icon="mdi-upload"
        ></v-btn>
        <v-btn
          rounded="none"
          elevation="0"
          variant="text"
          icon="mdi-link"
        ></v-btn>
      </div>
      <div class="flex gap-1">
        <v-btn elevation="0" variant="text">Batal</v-btn>
        <v-btn elevation="0" class="bg-indigo-600 text-indigo-50">{{
          isEdit ? 'Edit' : 'Buat'
        }}</v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DateTimePicker from './DateTimePicker.vue'

defineProps<{
  isEdit?: boolean
}>()
</script>
