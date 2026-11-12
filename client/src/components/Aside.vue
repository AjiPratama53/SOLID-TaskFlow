<template>
  <aside class="flex-1 flex flex-col justify-between h-full">
    <div class="flex flex-col gap-4">
      <!-- Account -->
      <p>Hello, World</p>
      <v-divider></v-divider>

      <!-- Colleagues -->
      <div class="flex flex-col gap-4">
        <invite-card />
      </div>
    </div>

    <!-- Brand -->
    <a href="http://localhost:3000/">
      <img src="@/assets/brand.svg" alt="SOLID TaskFlow" />
    </a>
  </aside>
</template>

<script setup lang="ts">
import InviteCard from './InviteCard.vue'
</script>
