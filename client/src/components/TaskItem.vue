<template>
  <Card :class="['flex flex-col gap-2 border-l-6', statusClasses.border600]">
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
        :class="[
          'px-4 py-0.5 rounded-2xl',
          statusClasses.background200,
          statusClasses.text600,
        ]"
      >
        <h4>• {{ statusMessage }}</h4>
      </div>
    </div>

    <!-- Title -->
    <a class="self-start cursor-pointer" @click="$router.push(`/tasks/${id}`)">
      <h2>{{ title }}</h2>
    </a>

    <div class="flex justify-between gap-8">
      <!-- Deadline -->
      <div class="flex gap-1">
        <v-icon icon="mdi-clock-outline" />
        <p>
          Tenggat:
          <strong>{{ deadline ? formatDateTime(deadline) : '--' }}</strong>
        </p>
      </div>

      <div class="flex gap-1 items-center">
        <!-- colleagues -->
        <card
          :class="[
            'flex pl-1 pr-4 py-1 rounded-4xl',
            statusClasses.background200,
          ]"
          elevation="0"
        >
          <UserItem v-bind="{ id: 'usr_001', name: 'Cahyo' }" />
        </card>

        <!-- Delegate -->
        <v-btn
          v-if="props.status === 'proposed'"
          prepend-icon="mdi-account-plus-outline"
          class="bg-gray-600 text-gray-50"
          elevation="0"
          rounded
          >Delegasikan
          <DelegateDialog />
        </v-btn>

        <!-- Alternate -->
        <v-btn
          v-if="props.status === 'in_progress'"
          prepend-icon="mdi-swap-horizontal"
          class="bg-indigo-600 text-indigo-50"
          elevation="0"
          rounded
          >Alihkan
          <DelegateDialog is-alternate />
        </v-btn>

        <!-- Verify -->
        <v-btn
          v-if="props.status === 'pending_approval'"
          prepend-icon="mdi-check-circle-outline"
          class="bg-yellow-600 text-yellow-50"
          elevation="0"
          rounded
          @click="$router.push('/submissions/sbm_001')"
          >Verifikasi
        </v-btn>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import {
  taskStatusColor,
  taskStatusMessage,
  type Task,
} from '@/schemas/task.ts'
import { statusColorClasses } from '@/utils/statusColorClasses'
import Card from './Card.vue'
import { formatDate, formatDateTime } from '@/utils/formatDateTime.ts'
import UserItem from './UserItem.vue'
import DelegateDialog from './DelegateDialog.vue'

const props = defineProps<Task>()

const statusMessage = taskStatusMessage[props.status]
const statusColor = taskStatusColor[props.status]
const statusClasses = statusColorClasses[statusColor]
</script>
