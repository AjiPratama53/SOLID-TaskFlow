import type { InputTask, Task } from "@/schemas/task";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";

export const useTasksStore = defineStore('tasks', () => {
    // States
    const tasks: Ref<Task[]> = ref([])

    // Getters
    const getTasks = computed(() => tasks.value)

    
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
        getTasks, getTaskById, postTask, editTask
    }
})