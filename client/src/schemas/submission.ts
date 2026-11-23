import type { StatusColor } from '@/utils/statusColorClasses'

export type SubmissionStatus =
  // | 'created'
  'pending_approval' | 'accepted' | 'rejected'

export interface Submission {
  id: string
  date: Date
  status: SubmissionStatus
  comment?: string
}

export const submissionStatusMessage: Record<SubmissionStatus, string> = {
  pending_approval: 'Menunggu persetujuan',
  accepted: 'Diterima',
  rejected: 'Ditolak',
}

export const submissionStatusColor: Record<SubmissionStatus, StatusColor> = {
  pending_approval: 'yellow',
  accepted: 'green',
  rejected: 'red',
}

export const submissionStatusIcon: Record<SubmissionStatus, string> = {
  pending_approval: 'tray-arrow-up',
  accepted: 'check',
  rejected: 'close',
}
