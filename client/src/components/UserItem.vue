<template>
  <div class="flex gap-2 items-center">
    <div class="h-8 aspect-square rounded-2xl bg-amber-200"></div>
    <p>{{ name }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id?: string
  name: string
  avatar?: string
}>()
</script>
