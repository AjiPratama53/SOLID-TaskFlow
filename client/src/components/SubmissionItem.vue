<template>
  <div class="flex gap-4">
    <v-icon
      :class="`bg-${statusColor}-200 text-${statusColor}-800 rounded-2xl p-3`"
      :icon="`mdi-${statusIcon}`"
      size="xsmall"
    />
    <div class="flex flex-col w-full">
      <!-- Status and date -->
      <div class="flex w-full justify-between gap-8">
        <p>{{ statusMessage }}</p>
        <p>{{ formatDate(props.date) }} • {{ formatTime(props.date) }}</p>
      </div>

      <!-- Comment -->
      <v-card v-if="comment" elevation="0" class="bg-indigo-100 p-2">
        <p>{{ comment }}</p>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  submissionStatusColor,
  submissionStatusIcon,
  type Submission,
  submissionStatusMessage,
} from '@/schemas/submission'
import { formatDate, formatTime } from '@/utils/formatDateTime'

const props = defineProps<Submission>()

const statusMessage = submissionStatusMessage[props.status]
const statusColor = submissionStatusColor[props.status]
const statusIcon = submissionStatusIcon[props.status]
</script>
