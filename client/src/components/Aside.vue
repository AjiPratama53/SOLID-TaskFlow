<template>
  <aside class="flex-1 flex flex-col justify-between h-full">
    <div class="flex flex-col gap-4">
      <!-- Account -->
      <div class="flex flex-col gap-2 items-start">
        <user-item :name="'[User]'" />
        <v-btn
          prepend-icon="mdi-logout"
          text="Keluar"
          variant="text"
          density="compact"
        />
      </div>
      <v-divider />

      <!-- Colleagues -->
      <div class="flex flex-col gap-4">
        <!-- Colleagues list -->
        <div class="flex flex-col gap-2">
          <p>Rekan anda</p>

          <!-- Colleagues item -->
          <user-item v-for="value in 3" :name="`[Rekan ${value}]`" />
        </div>
        <invite-card />
      </div>
    </div>

    <!-- Brand -->
    <a href="">
      <img src="@/assets/brand.svg" alt="SOLID TaskFlow" />
    </a>
  </aside>
</template>

<script setup lang="ts">
import InviteCard from './InviteCard.vue'
import UserItem from './UserItem.vue'
</script>
