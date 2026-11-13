<template>
  <div class="flex p-8 gap-8 w-full h-full">
    <!-- Page Aside -->
    <Aside />
    <!-- Main page -->
    <main class="flex-8 flex flex-col h-full gap-4 items-start">
      <!-- <Dashboard /> -->
      <!-- <TaskDetail /> -->
      <ValidateSubmission />
    </main>
  </div>
</template>

<script setup lang="ts">
import Aside from '@/components/Aside.vue'
import Dashboard from './Dashboard.vue'
import TaskDetail from './TaskDetail.vue'
import ValidateSubmission from './ValidateSubmission.vue';
</script>
