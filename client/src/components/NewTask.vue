<template>
  <!-- New Task button -->
  <v-btn
    @click="isCreateTask = !isCreateTask"
    prepend-icon="mdi-plus"
    class="bg-indigo-600 text-indigo-50"
    >{{ isSubtask ? 'Subtugas' : 'Tugas' }} baru</v-btn
  >

  <!-- New Task card -->
  <Card v-if="isCreateTask">
    <div class="flex flex-col gap-4 items-start">
      <!-- Inputs -->
      <div class="flex flex-col gap-2 w-full">
        <v-text-field
          density="compact"
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
          <input
            class="px-4 py-1 border-1 border-gray-400 rounded-sm"
            type="datetime-local"
            name="deadline"
            id="deadline"
            placeholder="Tenggat"
          />
        </div>
        <!-- <v-date-input class="w-100" label="Tenggat" variant="outlined" /> -->
        <!-- <v-time-input class="w-100" label="Tenggat" variant="outlined" /> -->
      </div>

      <!-- Attachments -->
      <!-- Actions -->
      <div class="flex w-full justify-between">
        <div class="flex gap-1">
          <v-btn rounded="none" elevation="0" icon="mdi-upload"></v-btn>
          <v-btn rounded="none" elevation="0" icon="mdi-link"></v-btn>
        </div>
        <div class="flex gap-1">
          <v-btn elevation="0" @click="isCreateTask = false">Batal</v-btn>
          <v-btn elevation="0" class="bg-indigo-600 text-indigo-50">Buat</v-btn>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Card from './Card.vue'

defineProps<{
  isSubtask?: boolean
}>()

const isCreateTask = ref(false)
</script>
