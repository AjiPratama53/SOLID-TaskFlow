<template>
  <v-card class="flex flex-col w-full gap-2 p-4 bg-indigo-100" elevation="0">
    <!-- header -->
    <div class="flex items-center justify-between">
      <div class="flex gap-1 items-center">
        <a :href="`/tasks/${id}`">
          <h4>{{ title }}</h4>
        </a>
      </div>
      <div
        :class="`px-4 py-0.5 bg-${statusColor}-200 text-${statusColor}-800 rounded-2xl`"
      >
        <h5>• {{ statusMessage }}</h5>
      </div>
    </div>

    <!-- body -->
    <div class="flex items-center justify-between">
      <!-- deadline -->
      <div class="flex gap-1 items-center">
        <v-icon icon="mdi-clock-outline" size="small" />
        <p>
          Tenggat:
          <strong>{{ deadline ? formatDateTime(deadline) : '--' }}</strong>
        </p>
      </div>

      <!-- detail & action -->
      <div class="flex gap-1 items-center">
        <!-- colleagues -->
        <card class="flex px-2.5 py-1 rounded-2xl" elevation="0">
          <!-- <UserItem name="[Rekan 1]" /> -->
        </card>

        <!-- action -->
        <v-btn
          prepend-icon="mdi-swap-horizontal"
          class="bg-indigo-600 text-indigo-50"
          elevation="0"
          rounded
          >Alihkan
          <DelegateDialog />
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { taskStatusColor, taskStatusMessage, type Task } from '@/schemas/task'
import { formatDateTime } from '@/utils/formatDateTime'

const props = defineProps<Task>()
const statusMessage = taskStatusMessage[props.status]
const statusColor = taskStatusColor[props.status]
</script>
