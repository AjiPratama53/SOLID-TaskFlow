<template>
  <!-- Back button -->
  <v-btn
    class="bg-indigo-600 text-indigo-50"
    prepend-icon="mdi-arrow-left"
    text="Kembali ke dasbor"
  />

  <!-- Header -->
  <Header
    title="Detail Tugas"
    subtitle="Bagi menjadi subtugas, delegasikan ke rekan, kumpulkan hasil."
  />

  <div class="flex gap-4 w-full">
    <!-- Content -->
    <div class="flex flex-2 flex-col gap-4">
      <Card class="flex flex-col gap-4">
        <!-- Task header -->
        <div class="flex justify-between items-start">
          <div class="flex flex-col">
            <h5>Diposting oleh <strong>[proposer.name]</strong></h5>
            <h5>[createdAt], Diedit [editedAt]</h5>
          </div>

          <!-- Task status -->
          <div class="px-4 py-0.5 bg-green-200 text-green-800 rounded-2xl">
            <h4>• [Status]</h4>
          </div>
        </div>

        <!-- Title -->
        <a href="">
          <h2>[Judul]</h2>
        </a>

        <!-- Deadline -->
        <div class="flex gap-1">
          <v-icon icon="mdi-clock-outline" />
          <p>Tenggat: <strong>[deadline]</strong></p>
        </div>

        <!-- Description -->
        <p>
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
          commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus
          et.
        </p>

        <!-- Attachments -->

        <!-- Subtasks -->
        <div class="flex flex-col gap-2">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <v-icon icon="mdi-text" class="text-indigo-600" />
              <h3>Daftar Subtugas</h3>
            </div>
            <h5>4 Subtugas aktif</h5>
          </div>

          <!-- Subtask container -->
          <div class="flex flex-col items-start gap-2 w-full">
            <!-- New subtask -->
            <NewTask is-subtask />

            <!-- Subtask item -->
            <v-card
              v-for="value in 3"
              class="flex flex-col w-full gap-2 p-4 bg-indigo-100"
              elevation="0"
            >
              <!-- header -->
              <div class="flex items-center justify-between">
                <div class="flex gap-1 items-center">
                  <v-icon
                    icon="mdi-check"
                    size="small"
                    class="bg-green-200 text-green-700 rounded-2xl p-4"
                  />
                  <h4>[judul]</h4>
                </div>
                <div
                  class="px-4 py-0.5 bg-green-200 text-green-800 rounded-2xl"
                >
                  <h5>• [Status]</h5>
                </div>
              </div>

              <!-- body -->
              <div class="flex items-center justify-between">
                <!-- deadline -->
                <div class="flex gap-1 items-center">
                  <v-icon icon="mdi-clock-outline" size="small" />
                  <p>Tenggat: [deadline]</p>
                </div>

                <!-- detail & action -->
                <div class="flex gap-1 items-center">
                  <!-- colleagues -->
                  <card class="flex px-2.5 py-1 rounded-2xl" elevation="0">
                    <UserItem name="[Rekan 1]" />
                  </card>

                  <!-- action -->
                  <v-btn
                    prepend-icon="mdi-swap-horizontal"
                    class="bg-indigo-600 text-indigo-50"
                    elevation="0"
                    >Alihkan</v-btn
                  >
                </div>
              </div>
            </v-card>
          </div>
        </div>
        <!-- Actions -->
        <div class="flex flex-col gap-2">
          <!-- Accept -->
          <v-btn class="bg-gray-600 text-gray-50" elevation="0"
            >Terima Penugasan</v-btn
          >

          <div class="flex gap-2 w-full">
            <!-- Cancel -->
            <v-btn class="flex flex-1 bg-red-200 text-red-800" elevation="0"
              >Batalkan Penugasan</v-btn
            >
            <!-- Delegate -->
            <v-btn
              class="flex flex-1 bg-gray-600 text-gray-50"
              elevation="0"
              prepend-icon="mdi-account-plus-outline"
              >Delegasikan</v-btn
            >
          </div>
        </div>
      </Card>
    </div>

    <!-- Side panel -->
    <div class="flex flex-1 flex-col gap-4">
      <!-- Submission card -->
      <Card>
        <div class="flex flex-col gap-4">
          <!-- Header -->
          <div class="flex flex-col">
            <div class="flex gap-1 items-center">
              <v-icon icon="mdi-message-draw" class="text-indigo-600" />
              <h3>Pengumpulan Tugas</h3>
            </div>
            <p>Kumpulkan tugas sebelum tenggat waktunya.</p>
          </div>

          <!-- Attachments -->
          <div class="flex flex-col gap-2"></div>

          <!-- Actions -->
          <div class="flex flex-col gap-2">
            <!-- Add file -->
            <v-btn
              prepend-icon="mdi-plus"
              class="text-indigo-600"
              variant="text"
              >Lampirkan File/Text</v-btn
            >

            <!-- Submit -->
            <v-btn
              class="bg-indigo-600 text-indigo-50"
              variant="text"
              elevation="0"
              >Kumpulkan</v-btn
            >

            <!-- Cancel submission -->
            <v-btn class="bg-red-200 text-red-800" elevation="0"
              >Batalkan Pengumpulan</v-btn
            >
          </div>
        </div>
      </Card>

      <!-- Submission history card -->
      <Card>
        <div class="flex flex-col gap-4">
          <!-- Header -->
          <div class="flex gap-1 items-center">
            <v-icon icon="mdi-clock-outline" class="text-indigo-600" />
            <h3>Riwayat Pengumpulan</h3>
          </div>

          <!-- History -->
          <div class="flex gap-2">
            <!-- Timeline -->
            <div class="bg-gray-200 w-0.5 rounded-2xl" />

            <!-- History container -->
            <div class="flex flex-col gap-4 w-full">
              <!-- History item -->
              <div v-for="value in 3" class="flex justify-between gap-8">
                <div class="flex gap-4">
                  <v-icon
                    class="bg-green-200 text-green-800 rounded-2xl p-3"
                    icon="mdi-check"
                    size="xsmall"
                  />
                  <p>Diterima</p>
                </div>
                <p>[date-time]</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '@/components/Card.vue'
import Header from '@/components/Header.vue'
import NewTask from '@/components/NewTask.vue'
import UserItem from '@/components/UserItem.vue'

const submissions = [{}]
</script>
