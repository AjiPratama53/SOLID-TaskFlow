import type { User } from "@/schemas/user";
import { api } from "@/services/api";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";

export const useUsersStore = defineStore('users', () => {
    // States
    const users: Ref<User[]> = ref([])

    // Getters
    const getUsers = computed(() => users.value)

    // Actions
    async function fetchUsers() {
        try {
            const data = await api.user.get()

            if (!data) return
            users.value = data
        } catch (error) {
            throw error
        }
    }

    async function postUser(user: User) {
        try {
            await api.user.post(user)
        } catch (error) {
            
        }
    }

    return {
        getUsers, fetchUsers, postUser
    }
})