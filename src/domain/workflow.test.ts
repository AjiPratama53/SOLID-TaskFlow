import { describe, expect, it } from 'vitest'
import { acceptProposal, addChildTask, addTaskPart, approveProof, cancelProposal, completeLocalPart, confirmDelegation, createProposal, createTask, rejectProof, rejectProposal, submitProof, updateTask } from './workflow'

describe('task verification workflow', () => {
  it('keeps submitted delegated work pending until its upstream owner approves it', () => {
    const task = createTask({ name: 'Design UI', ownerWebId: 'https://bob.example/profile#me', upstreamOwnerWebId: 'https://alice.example/profile#me' })
    const submitted = submitProof(task, { address: 'https://bob.example/proof/wireframes.pdf', size: 2048 }, task.ownerWebId)
    expect(submitted.status).toBe('PENDING_VERIFICATION')
    expect(approveProof(submitted, submitted.proofs[0].id, task.upstreamOwnerWebId!).status).toBe('DONE')
  })

  it('requires a reason and returns rejected work to in progress', () => {
    const task = submitProof(createTask({ name: 'Components', ownerWebId: 'eve', upstreamOwnerWebId: 'bob' }), { address: 'https://proof.example', size: 10 }, 'eve')
    expect(() => rejectProof(task, task.proofs[0].id, 'bob', '')).toThrow('Rejection reason is required')
    expect(rejectProof(task, task.proofs[0].id, 'bob', 'Missing responsive states').status).toBe('IN_PROGRESS')
  })

  it('allows only the direct upstream owner to review proof', () => {
    const task = submitProof(createTask({ name: 'Components', ownerWebId: 'eve', upstreamOwnerWebId: 'bob' }), { address: 'https://proof.example', size: 10 }, 'eve')
    expect(() => approveProof(task, task.proofs[0].id, 'alice')).toThrow('Only the direct upstream owner may review proof')
  })

  it('blocks submission while child delegated work is unfinished', () => {
    const task = createTask({ name: 'Design UI', ownerWebId: 'bob', upstreamOwnerWebId: 'alice' })
    task.children.push(createTask({ name: 'Components', ownerWebId: 'eve', upstreamOwnerWebId: 'bob' }))
    expect(() => submitProof(task, { address: 'https://proof.example', size: 10 }, 'bob')).toThrow('All child task lists must be done before submission')
  })

  it('blocks submission while a local task part is unfinished', () => {
    const task = addTaskPart(createTask({ name: 'Design UI', ownerWebId: 'bob', upstreamOwnerWebId: 'alice' }), { name: 'Wireframes', description: '' }, 'bob')
    expect(() => submitProof(task, { address: 'https://proof.example', size: 10 }, 'bob')).toThrow('All local task parts must be done before submission')
  })

  it('allows only one pending proof and never reopens completed work', () => {
    const task = createTask({ name: 'Design UI', ownerWebId: 'bob', upstreamOwnerWebId: 'alice' })
    const submitted = submitProof(task, { address: 'https://proof.example/1', size: 10 }, 'bob')
    expect(() => submitProof(submitted, { address: 'https://proof.example/2', size: 20 }, 'bob')).toThrow('This task list is not ready for proof submission')
    const done = approveProof(submitted, submitted.proofs[0].id, 'alice')
    expect(() => submitProof(done, { address: 'https://proof.example/3', size: 30 }, 'bob')).toThrow('This task list is not ready for proof submission')
  })

  it('returns rejected work to in progress', () => {
    const task = submitProof(createTask({ name: 'Components', ownerWebId: 'eve', upstreamOwnerWebId: 'bob' }), { address: 'https://proof.example', size: 10 }, 'eve')
    expect(rejectProof(task, task.proofs[0].id, 'bob', 'Incomplete').status).toBe('IN_PROGRESS')
  })
})

describe('task hierarchy workflow', () => {
  it('lets an owner add local task parts and nested task lists', () => {
    const task = createTask({ name: 'Build a website', ownerWebId: 'alice' })
    const withPart = addTaskPart(task, { name: 'Documentation', description: 'Write the guide' }, 'alice')
    const withChild = addChildTask(withPart, { name: 'Launch', description: 'Publish it' }, 'alice')

    expect(withChild.parts[0]).toMatchObject({ name: 'Documentation', status: 'UNASSIGNED' })
    expect(withChild.children[0]).toMatchObject({ name: 'Launch', ownerWebId: 'alice' })
  })

  it('prevents anyone except the owner from changing a task list', () => {
    const task = createTask({ name: 'Build a website', ownerWebId: 'alice' })
    expect(() => updateTask(task, { description: 'Changed' }, 'bob')).toThrow('Only the owner may edit this task list')
    expect(() => addTaskPart(task, { name: 'Docs', description: '' }, 'bob')).toThrow('Only the owner may edit this task list')
  })

  it('allows an owner to complete their own local task part', () => {
    const task = addTaskPart(createTask({ name: 'Build a website', ownerWebId: 'alice' }), { name: 'Docs', description: '' }, 'alice')
    const completed = completeLocalPart(task, task.parts[0].id, 'alice')
    expect(completed.parts[0].status).toBe('DONE')
  })
})

describe('delegation workflow', () => {
  it('creates a proposal for an existing task part without transferring ownership', () => {
    const detailFile = { uri: 'https://alice.example/private/otaku/details/design.pdf', name: 'design.pdf', mediaType: 'application/pdf', size: 512 }
    const task = addTaskPart(createTask({ name: 'Website', ownerWebId: 'alice' }), { name: 'Design UI', description: 'Create screens', detailFile }, 'alice')
    const proposal = createProposal(task, task.parts[0].id, 'bob', 'alice')

    expect(proposal).toMatchObject({ fromWebId: 'alice', toWebId: 'bob', status: 'PROPOSED', taskName: 'Design UI' })
    expect(proposal.detailFile).toEqual(detailFile)
    expect(task.parts[0].status).toBe('UNASSIGNED')
  })

  it('requires identity-sharing consent before accepting and creates one owned task list', () => {
    const parent = addTaskPart(createTask({ name: 'Website', ownerWebId: 'alice' }), { name: 'Design UI', description: 'Create screens' }, 'alice')
    const proposal = createProposal(parent, parent.parts[0].id, 'bob', 'alice')

    expect(() => acceptProposal(proposal, 'bob', false)).toThrow('Identity-sharing consent is required')
    const accepted = acceptProposal(proposal, 'bob', true)
    expect(accepted.proposal.status).toBe('ACCEPTED')
    expect(accepted.task).toMatchObject({ name: 'Design UI', ownerWebId: 'bob', upstreamOwnerWebId: 'alice', status: 'ACCEPTED' })
    expect(accepted.task.detailFile).toEqual(proposal.detailFile)
    expect(accepted.proposal.identityConsent?.disclosedTo).toEqual(['alice'])
  })

  it('retains rejected proposals and lets only the sender cancel pending proposals', () => {
    const parent = addTaskPart(createTask({ name: 'Website', ownerWebId: 'alice' }), { name: 'Docs', description: '' }, 'alice')
    const proposal = createProposal(parent, parent.parts[0].id, 'bob', 'alice')
    expect(rejectProposal(proposal, 'bob').status).toBe('REJECTED')
    expect(() => cancelProposal(proposal, 'bob')).toThrow('Only the proposer may cancel this proposal')
    expect(cancelProposal(proposal, 'alice').status).toBe('CANCELLED')
  })

  it('links the original task part after the proposer receives acceptance', () => {
    const parent = addTaskPart(createTask({ name: 'Website', ownerWebId: 'alice' }), { name: 'Docs', description: '' }, 'alice')
    const proposal = createProposal(parent, parent.parts[0].id, 'bob', 'alice')
    const confirmed = confirmDelegation(parent, proposal, {
      id: 'acceptance-1', proposalId: proposal.id, fromWebId: 'bob', toWebId: 'alice',
      taskListUri: 'https://bob.example/private/otaku/workspace.json#task-1', acceptedAt: new Date().toISOString(),
    }, 'alice')
    expect(confirmed.task.parts[0]).toMatchObject({ delegatedTaskUri: 'https://bob.example/private/otaku/workspace.json#task-1', status: 'IN_PROGRESS' })
    expect(confirmed.proposal).toMatchObject({ status: 'ACCEPTED', acceptedTaskUri: 'https://bob.example/private/otaku/workspace.json#task-1' })
  })

  it('blocks self delegation and a second active proposal for the same part', () => {
    const parent = addTaskPart(createTask({ name: 'Website', ownerWebId: 'alice' }), { name: 'Docs', description: '' }, 'alice')
    expect(() => createProposal(parent, parent.parts[0].id, 'alice', 'alice')).toThrow('You cannot delegate work to yourself')
    const first = createProposal(parent, parent.parts[0].id, 'bob', 'alice')
    expect(() => createProposal(parent, parent.parts[0].id, 'bob', 'alice', [first])).toThrow('This task part already has an active proposal')
    expect(() => createProposal(parent, parent.parts[0].id, 'carol', 'alice', [{ ...first, status: 'ACCEPTED' }])).toThrow('This task part already has an active proposal')
  })

  it('does not complete or mutate work with active or terminal state', () => {
    const parent = addTaskPart(createTask({ name: 'Website', ownerWebId: 'alice' }), { name: 'Docs', description: '' }, 'alice')
    const proposal = createProposal(parent, parent.parts[0].id, 'bob', 'alice')
    expect(() => completeLocalPart(parent, parent.parts[0].id, 'alice', [proposal])).toThrow('This task part has an active proposal')
    const done = { ...parent, status: 'DONE' as const }
    expect(() => updateTask(done, { description: 'Changed' }, 'alice')).toThrow('Completed or pending work cannot be changed')
    expect(() => addTaskPart(done, { name: 'More', description: '' }, 'alice')).toThrow('Completed or pending work cannot be changed')
  })

  it('uses a stable task identity when an acceptance is replayed', () => {
    const parent = addTaskPart(createTask({ name: 'Website', ownerWebId: 'alice' }), { name: 'Docs', description: '' }, 'alice')
    const proposal = createProposal(parent, parent.parts[0].id, 'bob', 'alice')
    expect(acceptProposal(proposal, 'bob', true).task.id).toBe(acceptProposal(proposal, 'bob', true).task.id)
  })
})
