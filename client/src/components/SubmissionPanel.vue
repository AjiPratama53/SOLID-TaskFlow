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
      <div class="flex flex-col gap-2">
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

        <!-- Cancel submission -->
        <v-btn class="bg-red-200 text-red-800" elevation="0"
          >Batalkan pengumpulan
          <CriticalDialog
            text="Batalkan pengumpulan?"
            @proceed="handleCancelSubmission"
            color="red"
          />
        </v-btn>
        <!-- <DialogButton text="Batalkan Pengumpulan" bg-color="red-200" text-color="red-800" elevation="0" block>
              <v-card elevation="0">
                hello
              </v-card>
            </DialogButton> -->
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

      <!-- History -->
      <div class="flex gap-2">
        <!-- Timeline -->
        <div class="bg-gray-200 w-0.5 rounded-2xl" />

        <!-- History container -->
        <div class="flex flex-col gap-4 w-full">
          <!-- History item -->
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
import { onUnmounted, ref } from 'vue'
import Card from './Card.vue'
import CriticalDialog from './CriticalDialog.vue'
import InputLinkDialog from './InputLinkDialog.vue'
import AttachmentList from './AttachmentList.vue'
import InputFileDialog from './InputFileDialog.vue'

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

onUnmounted(() => {
  submissions.fetchSubmissions()
})
</script>
