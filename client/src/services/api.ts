// @ts-ignore -- this local data module is intentionally outside the app project's file list.
import { users } from "@/.local/users";

// @ts-ignore -- this local data module is intentionally outside the app project's file list.
import { tasks } from "@/.local/tasks";

// @ts-ignore -- this local data module is intentionally outside the app project's file list.
import { submissions } from "@/.local/submissions";

import type { User } from "@/schemas/user";
import type { InputTask, Task } from "@/schemas/task";
import type { Submission } from "@/schemas/submission";

export const api = {
    user: {
        get: async (): Promise<User[]> => {
            // GET users
            try {
                await new Promise(resolve => setTimeout(resolve, 3000));
                return users
            } catch (error) {
                throw error
            }
        },
        post: async (user: User) => {
            // POST user
            try {
                await new Promise(resolve => setTimeout(resolve, 3000));
                users.push(user)
            } catch (error) {
                throw error
            }
        },
    },

    task: {
        get: async () => {
            // GET tasks
            try {
                await new Promise(resolve => setTimeout(resolve, 3000));
                return tasks
            } catch (error) {
                throw error
            }
        },
        post: async (task: Task) => {
            // POST task
            try {
                await new Promise(resolve => setTimeout(resolve, 3000));
                tasks.push(task)
            } catch (error) {
                throw error
            }
        },
        patch: async (id: string, task: InputTask) => {
            // PATCH task
            try {
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                const selectedTask = tasks.find(t => t.id === id)
    
                if (!selectedTask) return
                selectedTask.title = task.title
                selectedTask.description = task.description
                selectedTask.deadline = task.deadline
                selectedTask.editedAt = new Date()
            } catch (error) {
                throw error
            }
        },
    },

    submission: {
        get: async () => {
            // GET submissions
            try {
                await new Promise(resolve => setTimeout(resolve, 3000));
                return submissions
            } catch (error) {
                throw error
            }
        },
        post: async (submission: Submission) => {
            // POST submission
            try {
                await new Promise(resolve => setTimeout(resolve, 3000));
                submissions.push(submission)
            } catch (error) {
                throw error
            }
        },
    },
}