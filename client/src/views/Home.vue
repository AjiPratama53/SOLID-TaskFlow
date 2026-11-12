<template>
  <div class="flex p-8 gap-8 w-full h-full">
    <!-- Page Aside -->
    <aside class="flex-1 flex flex-col justify-between h-full">
      <div class="flex flex-col gap-4"></div>
    </aside>

    <!-- Main page -->
    <main class="flex-8 flex flex-col h-full gap-4">
      <Dashboard />
    </main>
  </div>
</template>

<script setup lang="ts">
import Dashboard from './Dashboard.vue'
</script>
