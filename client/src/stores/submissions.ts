import type { Submission } from "@/schemas/submission";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";

export const useSubmissionsStore = defineStore('users', () => {
    // States
    const submissions: Ref<Submission[]> = ref([])

    // Getters
    const getSubmissions = computed(() => submissions.value)

    // Actions
    function postSubmission(newUser: Submission){
        submissions.value.push(newUser)
    }

    return {
        getSubmissions, postSubmission
    }
})