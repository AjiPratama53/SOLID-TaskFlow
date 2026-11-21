import type { Submission } from "@/schemas/submission";
import { api } from "@/services/api";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";

export const useSubmissionsStore = defineStore('submissions', () => {
    // States
    const submissions: Ref<Submission[]> = ref([])

    // Getters
    const getSubmissions = computed(() => submissions.value)

    // const getActiveSubmission = computed(() => submissions.value)

    // Actions
    async function fetchSubmissions() {
        try {
            const data = await api.submission.get()

            if (!data) return
            submissions.value = data
        } catch (error) {
            throw error
        }
    }

    async function postSubmission(submission: Submission){
        try {
            await api.submission.post(submission)
            await fetchSubmissions()
        } catch (error) {
            throw error
        }
    }

    return {
        getSubmissions, fetchSubmissions, postSubmission
    }
})