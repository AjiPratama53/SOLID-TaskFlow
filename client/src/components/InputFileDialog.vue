<template>
  <v-dialog :activator max-width="640" v-slot:default="{ isActive }">
    <Card class="flex flex-col gap-4">
      <h4>Tambahkan file</h4>

      <v-file-upload
        class="w-full"
        v-model="files"
        clearable
        multiple
        show-size
        hide-details
      >
        <v-file-upload-dropzone
          density="comfortable"
          @drop="isActive.value = false"
        />
      </v-file-upload>
    </Card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import Card from './Card.vue'

defineProps<{
  activator: Element | (string & {}) | 'parent' | ComponentPublicInstance
}>()

const files = defineModel<File[]>()
</script>
