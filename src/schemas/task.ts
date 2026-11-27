import type { StatusColor } from '@/utils/statusColorClasses'

export type TaskStatus =
  'proposed' | 'in_progress' | 'pending_approval' | 'completed' | 'cancelled'

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
  submissionId?: string
}

export interface InputTask {
  title: string
  deadline?: Date
  description: string
}

export interface TaskQuery {
  id?: string
  status?: TaskStatus
  deadlineFrom?: Date | null
  deadlineTo?: Date | null
  query?: string
  limit?: number
}

export const taskPriority: Record<TaskStatus, number> = {
  proposed: 1,
  in_progress: 2,
  pending_approval: 3,
  completed: 4,
  cancelled: 5,
}

export const taskStatusColor: Record<TaskStatus, StatusColor> = {
  proposed: 'gray',
  in_progress: 'indigo',
  pending_approval: 'yellow',
  completed: 'green',
  cancelled: 'red',
}

export const taskStatusMessage: Record<TaskStatus, string> = {
  proposed: 'Ditugaskan',
  in_progress: 'Sedang dikerjakan',
  pending_approval: 'Menunggu persetujuan',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}
