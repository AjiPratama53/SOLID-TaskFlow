<template>
  <Card :class="`flex flex-col gap-2 border-l-6 border-${statusColor}-600`">
    <!-- Task header -->
    <div class="flex justify-between items-start">
      <div class="flex flex-col">
        <h5>
          Diposting oleh <strong>{{ proposerId }}</strong>
        </h5>
        <h5>
          {{ formatDate(createdAt)
          }}{{ editedAt ? `, Diedit ${formatDate(editedAt)}` : '' }}
        </h5>
      </div>

      <!-- Task status -->
      <div
        :class="`px-4 py-0.5 bg-${statusColor}-200 text-${statusColor}-600 rounded-2xl`"
      >
        <h4>• {{ statusMessage }}</h4>
      </div>
    </div>

    <!-- Title -->
    <a class="self-start cursor-pointer" @click="$router.push(`/tasks/${id}`)">
      <h2>{{ title }}</h2>
    </a>

    <!-- Deadline -->
    <div class="flex gap-1">
      <v-icon icon="mdi-clock-outline" />
      <p>
        Tenggat:
        <strong>{{ deadline ? formatDateTime(deadline) : '--' }}</strong>
      </p>
    </div>
  </Card>
</template>

<script setup lang="ts">
import {
  taskStatusColor,
  taskStatusMessage,
  type Task,
} from '@/schemas/task.ts'
import Card from './Card.vue'
import { formatDate, formatDateTime } from '@/utils/formatDateTime.ts'

const props = defineProps<Task>()

const statusMessage = taskStatusMessage[props.status]
const statusColor = taskStatusColor[props.status]
</script>
