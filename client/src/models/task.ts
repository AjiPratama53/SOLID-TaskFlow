export type TaskStatus = 
| 'proposed'
| 'in_progress'
| 'pending_approval'
| 'completed'
| 'cancelled'

export interface Task {
    id: string
    userId?: string
    proposerId: string
    createdAt: Date
    editedAt?: Date
    status: TaskStatus
    title: string
    deadline?: Date
    description: string
}

export interface InputTask {
    title: string
    deadline?: Date
    description: string
}