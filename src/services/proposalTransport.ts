import { getContainedResourceUrlAll, getSolidDataset, getThing, getUrl } from '@inrupt/solid-client'
import type { AcceptanceRecord, OutboxOperation, ProofReviewRecord, ProofSubmissionRecord, Proposal, ProposalResponseRecord } from '../domain/models'
import { authFetch } from './auth'

const LDP_INBOX = 'http://www.w3.org/ns/ldp#inbox'
const CONTEXT = [
  'https://www.w3.org/ns/activitystreams',
  {
    otaku: 'urn:otaku:vocab:',
    messageType: 'otaku:messageType',
    proposal: { '@id': 'otaku:proposal', '@type': '@json' },
    acceptance: { '@id': 'otaku:acceptance', '@type': '@json' },
  },
]

type Fetch = typeof fetch
type ProposalNotification = { kind: 'proposal'; proposal: Proposal }
type AcceptanceNotification = { kind: 'acceptance'; acceptance: AcceptanceRecord }
type ResponseNotification = { kind: 'response'; response: ProposalResponseRecord }
type ProofNotification = { kind: 'proof'; proof: ProofSubmissionRecord }
type ReviewNotification = { kind: 'review'; review: ProofReviewRecord }
export type OtakuNotification = ProposalNotification | AcceptanceNotification | ResponseNotification | ProofNotification | ReviewNotification

const string = (value: unknown): value is string => typeof value === 'string' && value.length > 0
const stringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(string)
const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object'

function validProposal(value: unknown): value is Proposal {
  if (!object(value)) return false
  return string(value.id) && string(value.taskListId) && string(value.taskPartId) && string(value.fromWebId)
    && string(value.toWebId) && value.status === 'PROPOSED' && string(value.createdAt) && string(value.taskName)
    && typeof value.taskDescription === 'string' && typeof value.deadline === 'string' && stringArray(value.upstreamWebIds)
}

function inboxFromLinkHeader(value: string | null): string | undefined {
  const match = value?.match(/<([^>]+)>\s*;\s*rel=(?:"http:\/\/www\.w3\.org\/ns\/ldp#inbox"|http:\/\/www\.w3\.org\/ns\/ldp#inbox)/i)
  return match?.[1]
}

export function parseOtakuNotification(value: unknown, notificationUri?: string): OtakuNotification | undefined {
  if (!value || typeof value !== 'object') return
  const data = value as Record<string, unknown>
  const messageType = data.messageType ?? data['otaku:messageType']
  const proposalValue = data.proposal ?? data['otaku:proposal'] ?? data.payload
  const acceptanceValue = data.acceptance ?? data['otaku:acceptance'] ?? data.payload
  if (messageType === 'proposal' && validProposal(proposalValue)) {
    const proposal = proposalValue
    return { kind: 'proposal', proposal: { ...proposal, notificationUri } }
  }
  if (messageType === 'acceptance' && object(acceptanceValue)) {
    const acceptance = acceptanceValue as unknown as AcceptanceRecord
    if (![acceptance.id, acceptance.proposalId, acceptance.fromWebId, acceptance.toWebId, acceptance.taskListUri, acceptance.acceptedAt].every(string)) return
    return { kind: 'acceptance', acceptance }
  }
  const payload = data.payload
  if (messageType === 'response' && object(payload)) {
    const response = payload as unknown as ProposalResponseRecord
    if (![response.id, response.proposalId, response.fromWebId, response.toWebId, response.respondedAt].every(string) || !['REJECTED', 'CANCELLED'].includes(response.decision)) return
    return { kind: 'response', response }
  }
  if (messageType === 'proof' && object(payload)) {
    const proof = payload as unknown as ProofSubmissionRecord
    if (![proof.id, proof.proposalId, proof.fromWebId, proof.toWebId, proof.taskListUri, proof.taskName].every(string) || !object(proof.proof)) return
    return { kind: 'proof', proof }
  }
  if (messageType === 'review' && object(payload)) {
    const review = payload as unknown as ProofReviewRecord
    if (![review.id, review.proposalId, review.fromWebId, review.toWebId, review.proofId, review.reviewedAt].every(string) || !['APPROVED', 'REJECTED'].includes(review.decision)) return
    return { kind: 'review', review }
  }
}

export class ProposalTransport {
  constructor(private readonly fetcher: Fetch = authFetch) {}

  async discoverInbox(webId: string): Promise<string> {
    const target = webId.split('#')[0]
    const head = await this.fetcher(target, { method: 'HEAD' })
    const linkedInbox = inboxFromLinkHeader(head.headers.get('Link'))
    if (linkedInbox) return new URL(linkedInbox, target).href

    const profile = await getSolidDataset(webId, { fetch: this.fetcher })
    const profileThing = getThing(profile, webId)
    const inbox = profileThing && getUrl(profileThing, LDP_INBOX)
    if (!inbox) throw new Error('The WebID does not advertise a Solid inbox.')
    return inbox
  }

  async sendProposal(proposal: Proposal): Promise<void> {
    const inbox = await this.discoverInbox(proposal.toWebId)
    await this.post(inbox, {
      '@context': CONTEXT, type: 'Offer', messageType: 'proposal', proposal,
    })
  }

  async sendAcceptance(inbox: string, acceptance: AcceptanceRecord): Promise<void> {
    await this.post(inbox, {
      '@context': CONTEXT, type: 'Accept', messageType: 'acceptance', acceptance,
    })
  }

  async sendOperation(operation: OutboxOperation): Promise<void> {
    const inbox = operation.inbox ?? await this.discoverInbox(operation.recipientWebId!)
    await this.post(inbox, {
      '@context': CONTEXT,
      type: operation.kind === 'proposal' ? 'Offer' : 'Update',
      operationId: operation.id,
      messageType: operation.kind,
      payload: operation.payload,
    })
  }

  async received(webId: string): Promise<OtakuNotification[]> {
    const inbox = await this.discoverInbox(webId)
    const container = await getSolidDataset(inbox, { fetch: this.fetcher })
    const resources = getContainedResourceUrlAll(container)
    const notifications = await Promise.all(resources.map(async (uri) => {
      try {
        const response = await this.fetcher(uri, { headers: { Accept: 'application/ld+json' } })
        if (!response.ok) return
        return parseOtakuNotification(await response.json(), uri)
      } catch { return }
    }))
    const unique = new Map<string, OtakuNotification>()
    for (const item of notifications) {
      if (!item) continue
      const payload = item.kind === 'proposal' ? item.proposal : item.kind === 'acceptance' ? item.acceptance : item.kind === 'response' ? item.response : item.kind === 'proof' ? item.proof : item.review
      unique.set(`${item.kind}:${payload.id}`, item)
    }
    return [...unique.values()]
  }

  private async post(inbox: string, body: object) {
    const url = new URL(inbox)
    if (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '::1'].includes(url.hostname)) throw new Error('Refusing an insecure or local inbox URL.')
    const response = await this.fetcher(inbox, {
      method: 'POST', headers: { 'Content-Type': 'application/ld+json' }, body: JSON.stringify(body),
    })
    if (response.status !== 201 && response.status !== 202) throw new Error(`The recipient inbox rejected the notification (${response.status}).`)
  }
}
