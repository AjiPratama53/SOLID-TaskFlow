<template>
  <div class="flex items-center justify-center w-full h-full">
    <!-- Card -->
    <v-card class="flex bg-gray-50">
      <div class="flex flex-1 p-8 bg-indigo-100">
        <!-- Left panel -->
        <div class="flex flex-col gap-4">
          <img src="@/assets/brand.svg" alt="SOLID TaskFlow" />
          <div class="flex flex-col gap-2">
            <h2>Kelola, Delegasikan, & Selesaikan Tugas Lebih Cepat.</h2>
            <p>Platform pengelolaan tugas kolaboratif - Berbasis SOLID</p>
          </div>
          <div class="flex flex-col gap-1">
            <v-card
              v-for="feature in features"
              elevation="0"
              class="flex p-2 gap-2 items-center"
            >
              <div
                class="flex rounded-lg h-8 aspect-square bg-indigo-200 text-indigo-800 items-center justify-center"
              >
                <v-icon :icon="`mdi-${feature.icon}`" />
              </div>
              <h4>{{ feature.text }}</h4>
            </v-card>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="flex flex-2 p-8 flex-col gap-4">
        <!-- Heading -->
        <div class="flex flex-col">
          <h1>Login dengan SOLID</h1>
          <p>Daftarkan pod anda untuk masuk.</p>
        </div>
        <!-- Input container -->
        <div class="flex flex-col gap-1">
          <h3>SOLID Provider</h3>
          <!-- <v-text-field
            clearable
            placeholder="https://solidcommunity.net"
            variant="outlined"
            v-model="input"
            messages=""
          /> -->
          <div class="flex flex-1 border-1 rounded-md overflow-hidden">
            <input
              class="flex-1 px-4"
              type="text"
              name="provider"
              id="provider"
              v-model="input"
              placeholder="https://solidcommunity.net"
            />
            <v-btn
              rounded="none"
              elevation="0"
              class="bg-indigo-600 text-indigo-50"
              icon="mdi-login"
              @click="handleInput"
            />
          </div>
        </div>
        <!-- Provider options -->
        <div class="flex flex-col gap-1">
          <v-btn
            class="bg-indigo-600 text-indigo-50"
            block
            size="large"
            elevation="0"
            v-for="provider in solidProviders"
            @click="input = `https://${provider}`"
            >{{ provider }}</v-btn
          >
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import debounce from 'debounce'
import { ref, watch } from 'vue'

const features = [
  { icon: 'share-variant', text: 'Pembagian Tugas' },
  { icon: 'check-decagram', text: 'Verifikasi Pengumpulan' },
  { icon: 'shield-check', text: 'Data Milik Pribadi' },
]

const solidProviders = [
  'solidcommunity.net',
  'solidweb.org',
  'solidweb.me',
  'inrupt.com',
]

const input = ref('')

function handleInput() {
  if (!input.value) return

  // handle login input
  alert(`Login dengan ${input.value}`)
}

watch(
  () => input.value,
  debounce(() => {
    handleInput()
  }, 1000),
)
</script>
