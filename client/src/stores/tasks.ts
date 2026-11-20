import type { InputTask, Task } from "@/schemas/task";
import { daysInterval } from "@/utils/formatDateTime";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";

export const useTasksStore = defineStore('tasks', () => {
    // States
    const tasks: Ref<Task[]> = ref([])

    // Getters
    const getTasks = computed(() => tasks.value)

    const incomingTasks = computed(() => tasks.value.filter(task => task.deadline && daysInterval(task.deadline)! <= 7 && (task.status === "in_progress" || task.status === "proposed")))

    const noDeadlineTasks = computed(() => tasks.value.filter(task => !task.deadline && (task.status === "in_progress" || task.status === "proposed")))
    
    // Actions
    function getTaskById(id:string): Task | undefined
        {return tasks.value.find(task => task.id === id)}

    function postTask(newTask: Task){
        tasks.value.push(newTask)
    }

    function editTask(id: string, editedTask: InputTask){
        const selectedTask = tasks.value.find(task => task.id === id);
        
        if (!selectedTask) return

        selectedTask.title = editedTask.title
        selectedTask.deadline = editedTask.deadline
        selectedTask.description = editedTask.description
    }

    return {
        getTasks, incomingTasks, noDeadlineTasks, getTaskById, postTask, editTask
    }
})