export type PartStatus = 'UNASSIGNED' | 'IN_PROGRESS' | 'PENDING_VERIFICATION' | 'DONE' | 'CANCELLED'
export type ListStatus = 'CREATED' | 'PROPOSED' | 'SEEN' | 'RESPONDED' | 'ACCEPTED' | 'IN_PROGRESS' | 'PENDING_VERIFICATION' | 'DONE' | 'EXPIRED' | 'CANCELLED'

export interface Proof {
  id: string
  address: string
  size: number
  submittedAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
}

export interface TaskDetailFile {
  uri: string
  name: string
  mediaType: string
  size: number
}

export interface TaskPart {
  id: string
  name: string
  description: string
  status: PartStatus
  detailFile?: TaskDetailFile
  delegatedTaskUri?: string
}

export interface TaskList {
  id: string
  uri?: string
  name: string
  description: string
  ownerWebId: string
  upstreamOwnerWebId?: string
  upstreamWebIds: string[]
  originDate: string
  deadline: string
  status: ListStatus
  parts: TaskPart[]
  children: TaskList[]
  proofs: Proof[]
  detailFile?: TaskDetailFile
  sourceProposalId?: string
}

export interface Proposal {
  id: string
  taskListId: string
  taskPartId: string
  fromWebId: string
  toWebId: string
  status: 'PROPOSED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED'
  createdAt: string
  taskName: string
  taskDescription: string
  deadline: string
  upstreamWebIds: string[]
  detailFile?: TaskDetailFile
  respondedAt?: string
  replyInbox?: string
  notificationUri?: string
  acceptedTaskUri?: string
  identityConsent?: { grantedAt: string; disclosedTo: string[] }
}

export interface AcceptanceRecord {
  id: string
  proposalId: string
  fromWebId: string
  toWebId: string
  taskListUri: string
  acceptedAt: string
}

export interface ProposalResponseRecord {
  id: string
  proposalId: string
  fromWebId: string
  toWebId: string
  decision: 'REJECTED' | 'CANCELLED'
  respondedAt: string
}

export interface ProofSubmissionRecord {
  id: string
  proposalId: string
  fromWebId: string
  toWebId: string
  taskListUri: string
  taskName: string
  proof: Proof
}

export interface ProofReviewRecord {
  id: string
  proposalId: string
  fromWebId: string
  toWebId: string
  proofId: string
  decision: 'APPROVED' | 'REJECTED'
  reason?: string
  reviewedAt: string
}

export type OperationPayload = Proposal | AcceptanceRecord | ProposalResponseRecord | ProofSubmissionRecord | ProofReviewRecord
export type OperationKind = 'proposal' | 'acceptance' | 'response' | 'proof' | 'review'

export interface OutboxOperation {
  id: string
  kind: OperationKind
  recipientWebId?: string
  inbox?: string
  payload: OperationPayload
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED'
  attempts: number
  createdAt: string
  error?: string
}
