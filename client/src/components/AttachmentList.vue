<template>
  <div class="flex flex-col gap-2 w-full">
    <!-- File items -->
    <v-card
      v-for="(file, index) in files"
      :key="index"
      class="flex gap-8 p-4 justify-between items-center bg-indigo-100 w-full"
      elevation="0"
    >
      <div class="flex flex-col">
        <h4>{{ file.name }}</h4>
        <!-- File size (kin B, MB, or GB) -->
        <p>{{ formatFileSize(file.size) }}</p>
      </div>
      <v-icon-btn
        v-if="removeable"
        @click="removeFile(index)"
        icon="mdi-close"
        variant="text"
      />
    </v-card>

    <!-- Link items -->
    <v-card
      v-for="(link, index) in links"
      :key="index"
      class="flex gap-8 p-4 justify-between items-center bg-indigo-100 w-full"
      elevation="0"
    >
      <a :href="link"
        ><h4>{{ link }}</h4></a
      >
      <v-icon-btn
        v-if="removeable"
        @click="removeLink(index)"
        icon="mdi-close"
        variant="text"
      />
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { formatFileSize } from '@/utils/formatFileSize'

const props = defineProps<{
  removeable?: boolean
}>()

const files = defineModel<File[]>('files', { required: true })
const links = defineModel<string[]>('links', { required: true })

function removeFile(index: number) {
  files.value = files.value.filter((_, itemIndex) => itemIndex !== index)
}

function removeLink(index: number) {
  links.value = links.value.filter((_, itemIndex) => itemIndex !== index)
}
</script>
