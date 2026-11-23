<template>
  <v-card class="flex flex-col w-full gap-2 p-4 bg-indigo-100" elevation="0">
    <!-- header -->
    <div class="flex items-center justify-between">
      <div class="flex gap-1 items-center">
        <a
          class="self-start cursor-pointer"
          @click="$router.push(`/tasks/${id}`)"
        >
          <h4>{{ title }}</h4>
        </a>
      </div>
      <div
        :class="[
          'px-4 py-0.5 rounded-2xl',
          statusClasses.background200,
          statusClasses.text800,
        ]"
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
        <card class="flex bg-white pl-1 pr-4 py-1 rounded-4xl" elevation="0">
          <UserItem v-bind="{ id: 'usr_001', name: 'Cahyo' }" />
        </card>

        <!-- Delegate -->
        <v-btn
          prepend-icon="mdi-account-plus-outline"
          class="bg-gray-600 text-gray-50"
          elevation="0"
          rounded
          >Delegasikan
          <DelegateDialog />
        </v-btn>

        <!-- Alternate -->
        <v-btn
          prepend-icon="mdi-swap-horizontal"
          class="bg-indigo-600 text-indigo-50"
          elevation="0"
          rounded
          >Alihkan
          <DelegateDialog is-alternate />
        </v-btn>

        <!-- Verify -->
        <v-btn
          prepend-icon="mdi-check-circle-outline"
          class="bg-yellow-600 text-yellow-50"
          elevation="0"
          rounded
          @click="$router.push('/submissions/sbm_001')"
          >Verifikasi
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { taskStatusColor, taskStatusMessage, type Task } from '@/schemas/task'
import { formatDateTime } from '@/utils/formatDateTime'
import { statusColorClasses } from '@/utils/statusColorClasses'
import DelegateDialog from './DelegateDialog.vue'
import UserItem from './UserItem.vue'

const props = defineProps<Task>()
const statusMessage = taskStatusMessage[props.status]
const statusColor = taskStatusColor[props.status]
const statusClasses = statusColorClasses[statusColor]
</script>
