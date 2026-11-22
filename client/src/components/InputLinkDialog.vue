<template>
  <v-dialog :activator max-width="640" v-slot:default="{ isActive }">
    <v-card v-if="isActive">
      <div class="flex flex-col p-6 gap-4 w-full">
        <h4>Tambahkan link</h4>
        <v-text-field
          density="compact"
          autofocus
          hide-details="auto"
          class="w-full"
          clearable
          placeholder="https://..."
          variant="outlined"
          v-model="input"
          @keyup.enter="
            () => {
              handleUpload()
              isActive.value = false
            }
          "
        />
      </div>
      <div class="flex">
        <v-btn
          @click="isActive.value = false"
          class="flex-1 text-indigo-600"
          variant="text"
          >Batal</v-btn
        >
        <v-btn
          @click="
            () => {
              handleUpload()
              isActive.value = false
            }
          "
          class="flex-1 text-indigo-600"
          variant="text"
          >Tambahkan link</v-btn
        >
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, type ComponentPublicInstance } from 'vue'

const emit = defineEmits(['upload'])

defineProps<{
  activator: Element | (string & {}) | 'parent' | ComponentPublicInstance
}>()

const input = ref('')

function handleUpload() {
  emit(
    'upload',
    `${input.value.startsWith('https://') ? '' : 'https://'}${input.value}`,
  )
  input.value = ''
}
</script>
