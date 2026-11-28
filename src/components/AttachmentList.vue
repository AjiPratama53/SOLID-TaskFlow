<template>
  <div class="flex flex-col gap-2 w-full">
    <!-- File items -->
    <v-card
      v-for="(file, index) in files"
      :key="index"
      class="flex gap-8 px-4 py-2 justify-between items-center bg-indigo-100 w-full"
      elevation="0"
    >
      <div class="flex gap-2 items-center">
        <v-icon icon="mdi-file" />
        <div class="flex flex-col">
          <a @click="openFile(index)" class="cursor-pointer">
            <h4>{{ file.name }}</h4>
          </a>
          <!-- File size (kin B, MB, or GB) -->
          <p>{{ formatFileSize(file.size) }}</p>
        </div>
      </div>
      <v-icon-btn
        v-if="removable"
        @click="removeFile(index)"
        icon="mdi-close"
        variant="text"
      />
      <v-icon-btn
        v-if="downloadable"
        @click="downloadFile(index)"
        icon="mdi-tray-arrow-down"
        variant="text"
      />
    </v-card>

    <!-- Link items -->
    <v-card
      v-for="(link, index) in links"
      :key="index"
      class="flex gap-8 px-4 py-2 justify-between items-center bg-indigo-100 w-full"
      elevation="0"
    >
      <div class="flex gap-2 items-center">
        <v-icon icon="mdi-link" />
        <a :href="link.toString()" target="_blank" rel="noopener noreferrer">
          <h4>{{ link.toString() }}</h4>
        </a>
      </div>

      <v-icon-btn
        v-if="removable"
        @click="removeLink(index)"
        icon="mdi-close"
        variant="text"
      />
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { formatFileSize } from "@/utils/formatFileSize";

const props = defineProps<{
  removable?: boolean;
  downloadable?: boolean;
}>();

const files = defineModel<File[]>("files", { default: () => [] });
const links = defineModel<URL[]>("links", { default: () => [] });

function removeFile(index: number) {
  if (!props.removable) return;
  files.value = files.value.filter((_, itemIndex) => itemIndex !== index);
}

function downloadFile(index: number) {
  if (!props.downloadable) return;

  const file = files.value[index];
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}

function openFile(index: number) {
  // Open file in a new tab
  const file = files.value[index];
  const url = URL.createObjectURL(file);
  window.open(url, "_blank");
}

function removeLink(index: number) {
  if (!props.removable) return;
  links.value = links.value.filter((_, itemIndex) => itemIndex !== index);
}
</script>
