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

export const taskStatusColor: Record<TaskStatus, string> = {
    proposed: 'gray',
    in_progress: 'indigo',
    pending_approval: 'yellow',
    completed: 'green',
    cancelled: 'red'
}

export const taskStatusMessage: Record<TaskStatus, string> = {
    proposed: 'Ditugaskan',
    in_progress: 'Sedang Dikerjakan',
    pending_approval: 'Menunggu Persetujuan',
    completed: 'Selesai',
    cancelled: 'Dibatalkan'
}