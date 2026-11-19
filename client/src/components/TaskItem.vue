<template>
  <Card class="flex flex-col gap-2 border-l-6 border-indigo-600">
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
</template>

<script setup lang="ts">
import type { Task } from '@/schemas/task.ts'
import Card from './Card.vue'

// const model = defineModel<Task>();
</script>
