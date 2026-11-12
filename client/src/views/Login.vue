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
                            <div class="rounded-lg h-8 aspect-square bg-amber-200"></div>
                            <h3>{{ feature.text }}</h3>
                        </v-card>
                    </div>
                </div>
            </div>

            <!-- Right Panel -->
            <div class="flex flex-2 p-8 flex-col gap-2">
                <!-- Heading -->
                <div class="flex flex-col">
                    <h1>Login dengan SOLID</h1>
                    <p>Daftarkan pod anda untuk masuk.</p>
                </div>
                <!-- Input container -->
                 <div class="flex flex-col gap-1">
                    <h3>SOLID Provider</h3>
                    <v-text-field class="p-0" clearable placeholder="https://solidcommunity.net" variant="outlined"></v-text-field>    
                 </div>
                <!-- Provider options -->
                 <div class="flex flex-col gap-1">
                    <v-btn class="bg-indigo-600 text-purple-50" block size="large" elevation="0" v-for="provider in solidProviders">{{ provider }}</v-btn>
                 </div>
            </div>
        </v-card>
    </div>
</template>

<script setup lang="ts">
const features = [
    {text: "Pembagian Tugas"},
    {text: "Verifikasi Pengumpulan"},
    {text: "Data Milik Pribadi"}
]

const solidProviders = [
    "solidcommunity.net",
    "solidweb.org",
    "solidweb.me",
    "inrupt.com"
]
</script>