<template>
  <!-- Back button -->
  <v-btn
    class="bg-indigo-600 text-indigo-50"
    elevation="0"
    prepend-icon="mdi-arrow-left"
    text="Kembali ke detail tugas"
    @click="$router.back()"
  />

  <!-- Header -->
  <Header
    title="Verifikasi Pengumpulan"
    subtitle="Evaluasi hasil kerja kiriman rekan Anda."
  />

  <div class="flex gap-4 flex-1 w-full">
    <!-- Content -->
    <div class="flex flex-2 flex-col gap-4">
      <Card class="flex flex-col gap-4">
        <!-- Task header -->
        <div class="flex justify-between items-start">
          <h5>Dikirim oleh <strong>[proposer.name]</strong></h5>

          <!-- Task status -->
          <h4
            :class="`px-4 py-0.5 bg-${statusColor}-200 text-${statusColor}-800 rounded-2xl`"
          >
            • {{ statusMessage }}
          </h4>
        </div>

        <!-- Title -->
        <!-- <h2>{{ submission. }}</h2> -->

        <!-- Deadline -->
        <div class="flex gap-1">
          <v-icon icon="mdi-clock-outline" />
          <span class="flex gap-1 items-center">
            <p>Waktu Pengumpulan: <strong>Tepat Waktu</strong></p>
            <h5>(Diserahkan pada {{ formatDateTime(submission?.date) }})</h5>
          </span>
        </div>

        <!-- Description -->
        <!-- <p>
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
          commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus
          et.
        </p> -->

        <!-- Attachments -->
        <div class="flex flex-col gap-2">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <div class="flex items-center gap-1">
                <v-icon icon="mdi-text" class="text-indigo-600" />
                <h3>Daftar Lampiran</h3>
              </div>
              <h5>[n] Lampiran</h5>
            </div>
            <v-btn
              class="text-indigo-600"
              prepend-icon="mdi-check-underline"
              text="Unduh semua (.zip)"
              variant="text"
            />
          </div>
        </div>
      </Card>
    </div>

    <!-- Side panel -->
    <div class="flex flex-1 flex-col gap-4">
      <!-- Verification card -->
      <Card>
        <div class="flex flex-col gap-4">
          <!-- Header -->
          <div class="flex flex-col">
            <div class="flex gap-1 items-center">
              <v-icon icon="mdi-message-draw" class="text-indigo-600" />
              <h3>Keputusan Verifikasi</h3>
            </div>
            <p>
              Periksa kelengkapan lampiran dan terima/tolak pengumpulan ini
              secara teliti.
            </p>
          </div>

          <!-- Comments -->
          <div class="flex flex-col gap-2">
            <h4>Komentar</h4>
            <v-textarea
              density="compact"
              hide-details="auto"
              class="w-full"
              clearable
              placeholder="Tulis catatan review atau instruksi revisi"
              variant="outlined"
            />
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-2">
            <!-- Accept -->
            <v-btn
              id="accept-submission"
              prepend-icon="mdi-check-circle-outline"
              class="bg-green-600 text-green-50"
              elevation="0"
              >Terima dan Setujui</v-btn
            >
            <CriticalDialog
              activator="#accept-submission"
              text="Terima pengumpulan?"
              :action="() => console.log('Accepted')"
              color="green"
              inverse-action
            />

            <!-- Cancel submission -->
            <v-btn
              prepend-icon="mdi-close-circle-outline"
              class="bg-red-600 text-red-50"
              elevation="0"
              >Tolak dan Minta Revisi</v-btn
            >
            <!-- <DialogButton text="Batalkan Pengumpulan" bg-color="red-200" text-color="red-800" elevation="0" block>
              <v-card elevation="0">
                hello
              </v-card>
            </DialogButton> -->
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '@/components/Card.vue'
import CriticalDialog from '@/components/CriticalDialog.vue'
import Header from '@/components/Header.vue'
import {
  submissionStatusColor,
  submissionStatusMessage,
  type Submission,
} from '@/schemas/submission'
import { formatDateTime } from '@/utils/formatDateTime'
import { ref } from 'vue'

const submission = ref<Submission>()

const statusMessage =
  submissionStatusMessage[submission.value?.status ?? 'pending_approval']
const statusColor =
  submissionStatusColor[submission.value?.status ?? 'pending_approval']
</script>
