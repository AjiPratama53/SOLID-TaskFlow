<template>
  <!-- Back button -->
  <v-btn
    class="bg-indigo-600 text-indigo-50"
    prepend-icon="mdi-arrow-left"
    text="Kembali ke dasbor"
  />

  <!-- Header -->
  <Header
    title="Detail tugas"
    subtitle="Bagi menjadi subtugas, delegasikan ke rekan, kumpulkan hasil."
  />

  <div class="flex gap-4 w-full">
    <!-- Content -->
    <div class="flex flex-2 flex-col gap-4">
      <Card class="flex flex-col gap-2">
        <!-- Task header -->
        <div class="flex justify-between items-start">
          <div class="flex flex-col">
            <h5>Diposting oleh <strong>[proposer.name]</strong></h5>
            <h5>[createdAt], Diedit [editedAt]</h5>
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
      </Card>
    </div>

    <!-- Side panel -->
    <div class="flex flex-1 flex-col"></div>
  </div>
</template>

<script setup lang="ts">
import Card from '@/components/Card.vue'
import Header from '@/components/Header.vue'
</script>
