// @ts-ignore -- this local data module is intentionally outside the app project's file list.
import { users } from "@/.local/users";

// @ts-ignore -- this local data module is intentionally outside the app project's file list.
import { tasks } from "@/.local/tasks";

// @ts-ignore -- this local data module is intentionally outside the app project's file list.
import { submissions } from "@/.local/submissions";

import type { User } from "@/schemas/user";
import type { Task } from "@/schemas/task";
import type { Submission } from "@/schemas/submission";

export const api = {
    user: {
        get: async () => {
            // GET users
            await setTimeout(() => {
                return tasks
            }, 3000);
        },
        post: async (user: User) => {
            // POST user
            await setTimeout(() => {
                users.push(user)
            }, 3000);
        },
        patch: async (id: string, user: User) => {
            // PATCH user
            await setTimeout(() => {
                const selectedUser = users.find(u => u.id === id)
                
                if (!selectedUser) return
                selectedUser.name = user.name
                selectedUser.avatar = user.avatar
            }, 3000);
        },
    },

    task: {
        get: async () => {
            // GET tasks
            await setTimeout(() => {
                return tasks
            }, 3000);
        },
        post: async (task: Task) => {
            // POST task
            await setTimeout(() => {
                tasks.push(task)
            }, 3000);
        },
        patch: async (id: string, task: Task) => {
            // PATCH task
            await setTimeout(() => {
                const selectedTask = tasks.find(t => t.id === id)
    
                if (!selectedTask) return
                selectedTask.title = task.title
                selectedTask.description = task.description
                selectedTask.deadline = task.deadline
                selectedTask.editedAt = new Date()
            }, 3000);
        },
    },

    submission: {
        get: async () => {
            // GET submissions
            await setTimeout(() => {
                return submissions
            }, 3000);
        },
        post: async (submission: Submission) => {
            // POST submission
            await setTimeout(() => {
                submissions.push(submission)
            }, 3000);
        },
    },
}