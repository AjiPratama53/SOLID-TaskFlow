<template>
  <div class="flex items-center justify-center w-full h-full">
    <!-- Card -->
    <v-card class="flex bg-gray-50" max-width="50rem">
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
      <div class="flex flex-1 p-8 flex-col gap-4">
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
          <div class="flex flex-1 border rounded-md overflow-hidden">
            <input
              class="flex-1 px-4"
              type="text"
              name="provider"
              id="provider"
              v-model="input"
              placeholder="https://solidcommunity.net"
              @keyup.enter="handleLogin()"
            />
            <v-btn
              rounded="none"
              elevation="0"
              class="bg-indigo-600 text-indigo-50"
              icon="mdi-login"
              :loading="isLoggingIn"
              @click="handleLogin()"
            />
          </div>
        </div>
        <v-alert v-if="error" type="error" density="compact">
          {{ error }}
        </v-alert>
        <!-- Provider options -->
        <div class="flex flex-col gap-1">
          <v-btn
            class="bg-indigo-600 text-indigo-50"
            block
            size="large"
            elevation="0"
            v-for="provider in solidProviders"
            :disabled="isLoggingIn"
            @click="input = `https://${provider}`"
            >{{ provider }}</v-btn
          >
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { signIn } from "@/services/auth";
import debounce from "debounce";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const features = [
  { icon: "share-variant", text: "Pembagian Subtugas" },
  { icon: "check-decagram", text: "Verifikasi Pengumpulan" },
  { icon: "shield-check", text: "Data Milik Pribadi" },
];

const solidProviders = [
  "solidcommunity.net",
  "solidweb.org",
  "solidweb.me",
  "inrupt.com",
];

const route = useRoute();
const input = ref("");
const error = ref<string | null>(null);
const isLoggingIn = ref(false);

const POST_LOGIN_REDIRECT_KEY = "solid_post_login_redirect";

function resolveTargetPath(): string {
  const redirectParam = route.query.redirect;
  if (typeof redirectParam === "string" && redirectParam.startsWith("/")) {
    return redirectParam;
  }
  return "/home";
}

async function handleLogin() {
  if (isLoggingIn.value) return;

  isLoggingIn.value = true;
  error.value = null;
  sessionStorage.setItem("POST_LOGIN_REDIRECT_KEY", resolveTargetPath());

  try {
    await signIn(input.value, "/");
  } catch (err) {
    sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    error.value =
      err instanceof Error ? err.message : "Gagal memulai proses login.";
  } finally {
    isLoggingIn.value = false;
  }
}

watch(
  () => input.value,
  debounce(async (value: string) => {
    if (value.trim()) {
      await handleLogin();
    }
  }, 1000),
);
</script>
