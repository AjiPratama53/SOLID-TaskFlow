import type { User } from "@/schemas/user";
import { api } from "@/services/api";
import { sessionInfo } from "@/services/auth";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";

export const useUsersStore = defineStore("users", () => {
  // States
  const users: Ref<User[]> = ref([]);
  const error = ref<string | null>(null);
  const isLoading = ref(false);
  const isAdding = ref(false);

  // Getters
  const getUsers = computed(() => users.value);
  const isEmpty = computed(() => users.value.length === 0);

  // Actions
  function getUser(id: string) {
    return users.value.find((u) => u.id === id);
  }

  async function fetchUsers() {
    const session = sessionInfo();
    if (!session.isLoggedIn || !session.webId) {
      error.value = "Sesi Solid belum tersedia untuk memuat teman.";
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const result = await api.user.get(session.webId);
      // throw new Error('Uji error state')
      users.value = result.users;

      if (result.failedCount > 0) {
        error.value = `${result.failedCount} profil teman tidak dapat dimuat.`;
      }
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Gagal memuat teman dari Solid Pod.";
    } finally {
      isLoading.value = false;
    }
  }

  async function post(friendWebId: string): Promise<boolean> {
    if (isAdding.value) return false;

    const session = sessionInfo();
    if (!session.isLoggedIn || !session.webId) {
      error.value = "Sesi Solid belum tersedia untuk menambahkan teman.";
      return false;
    }

    isAdding.value = true;
    error.value = null;

    try {
      await api.user.post(session.webId, friendWebId);
      await fetchUsers();
      return true;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Gagal menyimpan teman ke Solid Pod.";
      return false;
    } finally {
      isAdding.value = false;
    }
  }

  return {
    getUsers,
    error,
    isEmpty,
    isLoading,
    isAdding,
    getUser,
    fetchUsers,
    post,
  };
});
