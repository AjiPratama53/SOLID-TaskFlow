<template>
  <!-- Header -->
  <header>
    <h1>Dasbor Tugas</h1>
    <p>Buat dan kelola tugas-tugasmu.</p>
  </header>

  <div class="flex gap-4">
    <!-- Content -->
    <div class="flex flex-2 flex-col gap-4">
      <!-- Filter -->
      <v-card class="flex p-2 gap-2">
        <!-- Status -->
        <v-select
          density="compact"
          hide-details
          clearable
          label="Status"
          :items="taskStatuses"
          variant="outlined"
        ></v-select>

        <!-- Deadline -->
        <input
          class="px-4 border-1 border-gray-400 rounded-sm"
          type="datetime-local"
          name="deadline"
          id="deadline"
          placeholder="Tenggat"
        />

        <!-- Search -->
        <v-text-field
          density="compact"
          hide-details
          clearable
          placeholder="Cari tugas"
          variant="outlined"
          append-inner-icon="mdi-magnify"
        />
      </v-card>

      <!-- Tasks container -->
      <div class="flex flex-col gap-2 items-start">
        <!-- New task button -->
        <v-btn
          @click="isCreateTask = !isCreateTask"
          prepend-icon="mdi-plus"
          class="bg-indigo-600 text-indigo-50"
          >Tugas baru</v-btn
        >

        <!-- New task -->
        <card v-if="isCreateTask">
          <div class="flex flex-col gap-4 items-start">
            <!-- Inputs -->
            <div class="flex flex-col gap-2 w-full">
              <v-text-field
                hide-details="auto"
                class="w-full"
                clearable
                placeholder="Judul"
                variant="outlined"
              />
              <v-textarea
                hide-details="auto"
                class="w-full"
                clearable
                placeholder="Deskripsi"
                variant="outlined"
              />
              <div class="flex gap-2 items-center">
                <p>Tenggat:</p>
                <input
                  class="p-4 border-1 border-gray-400 rounded-sm"
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
                <v-btn elevation="0" class="bg-indigo-600 text-indigo-50"
                  >Buat</v-btn
                >
              </div>
            </div>
          </div>
        </card>

        <!-- Tasks items -->
        <card class="flex flex-col gap-2 border-l-6 border-indigo-600">
          <!-- Task header -->
          <div class="flex justify-between items-start">
            <div class="flex flex-col">
              <h5>Diposting oleh <strong>[proposer.name]</strong></h5>
              <h5>[createdAt]</h5>
            </div>

            <!-- Task status -->
            <div class="px-4 py-0.5 bg-green-200 text-green-800 rounded-2xl">
              <h4>• [Status]</h4>
            </div>
          </div>

          <h2>[Judul]</h2>
          <div class="flex gap-1">
            <v-icon icon="mdi-clock-outline" />
            <p>Tenggat: <strong>[deadline]</strong></p>
          </div>
        </card>
      </div>
    </div>

    <!-- Side panel -->
    <div class="flex flex-1 flex-col">
      <card>
        <div class="flex flex-col gap-6">
          <!-- Incoming tasks -->
          <div class="flex justify-between items-start">
            <h3>Mendatang</h3>
            <div
              class="flex px-2 py-0.5 rounded-2xl gap-1 bg-amber-200 text-amber-800 text-sm"
            >
              3 Tugas
            </div>
          </div>

          <v-divider></v-divider>

          <!-- No deadline tasks -->
          <div class="flex justify-between items-start">
            <h3>Tanpa Batas Waktu</h3>
            <div
              class="flex px-2 py-0.5 rounded-2xl gap-1 bg-amber-200 text-amber-800 text-sm"
            >
              3 Tugas
            </div>
          </div>
        </div>
      </card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '@/components/Card.vue'
import { ref } from 'vue'
import { VIcon } from 'vuetify/components'

const isCreateTask = ref(false)

const taskStatuses = [
  'Ditugaskan',
  'Sedang dikerjakan',
  'Menunggu verifikasi',
  'Selesai',
]
</script>
