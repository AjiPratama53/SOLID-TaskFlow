<template>
  <aside class="flex-1 flex flex-col justify-between gap-8 h-full">
    <div class="flex flex-col gap-4">
      <!-- Account -->
      <div class="flex flex-col gap-2 items-start">
        <user-item
          v-bind="
            {
              id: user?.webId ?? '',
              name: user?.name ?? user?.webId ?? '',
              avatar: user?.avatarUrl ?? undefined,
            } as User
          "
        />
        <v-btn
          prepend-icon="mdi-logout"
          text="Keluar"
          variant="text"
          density="compact"
          @click="handleSignOut"
        />
        <v-alert v-if="error" type="error" density="compact">
          {{ error }}
        </v-alert>
      </div>
      <v-divider />

      <!-- Colleagues -->
      <div class="flex flex-col gap-4">
        <template v-if="colleagues.error">
          <v-alert type="warning" density="compact" max-height="4em">
            Error: {{ colleagues.error }}
          </v-alert>
          <v-btn
            elevation="0"
            class="bg-indigo-600 text-indigo-50"
            text="Coba lagi"
            prepend-icon="mdi-refresh"
            @click="colleagues.fetchUsers"
          />
        </template>
        <v-skeleton-loader
          v-else-if="colleagues.isLoading"
          v-for="item in 3"
          class="bg-transparent"
          type="list-item-avatar"
        />
        <!-- Colleagues empty -->
        <p v-else-if="colleagues.isEmpty">Belum ada teman di profil Solid.</p>
        <!-- Colleagues list -->
        <div v-else class="flex flex-col gap-2">
          <p>Rekan anda</p>

          <!-- Colleagues item -->
          <user-item
            v-for="colleague in colleagues.getUsers"
            v-bind="colleague"
          />
        </div>
        <invite-card v-if="!colleagues.isLoading" />
      </div>
    </div>

    <!-- Brand -->
    <a @click="$router.push('/')">
      <img src="@/assets/brand.svg" alt="SOLID TaskFlow" />
    </a>
  </aside>
</template>

<script setup lang="ts">
import type { SolidUserProfile } from "@/schemas/session";
import type { User } from "@/schemas/user.ts";
import { api } from "@/services/api";
import { sessionInfo, signOut } from "@/services/auth";
import { useUsersStore } from "@/stores/users.ts";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import InviteCard from "./InviteCard.vue";
import UserItem from "./UserItem.vue";

const colleagues = useUsersStore();
const router = useRouter();
const user = ref<SolidUserProfile | null>(null);
const error = ref<string | null>(null);

async function handleSignOut() {
  error.value = null;
  try {
    await signOut();
    await router.push("/login");
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Gagal mengakhiri sesi Solid.";
  }
}

onMounted(async () => {
  const session = sessionInfo();
  if (session.isLoggedIn && session.webId) {
    try {
      user.value = await api.session.get(session.webId);
    } catch (err) {
      user.value = {
        webId: session.webId,
        name: null,
        avatarUrl: null,
        podUrls: [],
      };
      error.value =
        err instanceof Error ? err.message : "Gagal memuat profil WebID.";
    }
  }
  await colleagues.fetchUsers();
});
</script>
