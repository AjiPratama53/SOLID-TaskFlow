<template>
  <div class="flex flex-col gap-1 items-center">
    <v-icon icon="mdi-information-outline" size="x-large" />

    <p>{{ text }}</p>
    <v-btn
      elevation="0"
      class="text-indigo-600"
      :text="buttonText ?? ''"
      :prepend-icon
      @click="$emit('proceed')"
      variant="text"
    />
  </div>
</template>

<script setup lang="ts">
defineEmits(['proceed'])
defineProps<{
  prependIcon: string
  text: string
  buttonText: string
}>()
</script>
