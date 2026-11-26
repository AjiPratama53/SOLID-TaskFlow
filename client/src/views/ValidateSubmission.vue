<template>
  <!-- Back button -->
  <v-btn
    class="text-indigo-600"
    variant="text"
    density="compact"
    elevation="0"
    prepend-icon="mdi-arrow-left"
    text="Kembali"
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
      <v-alert v-if="error" type="warning" density="default" max-height="4em">
        Error: {{ error }}
      </v-alert>

      <Card>
        <!-- Submission - error -->
        <ErrorState v-if="error" @retry="loadSubmission" />

        <!-- Submission - loading -->
        <div v-else-if="isLoading" class="flex flex-col w-full">
          <div class="flex justify-between items-start">
            <v-skeleton-loader class="bg-transparent m-0 w-1/5" type="text" />
            <v-skeleton-loader
              class="bg-transparent m-0 w-1/5"
              type="heading"
            />
          </div>
          <v-skeleton-loader class="bg-transparent w-1/2" type="text" />
          <v-skeleton-loader class="bg-transparent w-1/5" type="sentences" />
        </div>

        <!-- Submission - empty -->
        <EmptyState
          v-else-if="!submission"
          text="Pengumpulan tidak ditemukan"
          has-action
          prepend-icon="mdi-arrow-left"
          button-text="Kembali"
          @proceed="$router.back"
        />

        <!-- Submission - content -->
        <div v-else class="flex flex-col gap-4">
          <!-- Header -->
          <div class="flex justify-between items-start">
            <h5>Dikirim oleh <strong>[proposer.name]</strong></h5>

            <!-- status -->
            <h4
              :class="[
                'px-4 py-0.5 rounded-2xl',
                statusClasses.background200,
                statusClasses.text800,
              ]"
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
                <h5>{{ files.length + links.length }} lampiran</h5>
              </div>
              <!-- <v-btn
                 class="text-indigo-600"
                 prepend-icon="mdi-check-underline"
                 text="Unduh semua (.zip)"
                 variant="text"
               /> -->
            </div>

            <!-- Attachment list -->
            <AttachmentList
              v-if="files.length > 0 || links.length > 0"
              :files
              :links
              downloadable
            />
            <!-- <v-btn
              >Link
              <InputLinkDialog activator="parent" v-model="links" />
            </v-btn>
            <v-btn
              >File
              <InputFileDialog activator="parent" v-model="files" />
            </v-btn> -->
          </div>
        </div>
      </Card>
    </div>

    <!-- Side panel -->
    <div class="flex flex-1 flex-col gap-4">
      <Card>
        <!-- Verification card - Loading -->
        <v-skeleton-loader v-if="isLoading">
          <v-skeleton-loader type="paragraph"> </v-skeleton-loader>
          <v-skeleton-loader type="image"> </v-skeleton-loader>
          <v-skeleton-loader type="actions"> </v-skeleton-loader>
        </v-skeleton-loader>

        <!-- Verification card - content -->
        <div v-else-if="submission" class="flex flex-col gap-4">
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
          <div class="flex gap-2">
            <!-- Accept -->
            <v-btn
              id="accept-submission"
              prepend-icon="mdi-check-circle-outline"
              class="flex-1 bg-green-600 text-green-50"
              elevation="0"
              >Terima</v-btn
            >
            <CriticalDialog
              activator="#accept-submission"
              text="Terima pengumpulan?"
              @proceed="handleAccept"
              color="green"
              inverse-action
            />

            <!-- Cancel submission -->
            <v-btn
              prepend-icon="mdi-close-circle-outline"
              class="flex-1 bg-red-600 text-red-50"
              elevation="0"
              >Tolak
              <CriticalDialog
                text="Tolak pengumpulan?"
                @proceed="handleReject"
                color="red"
              />
            </v-btn>
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
import AttachmentList from '@/components/AttachmentList.vue'
import Card from '@/components/Card.vue'
import CriticalDialog from '@/components/CriticalDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import Header from '@/components/Header.vue'
import InputFileDialog from '@/components/InputFileDialog.vue'
import InputLinkDialog from '@/components/InputLinkDialog.vue'
import {
  submissionStatusColor,
  submissionStatusMessage,
  type Submission,
} from '@/schemas/submission'
import { api } from '@/services/api'
import { formatDateTime } from '@/utils/formatDateTime'
import { statusColorClasses } from '@/utils/statusColorClasses'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const submissionId = computed<string | undefined>(() => {
  const raw: string | string[] | undefined = route.params.id
  const value: string | undefined = Array.isArray(raw) ? raw[0] : raw
  return value
})

const submission = ref<Submission | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(false)

const files = ref<File[]>([])
const links = ref<string[]>([])

const statusMessage =
  submissionStatusMessage[submission.value?.status ?? 'pending_approval']
const statusColor =
  submissionStatusColor[submission.value?.status ?? 'pending_approval']
const statusClasses = statusColorClasses[statusColor]

async function loadSubmission() {
  isLoading.value = true
  error.value = null

  try {
    // API call here
    const data = await api.submission.get({ id: submissionId.value })

    // throw new Error('Uji Error State')
    submission.value = data[0]
    // {
    //   id: 'sbm_001',
    //   date: new Date(),
    //   status: 'pending_approval',
    // }
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Gagal memuat data dari Solid Pod.'
  } finally {
    isLoading.value = false
  }
}

function handleAccept() {
  alert('Accepted')
}

function handleReject() {
  alert('Rejected')
}

onMounted(() => loadSubmission())
</script>
