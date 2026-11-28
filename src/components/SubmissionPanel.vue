<template>
  <!-- Submission card -->
  <Card>
    <!-- Submission card - loading -->
    <v-skeleton-loader v-if="isLoading">
      <v-skeleton-loader type="sentences"> </v-skeleton-loader>
      <v-skeleton-loader type="heading"> </v-skeleton-loader>
    </v-skeleton-loader>

    <!-- Submission card - content -->
    <div class="flex flex-col gap-4" v-else>
      <!-- Header -->
      <div class="flex flex-col">
        <div class="flex gap-1 items-center">
          <v-icon icon="mdi-message-draw" class="text-indigo-600" />
          <h3>Pengumpulan Tugas</h3>
        </div>
        <p>
          {{
            taskStatus === "proposed"
              ? "Terima tugas agar dapat dikumpulkan"
              : "Kumpulkan tugas sebelum tenggat waktunya"
          }}.
        </p>
      </div>

      <!-- Attachments -->
      <AttachmentList
        v-model:files="files"
        v-model:links="links"
        :removable="taskStatus === 'in_progress'"
      />

      <!-- Actions -->
      <!-- Accept task -->
      <v-btn
        v-if="taskStatus === 'proposed'"
        class="bg-gray-600 text-gray-50"
        elevation="0"
        >Terima penugasan
        <CriticalDialog
          text="Terima penugasan ini?"
          @proceed="$emit('accept-task')"
          color="gray"
          inverse-action
        />
      </v-btn>

      <div v-if="isExecutor" class="flex flex-col gap-4">
        <!-- Cancel submission -->
        <v-btn
          v-if="taskStatus === 'pending_approval'"
          class="bg-red-200 text-red-800"
          elevation="0"
          >Batalkan pengumpulan
          <CriticalDialog
            text="Batalkan pengumpulan?"
            @proceed="handleCancelSubmission"
            color="red"
          />
        </v-btn>

        <div
          v-else-if="taskStatus === 'in_progress'"
          class="flex flex-col gap-2"
        >
          <!-- Add file -->
          <v-btn prepend-icon="mdi-plus" class="text-indigo-600" variant="text"
            >Lampirkan file
            <v-menu activator="parent">
              <v-list>
                <v-list-item @click="" prepend-icon="mdi-link"
                  >Link
                  <InputLinkDialog activator="parent" v-model="links" />
                </v-list-item>
                <v-list-item @click="" prepend-icon="mdi-file"
                  >File
                  <InputFileDialog activator="parent" v-model="files" />
                </v-list-item>
              </v-list>
            </v-menu>
          </v-btn>

          <!-- Submit -->
          <v-btn
            class="bg-indigo-600 text-indigo-50"
            variant="text"
            elevation="0"
            >{{ submitButtonMessage() }}
            <CriticalDialog
              :text="`${submitButtonMessage()}?`"
              color="indigo"
              @proceed="handleSubmit"
            />
          </v-btn>
        </div>
      </div>
    </div>
  </Card>

  <!-- Submission history card -->
  <Card v-if="isExecutor && taskStatus !== 'proposed'">
    <div class="flex flex-col gap-4">
      <!-- Header -->
      <div class="flex gap-1 items-center">
        <v-icon icon="mdi-clock-outline" class="text-indigo-600" />
        <h3>Riwayat Pengumpulan</h3>
      </div>

      <!-- Error alert -->
      <v-alert v-if="error" type="warning" density="default" max-height="4em">
        Error: {{ error }}
      </v-alert>

      <!-- Submissions - loading -->
      <v-skeleton-loader
        v-if="isLoading || isLoading"
        v-for="item in 3"
        type="sentences"
      />
      <!-- Submissions - error -->
      <ErrorState v-else-if="error" @retry="$emit('retry')" />
      <!-- Submissions - empty -->
      <p v-else-if="!submissions">Belum ada pengumpulan untuk tugas ini.</p>

      <!-- History -->
      <div v-else class="flex gap-2">
        <!-- Timeline -->
        <div class="bg-gray-200 w-0.5 rounded-2xl" />

        <!-- History container -->
        <div class="flex flex-col gap-4 w-full">
          <!-- Submissions - content -->
          <SubmissionItem
            v-for="submission in submissions"
            v-bind="submission"
          />
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import SubmissionItem from "@/components/SubmissionItem.vue";
import { useSubmissionsStore } from "@/stores/submissions";
import { onMounted, ref } from "vue";
import Card from "./Card.vue";
import CriticalDialog from "./CriticalDialog.vue";
import InputLinkDialog from "./InputLinkDialog.vue";
import AttachmentList from "./AttachmentList.vue";
import InputFileDialog from "./InputFileDialog.vue";
import ErrorState from "./ErrorState.vue";
import type { TaskStatus } from "@/schemas/task.ts";
import type { Submission } from "@/schemas/submission.ts";

const props = defineProps<{
  taskStatus: TaskStatus;
  submissions: Submission[];
  error: string | null;
  isLoading: boolean;
  isExecutor: boolean;
}>();

const emit = defineEmits(["accept-task", "retry", "submit", "cancel"]);

const files = ref<File[]>([]);
const links = ref<URL[]>([]);

const submitButtonMessage = () =>
  files.value.length || links.value.length
    ? "Kumpulkan"
    : "Tandai sebagai selesai";

function handleCancelSubmission() {
  alert("Pengumpulan dibatalkan");
  emit("cancel");
}

function handleSubmit() {
  alert("Tugas dikumpulkan");
  emit("submit");
}

// onMounted(() => submissions.fetchSubmissions());
</script>
