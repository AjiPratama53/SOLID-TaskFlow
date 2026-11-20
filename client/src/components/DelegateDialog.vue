<template>
  <v-dialog activator="parent" max-width="320" v-slot:default="{ isActive }">
    <v-card>
      <!-- Header -->
      <div class="flex justify-center px-8 py-4">
        <h3>Delegasikan</h3>
      </div>

      <!-- User list -->
      <v-btn
        rounded="none"
        elevation="0"
        v-for="user in users.getUsers"
        class="flex justify-start px-4 py-6"
        density="default"
        @click="
          () => {
            handleDelegate(user)
            isActive.value = false
          }
        "
      >
        <user-item v-bind="user" />
      </v-btn>

      <!-- Publish button -->
      <v-btn
        rounded="none"
        elevation="0"
        class="bg-gray-600 text-gray-50"
        prepend-icon="mdi-tray-arrow-up"
        @click="
          () => {
            handlePublish()
            isActive.value = false
          }
        "
        >Publikasikan</v-btn
      >
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { User } from '@/schemas/user.ts'
import UserItem from './UserItem.vue'
import { useUsersStore } from '@/stores/users.ts'

const props = defineProps<User>()

const users = useUsersStore()

function handleDelegate(user: User) {
  alert('Tugas didelegasikan ke ' + user.name)
}

function handlePublish() {
  alert('Tugas dipublikasikan')
}
</script>
