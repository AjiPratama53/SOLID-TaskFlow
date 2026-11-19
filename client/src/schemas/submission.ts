export type SubmissionStatus = 
| 'created'
| 'pending_approval'
| 'accepted'
| 'rejected'

export interface Submission {
    id: string
    date: Date
    status: SubmissionStatus
    comment?: string
}