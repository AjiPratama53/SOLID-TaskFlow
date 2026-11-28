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
          v-model="filterDeadline"
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
          <InputTask @close="isCreateTask = false" />
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
            v-if="!filterStatus && !filterDeadline && !search"
            prepend-icon="mdi-plus"
            text="Belum ada tugas untuk dikerjakan."
            button-text="Buat tugas baru"
            @proceed="isCreateTask = !isCreateTask"
            has-action
          />

          <EmptyState
            v-else
            prepend-icon=""
            text="Tugas tidak ditemukan."
            has-action
            button-text="Hapus filter"
            @proceed="clearFilter"
          />
        </div>

        <!-- Tasks - content -->
        <TaskItem v-else v-for="task in tasks.getTasks" v-bind="task" />
      </div>
    </div>

    <!-- Side panel -->
    <div class="flex flex-1 flex-col">
      <card>
        <ErrorState v-if="error" @retry="loadSideTasks" />

        <div v-else class="flex flex-col gap-6">
          <!-- Incoming tasks -->
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-start">
              <h3>Mendatang</h3>
              <div
                class="flex px-2 py-0.5 rounded-2xl gap-1 bg-amber-200 text-amber-800 text-sm"
              >
                {{ incomingTasks.length }} Tugas
              </div>
            </div>

            <!-- Incoming task items -->
            <div class="flex flex-col gap-2">
              <v-skeleton-loader
                v-if="isLoading"
                v-for="item in 3"
                type="sentences"
              >
              </v-skeleton-loader>
              <p v-else-if="incomingTasks.length === 0">
                Hore, tidak ada tugas yang perlu segera diselesaikan!
              </p>

              <div
                v-else
                v-for="task in incomingTasks"
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
                {{ noDeadlineTasks.length }} Tugas
              </div>
            </div>

            <!-- No deadline task items -->
            <div class="flex flex-col gap-2">
              <v-skeleton-loader
                v-if="isLoading"
                v-for="item in 3"
                type="sentences"
              >
              </v-skeleton-loader>

              <p v-else-if="noDeadlineTasks.length === 0">
                Hore, tidak ada tugas!
              </p>
              <div
                v-else
                v-for="task in noDeadlineTasks"
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
import Card from "@/components/Card.vue";
import EmptyState from "@/components/EmptyState.vue";
import ErrorState from "@/components/ErrorState.vue";
import Header from "@/components/Header.vue";
import InputTask from "@/components/InputTask.vue";
import TaskItem from "@/components/TaskItem.vue";
import type { Task } from "@/schemas/task";
import { useTasksStore } from "@/stores/tasks";
import { formatDateTime } from "@/utils/formatDateTime";
import debounce from "debounce";
import { onMounted, ref, shallowRef, watch } from "vue";

const isLoading = ref(false);
const isCreateTask = ref(false);

const tasks = useTasksStore();
const incomingTasks = ref<Task[]>([]);
const noDeadlineTasks = ref<Task[]>([]);

const error = ref<string | null>(null);

// Filter
const filterStatusItems = [
  { status: "proposed", value: "Ditugaskan" },
  { status: "in_progress", value: "Sedang dikerjakan" },
  { status: "pending_approval", value: "Menunggu persetujuan" },
  { status: "completed", value: "Selesai" },
  { status: "cancelled", value: "Dibatalkan" },
];

const filterStatus = shallowRef();
const filterDeadline = ref("");
const search = ref("");

function clearFilter() {
  filterStatus.value = null;
  filterDeadline.value = "";
  search.value = "";
}

async function loadSideTasks() {
  isLoading.value = true;
  error.value = null;

  try {
    incomingTasks.value = await tasks.fetchIncomingTasks();
    noDeadlineTasks.value = await tasks.fetchNoDeadlineTasks();

    // throw new Error('Uji Error State')
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Gagal memuat data dari Solid Pod.";
  } finally {
    isLoading.value = false;
  }
}

watch(
  [filterStatus, filterDeadline, search],
  debounce(
    async () =>
      await tasks.fetchTasks({
        status: filterStatus.value,
        deadlineTo: filterDeadline.value
          ? new Date(filterDeadline.value)
          : null,
        query: search.value,
      }),
  ),
);

onMounted(() => {
  tasks.fetchTasks({});
  loadSideTasks();
});
</script>
