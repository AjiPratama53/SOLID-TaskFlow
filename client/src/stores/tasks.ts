import type { InputTask, Task, TaskQuery, TaskStatus } from '@/schemas/task'
import { api } from '@/services/api'
import { defineStore } from 'pinia'
import { computed, ref, type Ref } from 'vue'

export const useTasksStore = defineStore('tasks', () => {
  // States
  const tasks = ref<Task[]>([])
  const incomingTask = ref<Task[]>()
  const noDeadlineTask = ref<Task[]>()

  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const isAdding = ref(false)

  // Getters
  const getTasks = computed(() => tasks.value)
  const isEmpty = computed(() => tasks.value.length === 0)

  const getIncomingTasks = computed(() => incomingTask.value)
  const getNoDeadlineTasks = computed(() => noDeadlineTask.value)

  // Actions
  async function fetchTasks(query: TaskQuery) {
    isLoading.value = true
    error.value = null

    try {
      const data = await api.task.get(query)

      //   throw new Error('Uji error state')
      // if (!data) return

      tasks.value = data.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0
        if (!a.deadline) return 1
        if (!b.deadline) return -1

        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
      })
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Gagal memuat data dari Solid Pod.'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchIncomingTasks() {
    try {
      const now = new Date()

      return await api.task.get({
        status: 'in_progress',
        deadlineFrom: now,
        deadlineTo: new Date(now.setDate(now.getDate() + 7)),
        limit: 5,
      })
    } catch (error) {
      throw error
    }
  }
  async function fetchNoDeadlineTasks() {
    try {
      return await api.task.get({
        status: 'in_progress',
        deadlineFrom: null,
        deadlineTo: null,
        limit: 5,
      })
    } catch (error) {
      throw error
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

      if (!tasks.value) await fetchTasks({})
    } catch (error) {
      throw error
    }
  }

  async function editTask(id: string, editedTask: InputTask) {
    try {
      await api.task.patch(id, editedTask)

      if (!tasks.value) await fetchTasks({})
    } catch (error) {
      throw error
    }
  }

  return {
    getTasks,
    getIncomingTasks,
    getNoDeadlineTasks,
    error,
    isEmpty,
    isLoading,
    isAdding,
    fetchTasks,
    fetchIncomingTasks,
    fetchNoDeadlineTasks,
    postTask,
    editTask,
  }
})
