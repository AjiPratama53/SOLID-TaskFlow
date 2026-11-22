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
    <AttachmentList v-model:files="files" v-model:links="links" removable />
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
  <InputLinkDialog activator="#link-upload" v-model="links" />
</template>

<script setup lang="ts">
import DateTimePicker from './DateTimePicker.vue'
import InputLinkDialog from './InputLinkDialog.vue'
import { useTasksStore } from '@/stores/tasks.ts'
import { ref } from 'vue'
import InputFileDialog from './InputFileDialog.vue'
import AttachmentList from './AttachmentList.vue'
import type { Task } from '@/schemas/task.ts'

const props = defineProps<{
  isEdit?: boolean
  task?: Task
}>()

const task = defineModel<Task>('task')

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
