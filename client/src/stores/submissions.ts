import type { Submission } from '@/schemas/submission'
import { api } from '@/services/api'
import { defineStore } from 'pinia'
import { computed, ref, type Ref } from 'vue'

export const useSubmissionsStore = defineStore('submissions', () => {
  // States
  const submissions: Ref<Submission[]> = ref([])
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  // Getters
  const getSubmissions = computed(() => submissions.value)
  const isEmpty = computed(() => submissions.value.length === 0)

  // const getActiveSubmission = computed(() => submissions.value)

  // Actions
  async function fetchSubmissions() {
    isLoading.value = true
    error.value = null

    try {
      const data = await api.submission.get({})

      // throw new Error('Uji Error State')

      if (!data) return
      submissions.value = [...data]
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Gagal memuat data dari Solid Pod.'
    } finally {
      isLoading.value = false
    }
  }

  async function postSubmission(submission: Submission) {
    try {
      await api.submission.post(submission)
      if (!submissions.value) await fetchSubmissions()
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Gagal memuat data dari Solid Pod.'
    }
  }

  return {
    error,
    isLoading,
    isEmpty,
    getSubmissions,
    fetchSubmissions,
    postSubmission,
  }
})
