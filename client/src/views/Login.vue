<template>
    <div class="flex items-center justify-center w-full h-full">
        <!-- Card -->
        <v-card class="flex bg-gray-50">
            <div class="flex flex-1 p-8 bg-indigo-100">
                <!-- Left panel -->
                <div class="flex flex-col gap-4">
                    <img src="@/assets/brand.svg" alt="SOLID TaskFlow">
                    <div class="flex flex-col gap-2">
                        <h2>Kelola, Delegasikan, & Selesaikan Tugas Lebih Cepat.</h2>
                        <p>Platform pengelolaan tugas kolaboratif - Berbasis SOLID</p>
                    </div>
                    <div class="flex flex-col gap-1">
                        <v-card v-for="feature in features" elevation="0" class="flex p-2 gap-2 items-center">
                            <div class="flex rounded-lg h-8 aspect-square bg-indigo-200 text-indigo-800 items-center justify-center">
                                <v-icon :icon="`mdi-${feature.icon}`"/>
                            </div>
                            <h3>{{ feature.text }}</h3>
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
                    <div class="flex flex-1 border border-gray-600 rounded-md overflow-hidden">
                        <!-- <v-text-field 
                            clearable 
                            placeholder="https://solidcommunity.net" 
                            variant="outlined"
                            v-model="selectedProvider"
                            ></v-text-field> -->
                            <input
                            class="flex-1 px-4"
                            type="text" name="provider" id="provider" 
                            v-model="selectedProvider" placeholder="https://solidcommunity.net">
                        <v-btn rounded="none" elevation="0" class="bg-indigo-600 text-purple-50" icon="mdi-login"/>
                        <!-- <button>
                            <v-icon icon="mdi-login"
                            class="bg-indigo-600 text-indigo-50 px-8 h-full"></v-icon>
                        </button> -->
                    </div>
                 </div>
                <!-- Provider options -->
                 <div class="flex flex-col gap-1">
                    <v-btn class="bg-indigo-600 text-purple-50" block size="large" elevation="0" 
                    v-for="provider in solidProviders"  
                    @click="selectedProvider = `https://${provider}`">{{ provider }}</v-btn>
                 </div>
            </div>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const features  = [
    {icon: "share-variant", text: "Pembagian Tugas"},
    {icon: "check-decagram", text: "Verifikasi Pengumpulan"},
    {icon: "shield-check", text: "Data Milik Pribadi"}
]

const solidProviders = [
    "solidcommunity.net",
    "solidweb.org",
    "solidweb.me",
    "inrupt.com"
]

const selectedProvider = ref("")
</script>