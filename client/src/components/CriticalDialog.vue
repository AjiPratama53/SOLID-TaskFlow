<template>
  <v-dialog activator="parent" max-width="320" v-slot:default="{ isActive }">
    <v-card>
      <!-- Header -->
      <div class="flex justify-center px-8 py-4">
        <h3>{{ text }}</h3>
      </div>

      <!-- Actions -->
      <div :class="`flex ${inverseAction ? 'flex-row-reverse' : ''}`">
        <v-btn
          :class="`flex flex-1 bg-${color}-200 text-${color}-800`"
          rounded="none"
          elevation="0"
          @click="
            () => {
              $emit('proceed')
              isActive.value = false
            }
          "
          >Ya</v-btn
        >
        <v-btn
          class="flex flex-1"
          variant="text"
          rounded="none"
          @click="isActive.value = false"
          >Tidak</v-btn
        >
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps<{
  text: string
  inverseAction?: boolean
  color: string
}>()

defineEmits(['proceed'])
</script>
