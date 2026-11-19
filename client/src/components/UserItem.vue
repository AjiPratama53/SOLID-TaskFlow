<template>
  <div class="flex w-full gap-2 items-center">
    <div class="h-8 aspect-square rounded-2xl bg-amber-200"></div>
    <div class="flex flex-1">
      <p>{{ name }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id?: string
  name: string
  avatar?: string
}>()
</script>
