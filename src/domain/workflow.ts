import type { AcceptanceRecord, Proof, Proposal, TaskDetailFile, TaskList, TaskPart } from './models'

const id = () => crypto.randomUUID()
const isActiveProposal = (proposal: Proposal) => proposal.status === 'PROPOSED' || proposal.status === 'ACCEPTED'

export function createTask(input: Pick<TaskList, 'name' | 'ownerWebId'> & Partial<Pick<TaskList, 'id' | 'description' | 'deadline' | 'upstreamOwnerWebId' | 'upstreamWebIds' | 'detailFile'>>): TaskList {
  if (!input.name.trim()) throw new Error('Task name is required')
  if (!input.ownerWebId.trim()) throw new Error('Owner WebID is required')
  return {
    id: input.id ?? id(), name: input.name.trim(), description: input.description?.trim() ?? '', ownerWebId: input.ownerWebId,
    upstreamOwnerWebId: input.upstreamOwnerWebId, upstreamWebIds: input.upstreamWebIds ?? (input.upstreamOwnerWebId ? [input.upstreamOwnerWebId] : []),
    originDate: new Date().toISOString(), deadline: input.deadline ?? '',
    status: input.upstreamOwnerWebId ? 'ACCEPTED' : 'CREATED', parts: [], children: [], proofs: [], detailFile: input.detailFile,
  }
}

function requireOwner(task: TaskList, actorWebId: string) {
  if (task.ownerWebId !== actorWebId) throw new Error('Only the owner may edit this task list')
}

function requireMutable(task: TaskList) {
  if (['PENDING_VERIFICATION', 'DONE', 'CANCELLED', 'EXPIRED'].includes(task.status)) {
    throw new Error('Completed or pending work cannot be changed')
  }
}

export function updateTask(task: TaskList, input: Partial<Pick<TaskList, 'name' | 'description' | 'deadline'>>, actorWebId: string): TaskList {
  requireOwner(task, actorWebId)
  requireMutable(task)
  if (input.name !== undefined && !input.name.trim()) throw new Error('Task name is required')
  return {
    ...task,
    ...(input.name !== undefined && { name: input.name.trim() }),
    ...(input.description !== undefined && { description: input.description.trim() }),
    ...(input.deadline !== undefined && { deadline: input.deadline }),
  }
}

export function addTaskPart(task: TaskList, input: Pick<TaskPart, 'name' | 'description'> & { id?: string; detailFile?: TaskDetailFile }, actorWebId: string): TaskList {
  requireOwner(task, actorWebId)
  requireMutable(task)
  if (!input.name.trim()) throw new Error('Task-part name is required')
  const part: TaskPart = { id: input.id ?? id(), name: input.name.trim(), description: input.description.trim(), status: 'UNASSIGNED', detailFile: input.detailFile }
  return { ...task, parts: [...task.parts, part] }
}

export function addChildTask(task: TaskList, input: Pick<TaskList, 'name' | 'description'> & Partial<Pick<TaskList, 'deadline'>>, actorWebId: string): TaskList {
  requireOwner(task, actorWebId)
  requireMutable(task)
  const child = createTask({ ...input, deadline: input.deadline ?? task.deadline, ownerWebId: actorWebId })
  return { ...task, children: [...task.children, child] }
}

export function completeLocalPart(task: TaskList, partId: string, actorWebId: string, proposals: Proposal[] = []): TaskList {
  requireOwner(task, actorWebId)
  requireMutable(task)
  const part = task.parts.find((candidate) => candidate.id === partId)
  if (!part) throw new Error('Task part not found')
  if (part.delegatedTaskUri) throw new Error('Delegated work requires upstream verification')
  if (proposals.some((proposal) => proposal.taskPartId === partId && isActiveProposal(proposal))) throw new Error('This task part has an active proposal')
  return { ...task, parts: task.parts.map((candidate) => candidate.id === partId ? { ...candidate, status: 'DONE' } : candidate) }
}

export function createProposal(task: TaskList, partId: string, toWebId: string, actorWebId: string, proposals: Proposal[] = []): Proposal {
  requireOwner(task, actorWebId)
  requireMutable(task)
  const part = task.parts.find((candidate) => candidate.id === partId)
  if (!part) throw new Error('Task part not found')
  if (!toWebId.trim()) throw new Error('Recipient WebID is required')
  if (toWebId.trim() === actorWebId) throw new Error('You cannot delegate work to yourself')
  if (part.delegatedTaskUri) throw new Error('This task part is already delegated')
  if (part.status === 'DONE' || part.status === 'CANCELLED') throw new Error('Completed work cannot be delegated')
  if (proposals.some((proposal) => proposal.taskPartId === partId && isActiveProposal(proposal))) throw new Error('This task part already has an active proposal')
  return {
    id: id(), taskListId: task.id, taskPartId: part.id, fromWebId: actorWebId, toWebId: toWebId.trim(),
    status: 'PROPOSED', createdAt: new Date().toISOString(), taskName: part.name, taskDescription: part.description,
    deadline: task.deadline, upstreamWebIds: [...new Set([actorWebId, ...(task.upstreamWebIds ?? [])])], detailFile: part.detailFile,
  }
}

export function acceptProposal(proposal: Proposal, actorWebId: string, hasIdentityConsent: boolean): { proposal: Proposal; task: TaskList } {
  if (proposal.toWebId !== actorWebId) throw new Error('Only the intended recipient may accept this proposal')
  if (proposal.status !== 'PROPOSED') throw new Error('Only a pending proposal may be accepted')
  if (!hasIdentityConsent) throw new Error('Identity-sharing consent is required')
  const respondedAt = new Date().toISOString()
  const acceptedProposal: Proposal = {
    ...proposal, status: 'ACCEPTED', respondedAt,
    identityConsent: { grantedAt: respondedAt, disclosedTo: proposal.upstreamWebIds },
  }
  const task = createTask({
    id: `delegated-${proposal.id}`,
    name: proposal.taskName, description: proposal.taskDescription, deadline: proposal.deadline,
    ownerWebId: actorWebId, upstreamOwnerWebId: proposal.fromWebId, upstreamWebIds: proposal.upstreamWebIds, detailFile: proposal.detailFile,
  })
  task.sourceProposalId = proposal.id
  return { proposal: acceptedProposal, task }
}

export function rejectProposal(proposal: Proposal, actorWebId: string): Proposal {
  if (proposal.toWebId !== actorWebId) throw new Error('Only the intended recipient may reject this proposal')
  if (proposal.status !== 'PROPOSED') throw new Error('Only a pending proposal may be rejected')
  return { ...proposal, status: 'REJECTED', respondedAt: new Date().toISOString() }
}

export function cancelProposal(proposal: Proposal, actorWebId: string): Proposal {
  if (proposal.fromWebId !== actorWebId) throw new Error('Only the proposer may cancel this proposal')
  if (proposal.status !== 'PROPOSED') throw new Error('Only a pending proposal may be cancelled')
  return { ...proposal, status: 'CANCELLED', respondedAt: new Date().toISOString() }
}

export function confirmDelegation(task: TaskList, proposal: Proposal, acceptance: AcceptanceRecord, actorWebId: string): { task: TaskList; proposal: Proposal } {
  requireOwner(task, actorWebId)
  if (proposal.status !== 'PROPOSED') throw new Error('Only a pending proposal may be confirmed')
  if (proposal.fromWebId !== actorWebId || acceptance.toWebId !== actorWebId) throw new Error('Only the proposer may confirm this delegation')
  if (acceptance.proposalId !== proposal.id || acceptance.fromWebId !== proposal.toWebId) throw new Error('Acceptance does not match this proposal')
  const originalPart = task.parts.find((part) => part.id === proposal.taskPartId)
  if (!originalPart) throw new Error('Original task part not found')
  if (originalPart.delegatedTaskUri) throw new Error('This task part is already delegated')
  return {
    task: {
      ...task,
      parts: task.parts.map((part) => part.id === proposal.taskPartId
        ? { ...part, delegatedTaskUri: acceptance.taskListUri, status: 'IN_PROGRESS' }
        : part),
    },
    proposal: { ...proposal, status: 'ACCEPTED', respondedAt: acceptance.acceptedAt, acceptedTaskUri: acceptance.taskListUri },
  }
}

export function submitProof(task: TaskList, input: Pick<Proof, 'address' | 'size'>, actorWebId: string): TaskList {
  if (actorWebId !== task.ownerWebId) throw new Error('Only the owner may submit proof')
  if (!task.upstreamOwnerWebId) throw new Error('A root task has no upstream reviewer')
  if (!['ACCEPTED', 'IN_PROGRESS'].includes(task.status)) throw new Error('This task list is not ready for proof submission')
  if (task.children.some((child) => child.status !== 'DONE')) throw new Error('All child task lists must be done before submission')
  if (task.parts.some((part) => part.status !== 'DONE')) throw new Error('All local task parts must be done before submission')
  if (task.proofs.some((proof) => proof.status === 'PENDING')) throw new Error('A proof submission is already pending')
  if (!input.address.trim()) throw new Error('Proof address is required')
  if (!Number.isSafeInteger(input.size) || input.size < 0) throw new Error('Proof size must be a non-negative integer')
  const proof: Proof = { id: id(), address: input.address, size: input.size, submittedAt: new Date().toISOString(), status: 'PENDING' }
  return { ...task, status: 'PENDING_VERIFICATION', proofs: [...task.proofs, proof] }
}

function review(task: TaskList, proofId: string, reviewerWebId: string, decision: 'APPROVED' | 'REJECTED', reason?: string): TaskList {
  if (reviewerWebId !== task.upstreamOwnerWebId) throw new Error('Only the direct upstream owner may review proof')
  if (decision === 'REJECTED' && !reason?.trim()) throw new Error('Rejection reason is required')
  if (!task.proofs.some((proof) => proof.id === proofId && proof.status === 'PENDING')) throw new Error('Pending proof not found')
  return {
    ...task,
    status: decision === 'APPROVED' ? 'DONE' : 'IN_PROGRESS',
    proofs: task.proofs.map((proof) => proof.id === proofId ? { ...proof, status: decision, rejectionReason: reason?.trim() } : proof),
  }
}

export const approveProof = (task: TaskList, proofId: string, reviewerWebId: string) => review(task, proofId, reviewerWebId, 'APPROVED')
export const rejectProof = (task: TaskList, proofId: string, reviewerWebId: string, reason: string) => review(task, proofId, reviewerWebId, 'REJECTED', reason)
