<template>
  <div class="flex flex-col gap-1 items-center">
    <v-icon icon="mdi-alert-circle-outline" size="x-large" />
    <p>Ada masalah.</p>
    <v-btn
      elevation="0"
      class="text-indigo-600"
      text="Coba lagi"
      prepend-icon="mdi-refresh"
      variant="text"
      @click="$emit('retry')"
    />
  </div>
</template>

<script setup lang="ts">
defineEmits(['retry'])
</script>
