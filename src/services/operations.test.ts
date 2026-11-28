import { describe, expect, it } from 'vitest'
import type { Proposal } from '../domain/models'
import { enqueueOperation, markOperationFailed, markOperationSucceeded } from './operations'

const proposal: Proposal = {
  id: 'p1', taskListId: 't1', taskPartId: 'part1', fromWebId: 'https://alice.example/#me',
  toWebId: 'https://bob.example/#me', status: 'PROPOSED', createdAt: '2026-01-01T00:00:00Z',
  taskName: 'Work', taskDescription: '', deadline: '', upstreamWebIds: ['https://alice.example/#me'],
}

describe('durable outbox operations', () => {
  it('deduplicates replayed operations by stable id', () => {
    const first = enqueueOperation([], { id: 'proposal:p1', kind: 'proposal', recipientWebId: proposal.toWebId, payload: proposal })
    const replayed = enqueueOperation(first, { id: 'proposal:p1', kind: 'proposal', recipientWebId: proposal.toWebId, payload: proposal })
    expect(replayed).toHaveLength(1)
  })

  it('records failed attempts and supports a later success', () => {
    const [operation] = enqueueOperation([], { id: 'proposal:p1', kind: 'proposal', recipientWebId: proposal.toWebId, payload: proposal })
    const failed = markOperationFailed(operation, new Error('offline'))
    expect(failed).toMatchObject({ status: 'FAILED', attempts: 1, error: 'offline' })
    expect(markOperationSucceeded(failed)).toMatchObject({ status: 'SUCCEEDED', attempts: 2, error: undefined })
  })
})
