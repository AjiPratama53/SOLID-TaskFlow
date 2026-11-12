<template>
  <v-app class="bg-indigo-50">
    <login />
    <!-- <home /> -->
    <!-- <v-main> -->
    <!-- <HelloWorld />
      <v-btn
        class="m-2"
        icon="mdi-theme-light-dark"
        location="top right"
        position="absolute"
        @click="$vuetify.theme.cycle()"
      /> -->
    <!-- </v-main> -->
  </v-app>
</template>

<script lang="ts" setup>
import HelloWorld from '@/components/HelloWorld.vue'
import Login from './views/Login.vue'
import Home from './views/Home.vue'
</script>
