<template>
  <!-- Header -->
  <Header title="Dasbor Tugas" subtitle="Buat dan kelola tugas-tugasmu." />

  <div class="flex flex-1 gap-4 w-full">
    <!-- Content -->
    <div class="flex flex-2 flex-col gap-4">
      <!-- Filter -->
      <v-card class="flex p-2 gap-2">
        <!-- Status -->
        <v-select
          density="compact"
          hide-details
          clearable
          label="Status"
          variant="outlined"
          :items="filterStatusItems"
          item-title="value"
          item-value="status"
          v-model="filterStatus"
        ></v-select>

        <!-- Deadline -->
        <v-date-input
          clearable
          label="Tenggat sebelum"
          variant="outlined"
          hide-details
          density="compact"
          prepend-icon=""
          v-model="filterDate"
        />

        <!-- Search -->
        <v-text-field
          density="compact"
          hide-details
          clearable
          placeholder="Cari tugas"
          variant="outlined"
          append-inner-icon="mdi-magnify"
          v-model="search"
        />
      </v-card>

      <!-- <p>{{ filterStatus }} {{ filterDate }} {{ search }}</p> -->

      <!-- Tasks container -->

      <!-- Error alert -->
      <v-alert
        v-if="tasks.error"
        type="warning"
        density="default"
        max-height="4em"
      >
        Error: {{ tasks.error }}
      </v-alert>

      <div class="flex flex-1 flex-col gap-2 items-start">
        <!-- New task -->
        <v-btn
          elevation="0"
          class="bg-indigo-600 text-indigo-50"
          text="Tugas baru"
          prepend-icon="mdi-plus"
          @click="isCreateTask = !isCreateTask"
        />

        <Card v-if="isCreateTask">
          <InputTask
            @close="isCreateTask = false"
            :action="() => console.log('Task created')"
          />
        </Card>

        <!-- Tasks - error -->
        <div
          v-if="tasks.error"
          class="flex flex-1 w-full items-center justify-center"
        >
          <ErrorState @retry="tasks.fetchTasks" />
        </div>

        <!-- Tasks - loading -->
        <Card v-else-if="tasks.isLoading" v-for="item in 3">
          <div class="flex flex-col w-full">
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
          </div>
        </Card>
        <!-- Tasks-  empty -->
        <div
          v-else-if="tasks.isEmpty"
          class="flex flex-1 w-full items-center justify-center"
        >
          <EmptyState
            prepend-icon="mdi-plus"
            text="Belum ada tugas untuk dikerjakan."
            button-text="Buat tugas baru"
            @proceed="isCreateTask = !isCreateTask"
          />
        </div>

        <!-- Tasks - content -->
        <TaskItem v-else v-for="task in tasks.getTasks" v-bind="task" />
      </div>
    </div>

    <!-- Side panel -->
    <div class="flex flex-1 flex-col">
      <card>
        <div class="flex flex-col gap-6">
          <!-- Incoming tasks -->
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-start">
              <h3>Mendatang</h3>
              <div
                class="flex px-2 py-0.5 rounded-2xl gap-1 bg-amber-200 text-amber-800 text-sm"
              >
                {{ tasks.incomingTasks.length }} Tugas
              </div>
            </div>

            <!-- Incoming task items -->
            <div class="flex flex-col gap-2">
              <p v-if="tasks.error">Ada masalah.</p>
              <v-skeleton-loader v-else-if="tasks.isLoading" type="sentences">
              </v-skeleton-loader>

              <p v-else-if="tasks.incomingTasks.length === 0">
                Hore, tidak ada tugas yang perlu segera diselesaikan!
              </p>
              <div
                v-else
                v-for="task in tasks.incomingTasks"
                v-bind="task"
                class="flex flex-col gap-0.5"
              >
                <p class="text-red-600">
                  • Tenggat: {{ formatDateTime(task.deadline) }}
                </p>
                <a
                  @click="$router.push(`/tasks/${task.id}`)"
                  class="self-start cursor-pointer"
                  ><h4>{{ task.title }}</h4></a
                >
              </div>
            </div>
          </div>

          <v-divider></v-divider>

          <!-- No deadline tasks -->
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-start">
              <h3>Tanpa Batas Waktu</h3>
              <div
                class="flex px-2 py-0.5 rounded-2xl gap-1 bg-amber-200 text-amber-800 text-sm"
              >
                {{ tasks.noDeadlineTasks.length }} Tugas
              </div>
            </div>

            <!-- No deadline task items -->
            <div class="flex flex-col gap-2">
              <p v-if="tasks.error">Ada masalah.</p>
              <v-skeleton-loader v-else-if="tasks.isLoading" type="text">
              </v-skeleton-loader>
              <p v-else-if="tasks.noDeadlineTasks.length === 0">
                Hore, tidak ada tugas!
              </p>
              <div
                v-else
                v-for="task in tasks.noDeadlineTasks"
                v-bind="task"
                class="flex flex-col gap-0.5"
              >
                <a
                  class="self-start cursor-pointer"
                  @click="$router.push(`/tasks/${task.id}`)"
                  ><h4>{{ task.title }}</h4></a
                >
              </div>
            </div>
          </div>
        </div>
      </card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '@/components/Card.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import Header from '@/components/Header.vue'
import InputTask from '@/components/InputTask.vue'
import TaskItem from '@/components/TaskItem.vue'
import { useTasksStore } from '@/stores/tasks'
import { formatDateTime } from '@/utils/formatDateTime'
import { onMounted, ref, shallowRef } from 'vue'

const isCreateTask = ref(false)

const tasks = useTasksStore()

// Filter
const filterStatusItems = [
  { status: 'proposed', value: 'Ditugaskan' },
  { status: 'in_progress', value: 'Sedang dikerjakan' },
  { status: 'pending_approval', value: 'Menunggu persetujuan' },
  { status: 'completed', value: 'Selesai' },
  { status: 'cancelled', value: 'Dibatalkan' },
]

const filterStatus = shallowRef()
const filterDate = ref('')
const search = ref('')

onMounted(() => tasks.fetchTasks())
</script>
