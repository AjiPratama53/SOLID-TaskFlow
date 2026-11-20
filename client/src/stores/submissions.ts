import type { Submission } from "@/schemas/submission";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";

export const useSubmissionsStore = defineStore('submissions', () => {
    // States
    const submissions: Ref<Submission[]> = ref([])

    // Getters
    const getSubmissions = computed(() => submissions.value)

    // const getActiveSubmission = computed(() => submissions.value)

    // Actions
    function postSubmission(newSubmission: Submission){
        submissions.value.push(newSubmission)
    }

    return {
        getSubmissions, postSubmission
    }
})