<template>
  <!-- Back button -->
  <v-btn
    class="text-indigo-600"
    variant="text"
    density="compact"
    elevation="0"
    prepend-icon="mdi-arrow-left"
    text="Kembali"
    @click="$router.back()"
  />

  <!-- Header -->
  <Header
    title="Detail Tugas"
    subtitle="Bagi menjadi subtugas, delegasikan ke rekan, kumpulkan hasil."
  />

  <div class="flex-1 flex gap-4 w-full">
    <!-- Content -->
    <div class="flex flex-2 flex-col gap-4">
      <!-- Error alert -->
      <v-alert v-if="error" type="warning" density="default" max-height="4em">
        Error: {{ error }}
      </v-alert>

      <Card>
        <!-- Task - error -->
        <ErrorState v-if="error" @retry="loadTask" />

        <!-- Task - Loading -->
        <div v-else-if="isLoading" class="flex flex-col w-full">
          <div class="flex justify-between items-start">
            <v-skeleton-loader
              class="bg-transparent m-0 w-1/5"
              type="sentences"
            />
            <v-skeleton-loader
              class="bg-transparent m-0 w-1/5"
              type="heading"
            />
          </div>
          <v-skeleton-loader class="bg-transparent w-1/2" type="heading" />
          <v-skeleton-loader class="bg-transparent w-1/5" type="text" />
          <v-skeleton-loader class="bg-transparent" type="paragraph" />
        </div>

        <!-- Task - empty -->
        <EmptyState
          v-else-if="!task"
          text="Tugas tidak ditemukan"
          has-action
          prepend-icon="mdi-arrow-left"
          button-text="Kembali"
          @proceed="$router.back()"
        />

        <!-- Task - content -->
        <div v-else class="flex flex-col gap-4">
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
              :class="[
                'px-4 py-0.5 rounded-2xl',
                statusClasses.background200,
                statusClasses.text800,
              ]"
            >
              <h4>• {{ statusMessage }}</h4>
            </div>
          </div>
          <!-- Edit field -->
          <InputTask
            v-if="isEditing"
            :task
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
            <AttachmentList :files :links />
            <!-- <v-btn
               >file
               <InputFileDialog activator="parent" v-model="files" />
             </v-btn>
             <v-btn
               >link
               <InputLinkDialog activator="parent" v-model="links" />
             </v-btn> -->
          </div>

          <!-- Subtasks -->
          <div v-if="task?.userId" class="flex flex-col gap-2">
            <!-- Header -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1">
                <v-icon icon="mdi-text" class="text-indigo-600" />
                <h3>Daftar Subtugas</h3>
              </div>
              <h5>{{ subTasks.getTasks.length }} Subtugas aktif</h5>
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
              <SubtaskItem
                v-for="subtask in subTasks.getTasks"
                v-bind="subtask"
              />
            </div>
          </div>

          <!-- Actions -->
          <div v-if="isOwner" class="flex flex-col gap-2">
            <!-- Verify -->
            <v-btn
              v-if="isOwner && task?.status === 'pending_approval'"
              class="bg-yellow-600 text-yellow-50"
              elevation="0"
              prepend-icon="mdi-check-circle-outline"
              @click="$router.push('/submissions/sbm_001')"
              >Verifikasi</v-btn
            >
            <div class="flex gap-2 w-full">
              <!-- Cancel -->
              <v-btn
                v-if="
                  task?.status === 'proposed' || task?.status === 'in_progress'
                "
                id="cancel-task"
                class="flex flex-1 bg-red-200 text-red-800"
                elevation="0"
              >
                Batalkan penugasan
                <CriticalDialog
                  text="Batalkan penugasan?"
                  color="red"
                  @proceed="handleCancelTask"
                />
              </v-btn>
              <!-- <DialogButton text="Batalkan Penugasan" bg-color="red-200" text-color="red-800" elevation="0"/> -->

              <!-- Delegate -->
              <v-btn
                v-if="task?.status === 'proposed'"
                class="delegate flex flex-1 bg-gray-600 text-gray-50"
                elevation="0"
                prepend-icon="mdi-account-plus-outline"
                >Delegasikan
                <DelegateDialog />
              </v-btn>

              <!-- Altenate -->
              <v-btn
                v-if="task?.status === 'in_progress'"
                class="delegate flex flex-1 bg-indigo-600 text-indigo-50"
                elevation="0"
                prepend-icon="mdi-swap-horizontal"
                >Alihkan
                <DelegateDialog is-alternate />
              </v-btn>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Submission panel -->
    <div class="flex flex-1 flex-col gap-4">
      <SubmissionPanel
        @accept-task="handleAcceptTask"
        :task-status="task?.status ?? 'proposed'"
        :is-loading
        :is-executor
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AttachmentList from '@/components/AttachmentList.vue'
import Card from '@/components/Card.vue'
import CriticalDialog from '@/components/CriticalDialog.vue'
import DelegateDialog from '@/components/DelegateDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import Header from '@/components/Header.vue'
import InputFileDialog from '@/components/InputFileDialog.vue'
import InputLinkDialog from '@/components/InputLinkDialog.vue'
import InputTask from '@/components/InputTask.vue'
import SubmissionPanel from '@/components/SubmissionPanel.vue'
import SubtaskItem from '@/components/SubtaskItem.vue'
import { taskStatusColor, taskStatusMessage, type Task } from '@/schemas/task'
import { api } from '@/services/api'
import { useSessionStore } from '@/stores/session'
import { useTasksStore } from '@/stores/tasks'
import { formatDate } from '@/utils/formatDateTime'
import { statusColorClasses } from '@/utils/statusColorClasses'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const isEditing = ref(false)
const isCreateSubtask = ref(false)

const route = useRouter()
const error = ref<string | null>(null)
const isLoading = ref(false)
const subTasks = useTasksStore()

const task = ref<Task | null>(null)
const files = ref<File[]>([])
const links = ref<string[]>([])

const statusMessage = ref('')
const statusColor = ref<keyof typeof statusColorClasses>(
  taskStatusColor.proposed,
)
const statusClasses = ref(statusColorClasses[statusColor.value])

const session = useSessionStore()
const isOwner = ref(false)
const isExecutor = ref(false)

async function loadTask() {
  isLoading.value = true
  error.value = null

  try {
    // API call here
    await api.task.get()
    await subTasks.fetchTasks()

    // throw new Error('Uji Error State')

    // mock data
    task.value = {
      id: 'tsk_001',
      userId: session.webId ?? '',
      proposerId: 'usr_002',
      createdAt: new Date(),
      status: 'completed',
      title: 'Testing',
      description: 'blablabla',
      deadline: new Date(),
    }

    isOwner.value = session.webId === task.value.proposerId
    isExecutor.value = session.webId === task.value.userId

    statusMessage.value = taskStatusMessage[task.value?.status || 'proposed']
    statusColor.value = taskStatusColor[task.value?.status || 'proposed']
    statusClasses.value = statusColorClasses[statusColor.value]
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Gagal memuat data dari Solid Pod.'
  } finally {
    isLoading.value = false
  }
}

function handleAcceptTask() {
  alert('Penugasan diterima')
}

function handleCancelTask() {
  alert('Penugasan dibatalkan')
}

onMounted(() => loadTask())
</script>
