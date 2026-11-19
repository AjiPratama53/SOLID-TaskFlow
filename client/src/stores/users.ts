import type { User } from "@/schemas/user";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";

export const useUsersStore = defineStore('users', () => {
    // States
    const users: Ref<User[]> = ref([])

    // Getters
    const getUsers = computed(() => users.value)

    // Actions
    function inviteUser(newUser: User){
        users.value.push(newUser)
    }

    return {
        getUsers, inviteUser
    }
})