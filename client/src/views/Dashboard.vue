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
        <!-- New task -->
        <new-task />
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

          <!-- Title -->
          <a href="">
            <h2>[Judul]</h2>
          </a>

          <!-- Deadline -->
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
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-start">
              <h3>Mendatang</h3>
              <div
                class="flex px-2 py-0.5 rounded-2xl gap-1 bg-amber-200 text-amber-800 text-sm"
              >
                3 Tugas
              </div>
            </div>

            <!-- Incoming task items -->
            <div class="flex flex-col gap-2">
              <div v-for="value in 3" class="flex flex-col gap-0.5">
                <p class="text-red-600">• Tenggat: [deadline]</p>
                <a href=""><h4>[Judul]</h4></a>
              </div>
            </div>
          </div>

          <v-divider></v-divider>

          <!-- No deadline tasks -->
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-start">
              <h3>Tanpa Batas Waktu</h3>
              <div
                class="flex px-2 py-0.5 rounded-2xl gap-1 bg-amber-200 text-amber-800 text-sm"
              >
                3 Tugas
              </div>
            </div>

            <!-- No deadline task items -->
            <div class="flex flex-col gap-2">
              <div v-for="value in 3" class="flex flex-col gap-0.5">
                <a href=""><h4>[Judul]</h4></a>
              </div>
            </div>
          </div>
        </div>
      </card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '@/components/Card.vue'
import NewTask from '@/components/NewTask.vue'

const taskStatuses = [
  'Ditugaskan',
  'Sedang dikerjakan',
  'Menunggu verifikasi',
  'Selesai',
]
</script>
