import type { InputTask, Task } from '@/schemas/task'
import { api } from '@/services/api'
import { defineStore } from 'pinia'
import { computed, ref, type Ref } from 'vue'

export const useTasksStore = defineStore('tasks', () => {
  // States
  const tasks: Ref<Task[]> = ref([])
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const isAdding = ref(false)

  // Getters
  const getTasks = computed(() => tasks.value)
  const isEmpty = computed(() => tasks.value.length === 0)

  const incomingTasks = computed(() =>
    tasks.value.filter(
      (task) =>
        task.deadline &&
        (task.status === 'in_progress' || task.status === 'proposed') &&
        new Date(task.deadline) >= new Date() &&
        new Date(task.deadline) <=
          new Date(new Date().setDate(new Date().getDate() + 7)),
    ),
  )

  const noDeadlineTasks = computed(() =>
    tasks.value.filter(
      (task) =>
        !task.deadline &&
        (task.status === 'in_progress' || task.status === 'proposed'),
    ),
  )

  // Actions
  async function fetchTasks() {
    isLoading.value = true
    error.value = null

    try {
      const data = await api.task.get()

      //   throw new Error('Uji error state')
      if (!data) return
      tasks.value = [...data]
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Gagal memuat data dari Solid Pod.'
    } finally {
      isLoading.value = false
    }
  }

  async function postTask(newTask: InputTask) {
    try {
      await api.task.post({
        id: `tsk_${Math.round(Math.random() * 1000)}`,
        proposerId: 'usr_001',
        createdAt: new Date(),
        status: 'proposed',
        ...newTask,
      })

      if (!tasks.value) await fetchTasks()
    } catch (error) {
      throw error
    }
  }

  async function editTask(id: string, editedTask: InputTask) {
    try {
      await api.task.patch(id, editedTask)

      if (!tasks.value) await fetchTasks()
    } catch (error) {
      throw error
    }
  }

  return {
    getTasks,
    incomingTasks,
    noDeadlineTasks,
    error,
    isEmpty,
    isLoading,
    isAdding,
    fetchTasks,
    postTask,
    editTask,
  }
})
