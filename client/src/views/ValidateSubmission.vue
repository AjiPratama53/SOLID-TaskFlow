<template>
  <!-- Back button -->
  <v-btn
    class="bg-indigo-600 text-indigo-50"
    elevation="0"
    prepend-icon="mdi-arrow-left"
    text="Kembali ke detail tugas"
  />

  <!-- Header -->
  <Header
    title="Verifikasi Pengumpulan"
    subtitle="Evaluasi hasil kerja kiriman rekan Anda."
  />

    <div class="flex gap-4 w-full">
        <!-- Content -->
            <div class="flex flex-2 flex-col gap-4">

                <Card class="flex flex-col gap-4">
                            <!-- Task header -->
        <div class="flex justify-between items-start">
            <h5>Dikirim oleh <strong>[proposer.name]</strong></h5>

          <!-- Task status -->
          <div class="px-4 py-0.5 bg-green-200 text-green-800 rounded-2xl">
            <h4>• [Status]</h4>
          </div>
        </div>

        <!-- Title -->
        <h2>[Judul]</h2>

        <!-- Deadline -->
        <div class="flex gap-1">
          <v-icon icon="mdi-clock-outline" />
          <span class="flex gap-1 items-center">
              <p>Waktu Pengumpulan: <strong>Tepat Waktu</strong></p>
              <h5>(Diserahkan pada [createdAt])</h5>
          </span>
        </div>

        <!-- Description -->
        <p>
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
          commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus
          et.
        </p>

        <!-- Attachments section -->

                </Card>
            </div>

                <!-- Side panel -->
    <div class="flex flex-1 flex-col gap-4">
        <!-- Verification card -->
         <Card>
            
         </Card>
    </div>

    </div>

</template>

<script setup lang="ts">
import Card from '@/components/Card.vue';
import Header from '@/components/Header.vue';


</script>