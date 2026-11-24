<template>
  <aside class="flex-1 flex flex-col justify-between gap-8 h-full">
    <div class="flex flex-col gap-4">
      <!-- Account -->
      <div class="flex flex-col gap-2 items-start">
        <user-item
          v-bind="
            {
              id: user?.webId ?? '',
              name: user?.name ?? '',
              avatar: user?.avatarUrl,
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
        <v-alert v-if="session.error" type="error" density="compact">
          {{ session.error }}
        </v-alert>
      </div>
      <v-divider />

      <!-- Colleagues -->
      <div class="flex flex-col gap-4">
        <!-- Colleagues list -->
        <div v-if="colleagues.getUsers.length > 0" class="flex flex-col gap-2">
          <p>Rekan anda</p>

          <!-- Colleagues item -->
          <user-item
            v-for="colleague in colleagues.getUsers"
            v-bind="colleague"
          />
        </div>
        <invite-card
          @invite="
            (e) =>
              colleagues.postUser({
                id: `usr_${Math.round(Math.random() * 1000)}`,
                name: e,
              })
          "
        />
      </div>
    </div>

    <!-- Brand -->
    <a href="">
      <img src="@/assets/brand.svg" alt="SOLID TaskFlow" />
    </a>
  </aside>
</template>

<script setup lang="ts">
import { useUsersStore } from '@/stores/users.ts'
import InviteCard from './InviteCard.vue'
import UserItem from './UserItem.vue'
import type { User } from '@/schemas/user.ts'
import { computed, onMounted } from 'vue'
import { useSessionStore } from '@/stores/session.ts'
import { useRouter } from 'vue-router'

const session = useSessionStore()
const colleagues = useUsersStore()
const router = useRouter()
const user = computed(() => session.getProfile)

async function handleSignOut() {
  try {
    await session.signOut()
    await router.push('/login')
  } catch (err) {
    session.error =
      err instanceof Error ? err.message : 'Gagal mengakhiri sesi Solid.'
  }
}

onMounted(async () => {
  await colleagues.fetchUsers()
})
</script>
