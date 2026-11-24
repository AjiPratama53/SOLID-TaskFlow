import type { User } from "@/schemas/user";
import { api } from "@/services/api";
import { useSessionStore } from "@/stores/session";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";

export const useUsersStore = defineStore('users', () => {
    // States
    const users: Ref<User[]> = ref([])
    const localInvites: Ref<User[]> = ref([])
    const error = ref<string | null>(null)
    const isLoading = ref(false)

    // Getters
    const getUsers = computed(() => [...users.value, ...localInvites.value])

    // Actions
    async function fetchUsers() {
        const session = useSessionStore()
        if (!session.isAuthenticated || !session.webId) {
            error.value = 'Sesi Solid belum tersedia untuk memuat teman.'
            return
        }

        isLoading.value = true
        error.value = null

        try {
            const result = await api.user.getFriends(session.webId)
            users.value = result.users

            if (result.failedCount > 0) {
                error.value = `${result.failedCount} profil teman tidak dapat dimuat.`
            }
        } catch (err) {
            error.value = err instanceof Error
                ? err.message
                : 'Gagal memuat teman dari Solid Pod.'
        } finally {
            isLoading.value = false
        }
    }

    async function postUser(user: User) {
        try {
            await api.user.post(user)
            localInvites.value.push(user)
        } catch (err) {
            error.value = err instanceof Error
                ? err.message
                : 'Gagal menambahkan undangan lokal.'
        }
    }

    return {
        getUsers,
        error,
        isLoading,
        fetchUsers,
        postUser,
    }
})