<template>
  <!-- Back button -->
  <v-btn
    class="bg-indigo-600 text-indigo-50"
    elevation="0"
    prepend-icon="mdi-arrow-left"
    text="Kembali ke dasbor"
    @click="$router.back()"
  />

  <!-- Header -->
  <Header
    title="Detail Tugas"
    subtitle="Bagi menjadi subtugas, delegasikan ke rekan, kumpulkan hasil."
  />

  <div class="flex gap-4 w-full">
    <!-- Content -->
    <div class="flex flex-2 flex-col gap-4">
      <Card class="flex flex-col gap-4">
        <!-- Task header -->
        <div class="flex justify-between items-start">
          <div class="flex flex-col">
            <h5>
              Diposting oleh <strong>{{ task?.proposerId }}</strong>
            </h5>
            <h5>
              {{ formatDate(task?.createdAt)
              }}{{
                task?.editedAt ? `, Diedit ${formatDate(task?.editedAt)}` : ''
              }}
            </h5>
          </div>

          <!-- Task status -->
          <div
            :class="`px-4 py-0.5 bg-${statusColor}-200 text-${statusColor}-800 rounded-2xl`"
          >
            <h4>• {{ statusMessage }}</h4>
          </div>
        </div>
        <!-- Edit field -->
        <InputTask
          v-if="isEditing"
          is-edit
          @close="isEditing = false"
          :action="() => console.log('Edited')"
        />

        <!-- Task field -->
        <div v-else class="flex flex-col gap-4">
          <!-- Title and edit button -->
          <div v class="flex items-center justify-between gap-4">
            <h2>{{ task?.title }}</h2>
            <v-btn
              icon="mdi-square-edit-outline"
              variant="text"
              density="compact"
              rounded
              @click="isEditing = !isEditing"
            />
          </div>

          <!-- Deadline -->
          <div class="flex gap-1">
            <v-icon icon="mdi-clock-outline" />
            <p>
              Tenggat: <strong>{{ formatDate(task?.deadline) }}</strong>
            </p>
          </div>

          <!-- Description -->
          <p>{{ task?.description }}</p>

          <!-- Attachments -->
        </div>

        <!-- Subtasks -->
        <div class="flex flex-col gap-2">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <v-icon icon="mdi-text" class="text-indigo-600" />
              <h3>Daftar Subtugas</h3>
            </div>
            <h5>{{ tasks.getTasks.length }} Subtugas aktif</h5>
          </div>

          <!-- Subtask container -->
          <div class="flex flex-col items-start gap-2 w-full">
            <!-- New subtask -->
            <v-btn
              elevation="0"
              class="bg-indigo-600 text-indigo-50"
              text="Subtugas baru"
              prepend-icon="mdi-plus"
              @click="isCreateSubtask = !isCreateSubtask"
            />
            <Card v-if="isCreateSubtask">
              <InputTask @close="isCreateSubtask = false" />
            </Card>

            <!-- Subtask item -->
            <SubtaskItem v-for="subtask in tasks.getTasks" v-bind="subtask" />
          </div>
        </div>
        <!-- Actions -->
        <div class="flex flex-col gap-2">
          <!-- Accept -->
          <v-btn class="bg-gray-600 text-gray-50" elevation="0"
            >Terima Penugasan</v-btn
          >

          <div class="flex gap-2 w-full">
            <!-- Cancel -->
            <v-btn
              id="cancel-task"
              class="flex flex-1 bg-red-200 text-red-800"
              elevation="0"
            >
              Batalkan Penugasan
              <CriticalDialog
                text="Batalkan penugasan?"
                color="red"
                :action="handleCancelTask"
              />
            </v-btn>
            <!-- <DialogButton text="Batalkan Penugasan" bg-color="red-200" text-color="red-800" elevation="0"/> -->

            <!-- Delegate -->
            <v-btn
              id="delegate"
              class="delegate flex flex-1 bg-gray-600 text-gray-50"
              elevation="0"
              prepend-icon="mdi-account-plus-outline"
              >Delegasikan
              <DelegateDialog />
            </v-btn>
          </div>
        </div>
      </Card>
    </div>

    <!-- Side panel -->
    <div class="flex flex-1 flex-col gap-4">
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
          <div class="flex flex-col gap-2"></div>

          <!-- Actions -->
          <div class="flex flex-col gap-2">
            <!-- Add file -->
            <v-btn
              prepend-icon="mdi-plus"
              class="text-indigo-600"
              variant="text"
              >Lampirkan File/Text</v-btn
            >

            <!-- Submit -->
            <v-btn
              class="bg-indigo-600 text-indigo-50"
              variant="text"
              elevation="0"
              @click="handleSubmit"
              >Kumpulkan</v-btn
            >

            <!-- Cancel submission -->
            <v-btn class="bg-red-200 text-red-800" elevation="0"
              >Batalkan Pengumpulan
              <CriticalDialog
                text="Batalkan pengumpulan?"
                :action="handleCancelSubmission"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '@/components/Card.vue'
import CriticalDialog from '@/components/CriticalDialog.vue'
import DelegateDialog from '@/components/DelegateDialog.vue'
import Header from '@/components/Header.vue'
import InputTask from '@/components/InputTask.vue'
import SubmissionItem from '@/components/SubmissionItem.vue'
import SubtaskItem from '@/components/SubtaskItem.vue'
import { taskStatusColor, taskStatusMessage, type Task } from '@/schemas/task'
import { useSubmissionsStore } from '@/stores/submissions'
import { useTasksStore } from '@/stores/tasks'
import { formatDate } from '@/utils/formatDateTime'
import { onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const isEditing = ref(false)
const isCreateSubtask = ref(false)

const route = useRouter()
const tasks = useTasksStore()

const task = ref<Task>()

const statusMessage = taskStatusMessage[task.value?.status || 'proposed']
const statusColor = taskStatusColor[task.value?.status || 'proposed']

const submissions = useSubmissionsStore()

function handleCancelTask() {
  alert('Penugasan dibatalkan')
}

function handleCancelSubmission() {
  alert('Pengumpulan dibatalkan')
}

function handleSubmit() {
  submissions.postSubmission({
    id: `sbm_${Math.floor(Math.random() * 1000)}`,
    date: new Date(),
    status: 'pending_approval',
  })
}

onUnmounted(() => {})
</script>
