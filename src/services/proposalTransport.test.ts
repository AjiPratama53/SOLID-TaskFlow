import { describe, expect, it, vi } from 'vitest'
import { ProposalTransport, parseOtakuNotification } from './proposalTransport'
import type { OutboxOperation, Proposal } from '../domain/models'

const proposal: Proposal = {
  id: 'proposal-1', taskListId: 'task-1', taskPartId: 'part-1', fromWebId: 'https://alice.example/profile#me',
  toWebId: 'https://bob.example/profile#me', status: 'PROPOSED', createdAt: '2026-11-05T00:00:00Z',
  taskName: 'Design UI', taskDescription: 'Create screens', deadline: '', upstreamWebIds: ['https://alice.example/profile#me'],
}

describe('ProposalTransport', () => {
  it('discovers an inbox from the WebID Link header and posts JSON-LD', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(null, { headers: { Link: '<https://bob.example/inbox/>; rel="http://www.w3.org/ns/ldp#inbox"' } }))
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
    const transport = new ProposalTransport(fetcher)

    await transport.sendProposal(proposal)

    expect(fetcher).toHaveBeenNthCalledWith(1, 'https://bob.example/profile', { method: 'HEAD' })
    expect(fetcher.mock.calls[1][0]).toBe('https://bob.example/inbox/')
    expect(fetcher.mock.calls[1][1]).toMatchObject({ method: 'POST', headers: { 'Content-Type': 'application/ld+json' } })
  })

  it('rejects malformed inbox payloads', () => {
    expect(parseOtakuNotification({ 'otaku:messageType': 'proposal', 'otaku:proposal': { id: 'missing-fields' } })).toBeUndefined()
  })

  it('parses valid acceptance records', () => {
    const parsed = parseOtakuNotification({
      'otaku:messageType': 'acceptance',
      'otaku:acceptance': { id: 'a1', proposalId: 'proposal-1', fromWebId: proposal.toWebId, toWebId: proposal.fromWebId, taskListUri: 'https://bob.example/tasks/1', acceptedAt: '2026-11-05T00:00:00Z' },
    })
    expect(parsed?.kind).toBe('acceptance')
  })

  it('rejects incomplete proposals instead of trusting asserted types', () => {
    expect(parseOtakuNotification({
      messageType: 'proposal',
      proposal: { id: 'p1', fromWebId: proposal.fromWebId, toWebId: proposal.toWebId, taskPartId: 'part-1', status: 'PROPOSED' },
    })).toBeUndefined()
  })

  it('sends a stable outbox operation envelope', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 202 }))
    const transport = new ProposalTransport(fetcher)
    const operation: OutboxOperation = {
      id: 'proposal:proposal-1', kind: 'proposal', inbox: 'https://bob.example/inbox/', payload: proposal,
      status: 'PENDING', attempts: 0, createdAt: '2026-11-05T00:00:00Z',
    }
    await transport.sendOperation(operation)
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toMatchObject({ operationId: operation.id, messageType: 'proposal' })
  })
})
