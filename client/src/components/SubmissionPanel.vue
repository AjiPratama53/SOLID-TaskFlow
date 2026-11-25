<template>
  <!-- Submission card -->
  <Card>
    <div class="flex flex-col gap-4">
      <!-- Header -->
      <div class="flex flex-col">
        <div class="flex gap-1 items-center">
          <v-icon icon="mdi-message-draw" class="text-indigo-600" />
          <h3>Pengumpulan Tugas</h3>
        </div>
        <p>Kumpulkan tugas sebelum tenggat waktunya.</p>
      </div>

      <!-- Attachments -->
      <AttachmentList v-model:files="files" v-model:links="links" removable />

      <!-- Actions -->
      <!-- Cancel submission -->
      <v-btn
        v-if="taskStatus === 'pending_approval'"
        class="bg-red-200 text-red-800"
        elevation="0"
        >Batalkan pengumpulan
        <CriticalDialog
          text="Batalkan pengumpulan?"
          @proceed="handleCancelSubmission"
          color="red"
        />
      </v-btn>

      <div v-else-if="taskStatus === 'in_progress'" class="flex flex-col gap-2">
        <!-- Add file -->
        <v-btn prepend-icon="mdi-plus" class="text-indigo-600" variant="text"
          >Lampirkan file
          <v-menu activator="parent">
            <v-list>
              <v-list-item @click="" prepend-icon="mdi-link"
                >Link
                <InputLinkDialog activator="parent" v-model="links" />
              </v-list-item>
              <v-list-item @click="" prepend-icon="mdi-file"
                >File
                <InputFileDialog activator="parent" v-model="files" />
              </v-list-item>
            </v-list>
          </v-menu>
        </v-btn>

        <!-- Submit -->
        <v-btn class="bg-indigo-600 text-indigo-50" variant="text" elevation="0"
          >{{ submitButtonMessage() }}
          <CriticalDialog
            :text="`${submitButtonMessage()}?`"
            color="indigo"
            @proceed="handleSubmit"
          />
        </v-btn>
      </div>
    </div>
  </Card>

  <!-- Submission history card -->
  <Card>
    <div class="flex flex-col gap-4">
      <!-- Header -->
      <div class="flex gap-1 items-center">
        <v-icon icon="mdi-clock-outline" class="text-indigo-600" />
        <h3>Riwayat Pengumpulan</h3>
      </div>

      <!-- Error alert -->
      <v-alert
        v-if="submissions.error"
        type="warning"
        density="default"
        max-height="4em"
      >
        Error: {{ submissions.error }}
      </v-alert>

      <!-- Submissions - error -->
      <ErrorState
        v-if="submissions.error"
        @retry="submissions.fetchSubmissions"
      />
      <!-- Submissions - loading -->
      <v-skeleton-loader
        v-else-if="submissions.isLoading"
        v-for="item in 3"
        type="sentences"
      />
      <!-- Submissions - empty -->
      <p v-else-if="submissions.isEmpty">
        Belum ada pengumpulan untuk tugas ini.
      </p>

      <!-- History -->
      <div v-else class="flex gap-2">
        <!-- Timeline -->
        <div class="bg-gray-200 w-0.5 rounded-2xl" />

        <!-- History container -->
        <div class="flex flex-col gap-4 w-full">
          <!-- Submissions - content -->
          <SubmissionItem
            v-for="submission in submissions.getSubmissions"
            v-bind="submission"
          />
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import SubmissionItem from '@/components/SubmissionItem.vue'
import { useSubmissionsStore } from '@/stores/submissions'
import { onMounted, ref } from 'vue'
import Card from './Card.vue'
import CriticalDialog from './CriticalDialog.vue'
import InputLinkDialog from './InputLinkDialog.vue'
import AttachmentList from './AttachmentList.vue'
import InputFileDialog from './InputFileDialog.vue'
import ErrorState from './ErrorState.vue'
import type { TaskStatus } from '@/schemas/task.ts'

defineProps<{
  taskStatus: TaskStatus
}>()

const submissions = useSubmissionsStore()

const files = ref<File[]>([])
const links = ref<string[]>([])

const submitButtonMessage = () =>
  files.value.length || links.value.length
    ? 'Kumpulkan'
    : 'Tandai sebagai selesai'

function handleCancelSubmission() {
  alert('Pengumpulan dibatalkan')
}

function handleSubmit() {
  alert('Tugas dikumpulkan')
  submissions.postSubmission({
    id: `sbm_${Math.floor(Math.random() * 1000)}`,
    date: new Date(),
    status: 'pending_approval',
  })
}

onMounted(() => submissions.fetchSubmissions())
</script>
