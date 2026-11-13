<template>
  <input
    class="px-4 py-1 border border-gray-400 rounded-sm"
    type="datetime-local"
    name="deadline"
    id="deadline"
    placeholder="Tenggat"
    v-model="model"
  />
</template>

<script setup lang="ts">
const model = defineModel<Date>()
</script>
