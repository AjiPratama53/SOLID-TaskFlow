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
      <v-card class="flex p-2 gap-2">Filter</v-card>

      <!-- Tasks container -->
      <div class="flex flex-col gap-2">
        <!-- New task button -->
        <v-btn prepend-icon="mdi-plus" class="bg-indigo-600 text-indigo-50"
          >Tugas baru</v-btn
        >

        <!-- New task -->
        <card>
          <div class="flex flex-col gap-4">
            <!-- Inputs -->
            <div class="flex flex-col gap-2"></div>
            <input type="text" name="title" id="title" placeholder="Judul" />
            <input type="image" src="" alt="" />
            <input
              type="datetime-local"
              name="deadline"
              id="deadline"
              placeholder="Tenggat"
            />
          </div>
        </card>

        <!-- Tasks list -->
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
</script>
