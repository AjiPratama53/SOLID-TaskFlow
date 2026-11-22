<template>
  <aside class="flex-1 flex flex-col justify-between gap-8 h-full">
    <div class="flex flex-col gap-4">
      <!-- Account -->
      <div class="flex flex-col gap-2 items-start">
        <user-item v-bind="user" />
        <v-btn
          prepend-icon="mdi-logout"
          text="Keluar"
          variant="text"
          density="compact"
          @click="$router.push('/login')"
        />
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
              colleagues.inviteUser({
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

const colleagues = useUsersStore()

const user: User = {
  id: 'usr_001',
  name: 'Admin',
  avatar: 'logo.svg',
}
</script>
