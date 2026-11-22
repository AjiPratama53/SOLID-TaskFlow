<template>
  <!-- InputTask field -->
  <div class="flex flex-col gap-4 w-full items-start">
    <!-- Inputs -->
    <div class="flex flex-col gap-2 w-full">
      <v-text-field
        density="compact"
        autofocus
        hide-details="auto"
        class="w-full"
        clearable
        placeholder="Judul"
        variant="outlined"
        v-model="title"
      />
      <v-textarea
        density="compact"
        hide-details="auto"
        class="w-full"
        clearable
        placeholder="Deskripsi"
        variant="outlined"
        v-model="description"
      />
      <div class="flex gap-2 items-center">
        <p>Tenggat:</p>
        <DateTimePicker v-model="deadline" />
      </div>
      <!-- <v-date-input class="w-100" label="Tenggat" variant="outlined" /> -->
      <!-- <v-time-input class="w-100" label="Tenggat" variant="outlined" /> -->
    </div>

    <!-- Attachments -->
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
          @click="files.splice(index, 1)"
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
          @click="links.splice(index, 1)"
          icon="mdi-close"
          variant="text"
        />
      </v-card>
    </div>

    <!-- Actions -->
    <div class="flex w-full items-end justify-between">
      <div class="flex gap-1">
        <v-icon-btn
          id="file-upload"
          rounded="none"
          elevation="0"
          variant="text"
          icon="mdi-tray-arrow-up"
        />
        <v-icon-btn
          id="link-upload"
          rounded="none"
          elevation="0"
          variant="text"
          icon="mdi-link"
        />
      </div>
      <div class="flex gap-1">
        <v-btn @click="$emit('close')" elevation="0" variant="text"
          >Batal</v-btn
        >
        <v-btn
          @click="
            () => {
              handlePost()
              $emit('close')
            }
          "
          elevation="0"
          class="bg-indigo-600 text-indigo-50"
          >{{ isEdit ? 'Edit' : 'Buat' }}</v-btn
        >
      </div>
    </div>
  </div>

  <!-- Upload dialogs -->
  <InputFileDialog activator="#file-upload" v-model="files" />
  <InputLinkDialog activator="#link-upload" @upload="(e) => links.push(e)" />
</template>

<script setup lang="ts">
import DateTimePicker from './DateTimePicker.vue'
import InputLinkDialog from './InputLinkDialog.vue'
import { useTasksStore } from '@/stores/tasks.ts'
import { ref } from 'vue'
import InputFileDialog from './InputFileDialog.vue'
import { formatFileSize } from '@/utils/formatFileSize.ts'

const props = defineProps<{
  isEdit?: boolean
  // action: Function
}>()

// Input task data
const title = ref('')
const description = ref('')
const deadline = ref('')

const files = ref<File[]>([])
const links = ref<string[]>([])

const tasks = useTasksStore()

defineEmits(['close'])

function handlePost() {
  // return jika title dan deskripsi kosong, deadline ada tapi tanggal sudah lewat
  if (
    !title.value ||
    !description.value ||
    (deadline.value && new Date(deadline.value) <= new Date())
  )
    return

  tasks.postTask({
    title: title.value,
    description: description.value,
    deadline: deadline.value !== '' ? new Date(deadline.value) : undefined,
  })
}
</script>
