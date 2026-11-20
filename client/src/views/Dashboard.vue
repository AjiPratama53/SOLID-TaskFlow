<template>
  <!-- Header -->
  <Header title="Dasbor Tugas" subtitle="Buat dan kelola tugas-tugasmu." />

  <div class="flex gap-4 w-full">
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
        ></v-select>

        <!-- Deadline -->
        <v-date-input
          clearable
          label="Tenggat sebelum"
          variant="outlined"
          hide-details
          density="compact"
          prepend-icon=""
        />

        <!-- Search -->
        <v-text-field
          density="compact"
          hide-details
          clearable
          placeholder="Cari tugas"
          variant="outlined"
          append-inner-icon="mdi-magnify"
        />
      </v-card>

      <!-- Tasks container -->
      <div class="flex flex-col gap-2 items-start">
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
        <!-- Tasks items -->
        <TaskItem v-for="task in tasks.getTasks" v-bind="task" />
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
              <div
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
              <div
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
import Header from '@/components/Header.vue'
import InputTask from '@/components/InputTask.vue'
import TaskItem from '@/components/TaskItem.vue'
import { useTasksStore } from '@/stores/tasks'
import { formatDateTime } from '@/utils/formatDateTime'
import { ref } from 'vue'

const isCreateTask = ref(false)

const tasks = useTasksStore()
</script>
