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
        v-for="value in 3"
        class="flex justify-start px-4 py-6"
        density="default"
        @click="
          () => {
            action()
            isActive.value = false
          }
        "
      >
        <user-item :name="`[Rekan ${value}]`" />
      </v-btn>

      <!-- Publish button -->
      <v-btn
        rounded="none"
        elevation="0"
        class="bg-gray-600 text-gray-50"
        prepend-icon="mdi-tray-arrow-up"
        @click="
          () => {
            action()
            isActive.value = false
          }
        "
        >Publikasikan</v-btn
      >
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import UserItem from './UserItem.vue'

defineProps<{
  action: Function
}>()
</script>
