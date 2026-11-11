import {
  buildThing,
  createSolidDataset,
  createThing,
  getInteger,
  getFile,
  getPodUrlAll,
  getSolidDataset,
  getSourceUrl,
  getStringNoLocale,
  getThingAll,
  getUrl,
  getUrlAll,
  overwriteFile,
  saveSolidDatasetAt,
  setThing,
  universalAccess,
  type SolidDataset,
  type Thing,
} from '@inrupt/solid-client'
import type { OutboxOperation, Proof, ProofSubmissionRecord, Proposal, TaskDetailFile, TaskList, TaskPart } from '../domain/models'
import { authFetch } from './auth'

export interface Workspace {
  tasks: TaskList[]
  proposals: Proposal[]
  outbox: OutboxOperation[]
  incomingProofs: ProofSubmissionRecord[]
  processedNotificationIds: string[]
}
export interface WorkspaceRepository {
  load(): Promise<Workspace>
  save(data: Workspace): Promise<void>
  taskUri(taskId: string): Promise<string>
  uploadTaskDetail(partId: string, file: File): Promise<TaskDetailFile>
  shareTaskDetail(detail: TaskDetailFile, recipientWebId: string): Promise<void>
  revokeTaskDetail(detail: TaskDetailFile, recipientWebId: string): Promise<void>
  downloadTaskDetail(detail: TaskDetailFile): Promise<Blob>
}

export const emptyWorkspace = (): Workspace => ({ tasks: [], proposals: [], outbox: [], incomingProofs: [], processedNotificationIds: [] })

export function normalizeWorkspace(value: unknown): Workspace {
  if (!value || typeof value !== 'object') throw new Error('Workspace data is invalid.')
  const data = value as Partial<Workspace>
  if (!Array.isArray(data.tasks) || !Array.isArray(data.proposals)) throw new Error('Workspace data is invalid.')
  return {
    tasks: data.tasks,
    proposals: data.proposals,
    outbox: Array.isArray(data.outbox) ? data.outbox : [],
    incomingProofs: Array.isArray(data.incomingProofs) ? data.incomingProofs : [],
    processedNotificationIds: Array.isArray(data.processedNotificationIds) ? data.processedNotificationIds : [],
  }
}
const NS = 'urn:otaku:vocab:'
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
const V = new Proxy({}, { get: (_target, key) => `${NS}${String(key)}` }) as Record<string, string>
const isNotFound = (error: unknown) => (error as { statusCode?: number }).statusCode === 404 || String(error).includes('404')
const SHAPES = `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix otaku: <urn:otaku:vocab:> .

otaku:TaskListShape a sh:NodeShape ; sh:targetClass otaku:TaskList ;
  sh:property [ sh:path otaku:identifier ; sh:minCount 1 ; sh:maxCount 1 ] ;
  sh:property [ sh:path otaku:name ; sh:minCount 1 ; sh:maxCount 1 ] ;
  sh:property [ sh:path otaku:owner ; sh:minCount 1 ; sh:maxCount 1 ; sh:nodeKind sh:IRI ] ;
  sh:property [ sh:path otaku:status ; sh:minCount 1 ; sh:maxCount 1 ] .

otaku:TaskPartShape a sh:NodeShape ; sh:targetClass otaku:TaskPart ;
  sh:property [ sh:path otaku:identifier ; sh:minCount 1 ; sh:maxCount 1 ] ;
  sh:property [ sh:path otaku:name ; sh:minCount 1 ; sh:maxCount 1 ] ;
  sh:property [ sh:path otaku:status ; sh:minCount 1 ; sh:maxCount 1 ] ;
  sh:property [ sh:path otaku:detailFile ; sh:maxCount 1 ; sh:nodeKind sh:IRI ] .

otaku:ProposalShape a sh:NodeShape ; sh:targetClass otaku:Proposal ;
  sh:property [ sh:path otaku:proposer ; sh:minCount 1 ; sh:maxCount 1 ; sh:nodeKind sh:IRI ] ;
  sh:property [ sh:path otaku:recipient ; sh:minCount 1 ; sh:maxCount 1 ; sh:nodeKind sh:IRI ] .
`

export class PodRepository implements WorkspaceRepository {
  private rootUrl = ''
  constructor(private readonly webId: string) {}

  private async root() {
    if (this.rootUrl) return this.rootUrl
    const pod = (await getPodUrlAll(this.webId, { fetch: authFetch }))[0]
    if (!pod) throw new Error('No Pod storage URL was found in your WebID profile.')
    return (this.rootUrl = `${pod.replace(/\/$/, '')}/private/otaku/`)
  }

  private async dataset(url: string): Promise<SolidDataset> {
    try { return await getSolidDataset(url, { fetch: authFetch }) }
    catch (error) { if (isNotFound(error)) return createSolidDataset(); throw error }
  }

  private async putThing(url: string, thing: Thing) {
    const dataset = setThing(await this.dataset(url), thing)
    await saveSolidDatasetAt(url, dataset, { fetch: authFetch })
  }

  async load(): Promise<Workspace> {
    const root = await this.root()
    const indexUrl = `${root}index.ttl`
    let index: SolidDataset
    try { index = await getSolidDataset(indexUrl, { fetch: authFetch }) }
    catch (error) {
      if (!isNotFound(error)) throw new Error('Your Pod could not be reached.')
      return this.loadLegacy()
    }
    const indexThing = getThingAll(index)[0]
    if (!indexThing) return emptyWorkspace()
    const tasks = await Promise.all(getUrlAll(indexThing, V.task).map((url) => this.readTask(url)))
    const proposals = await Promise.all(getUrlAll(indexThing, V.proposal).map((url) => this.readProposal(url)))
    const parse = <T>(predicate: string, fallback: T): T => {
      const raw = getStringNoLocale(indexThing, predicate)
      if (!raw) return fallback
      try { return JSON.parse(raw) as T } catch { throw new Error('Workspace operation metadata is corrupt.') }
    }
    return normalizeWorkspace({
      tasks,
      proposals,
      outbox: parse<OutboxOperation[]>(V.outbox, []),
      incomingProofs: parse<ProofSubmissionRecord[]>(V.incomingProofs, []),
      processedNotificationIds: parse<string[]>(V.processedNotifications, []),
    })
  }

  private async loadLegacy(): Promise<Workspace> {
    const response = await authFetch(`${await this.root()}workspace.json`, { headers: { Accept: 'application/json' } })
    if (response.status === 404) return emptyWorkspace()
    if (!response.ok) throw new Error(response.status === 403 ? 'OTAku is not authorized to read this Pod resource.' : 'Your Pod could not be reached.')
    return normalizeWorkspace(await response.json())
  }

  async save(data: Workspace) {
    const lockName = `otaku-workspace:${this.webId}`
    if (navigator.locks) return navigator.locks.request(lockName, () => this.saveUnlocked(data))
    return this.saveUnlocked(data)
  }

  private async saveUnlocked(data: Workspace) {
    const root = await this.root()
    await overwriteFile(`${root}shapes/otaku-shapes.ttl`, new Blob([SHAPES], { type: 'text/turtle' }), { contentType: 'text/turtle', fetch: authFetch })
    for (const task of data.tasks) await this.writeTask(task)
    for (const proposal of data.proposals) await this.writeProposal(proposal)

    let builder = buildThing(createThing({ url: `${root}index.ttl#workspace` }))
      .addUrl(RDF_TYPE, V.Workspace)
      .addStringNoLocale(V.ownerWebId, this.webId)
      .addStringNoLocale(V.schemaVersion, '3')
      .addStringNoLocale(V.outbox, JSON.stringify(data.outbox))
      .addStringNoLocale(V.incomingProofs, JSON.stringify(data.incomingProofs))
      .addStringNoLocale(V.processedNotifications, JSON.stringify(data.processedNotificationIds))
    for (const task of data.tasks) builder = builder.addUrl(V.task, await this.taskUri(task.id))
    for (const proposal of data.proposals) builder = builder.addUrl(V.proposal, this.proposalUri(proposal.id, root))
    await this.putThing(`${root}index.ttl`, builder.build())
  }

  private async writeTask(task: TaskList) {
    const url = await this.taskUri(task.id)
    task.uri = url
    for (const part of task.parts) await this.writePart(part)
    for (const child of task.children) await this.writeTask(child)
    for (const proof of task.proofs) await this.writeProof(proof)

    let builder = buildThing(createThing({ url: `${url}#it` }))
      .addUrl(RDF_TYPE, V.TaskList)
      .addStringNoLocale(V.identifier, task.id)
      .addStringNoLocale(V.name, task.name)
      .addStringNoLocale(V.description, task.description)
      .addUrl(V.owner, task.ownerWebId)
      .addStringNoLocale(V.originDate, task.originDate)
      .addStringNoLocale(V.deadline, task.deadline)
      .addStringNoLocale(V.status, task.status)
    if (task.upstreamOwnerWebId) builder = builder.addUrl(V.directUpstreamOwner, task.upstreamOwnerWebId)
    if (task.sourceProposalId) builder = builder.addStringNoLocale(V.sourceProposalId, task.sourceProposalId)
    for (const upstream of task.upstreamWebIds ?? []) builder = builder.addUrl(V.upstreamOwner, upstream)
    for (const part of task.parts) builder = builder.addUrl(V.part, await this.partUri(part.id))
    for (const child of task.children) builder = builder.addUrl(V.childTask, await this.taskUri(child.id))
    for (const proof of task.proofs) builder = builder.addUrl(V.proof, await this.proofUri(proof.id))
    let thing = builder.build()
    if (task.detailFile) thing = buildThing(thing).addUrl(V.detailFile, task.detailFile.uri).addStringNoLocale(V.detailName, task.detailFile.name).addStringNoLocale(V.detailMediaType, task.detailFile.mediaType).addInteger(V.detailSize, task.detailFile.size).build()
    await this.putThing(url, thing)
  }

  private async writePart(part: TaskPart) {
    const url = await this.partUri(part.id)
    let builder = buildThing(createThing({ url: `${url}#it` }))
      .addUrl(RDF_TYPE, V.TaskPart)
      .addStringNoLocale(V.identifier, part.id)
      .addStringNoLocale(V.name, part.name)
      .addStringNoLocale(V.description, part.description)
      .addStringNoLocale(V.status, part.status)
    if (part.delegatedTaskUri) builder = builder.addUrl(V.delegatedTask, part.delegatedTaskUri)
    let thing = builder.build()
    if (part.detailFile) thing = buildThing(thing).addUrl(V.detailFile, part.detailFile.uri).addStringNoLocale(V.detailName, part.detailFile.name).addStringNoLocale(V.detailMediaType, part.detailFile.mediaType).addInteger(V.detailSize, part.detailFile.size).build()
    await this.putThing(url, thing)
  }

  private async writeProposal(proposal: Proposal) {
    const root = await this.root()
    const url = this.proposalUri(proposal.id, root)
    let builder = buildThing(createThing({ url: `${url}#it` }))
      .addUrl(RDF_TYPE, V.Proposal)
      .addStringNoLocale(V.identifier, proposal.id)
      .addStringNoLocale(V.taskListId, proposal.taskListId)
      .addStringNoLocale(V.taskPartId, proposal.taskPartId)
      .addUrl(V.proposer, proposal.fromWebId)
      .addUrl(V.recipient, proposal.toWebId)
      .addStringNoLocale(V.status, proposal.status)
      .addStringNoLocale(V.createdAt, proposal.createdAt)
      .addStringNoLocale(V.name, proposal.taskName)
      .addStringNoLocale(V.description, proposal.taskDescription)
      .addStringNoLocale(V.deadline, proposal.deadline)
    for (const upstream of proposal.upstreamWebIds) builder = builder.addUrl(V.upstreamOwner, upstream)
    if (proposal.respondedAt) builder = builder.addStringNoLocale(V.respondedAt, proposal.respondedAt)
    if (proposal.replyInbox) builder = builder.addUrl(V.replyInbox, proposal.replyInbox)
    if (proposal.notificationUri) builder = builder.addUrl(V.notification, proposal.notificationUri)
    if (proposal.acceptedTaskUri) builder = builder.addUrl(V.acceptedTask, proposal.acceptedTaskUri)
    if (proposal.identityConsent) {
      const consentUrl = `${root}consents/${encodeURIComponent(proposal.id)}.ttl`
      builder = builder.addUrl(V.consent, consentUrl)
      let consent = buildThing(createThing({ url: `${consentUrl}#it` }))
        .addUrl(RDF_TYPE, V.IdentityConsent)
        .addStringNoLocale(V.grantedAt, proposal.identityConsent.grantedAt)
      for (const recipient of proposal.identityConsent.disclosedTo) consent = consent.addUrl(V.disclosedTo, recipient)
      await this.putThing(consentUrl, consent.build())
    }
    let thing = builder.build()
    if (proposal.detailFile) thing = buildThing(thing).addUrl(V.detailFile, proposal.detailFile.uri).addStringNoLocale(V.detailName, proposal.detailFile.name).addStringNoLocale(V.detailMediaType, proposal.detailFile.mediaType).addInteger(V.detailSize, proposal.detailFile.size).build()
    await this.putThing(url, thing)
  }

  private async writeProof(proof: Proof) {
    const url = await this.proofUri(proof.id)
    let builder = buildThing(createThing({ url: `${url}#it` }))
      .addUrl(RDF_TYPE, V.ProofSubmission)
      .addStringNoLocale(V.identifier, proof.id)
      .addUrl(V.evidence, proof.address)
      .addInteger(V.size, proof.size)
      .addStringNoLocale(V.submittedAt, proof.submittedAt)
      .addStringNoLocale(V.status, proof.status)
    if (proof.status !== 'PENDING') {
      const reviewUrl = `${await this.root()}reviews/${encodeURIComponent(proof.id)}.ttl`
      builder = builder.addUrl(V.review, reviewUrl)
      let review = buildThing(createThing({ url: `${reviewUrl}#it` }))
        .addUrl(RDF_TYPE, V.ReviewDecision)
        .addStringNoLocale(V.decision, proof.status)
      if (proof.rejectionReason) review = review.addStringNoLocale(V.reason, proof.rejectionReason)
      await this.putThing(reviewUrl, review.build())
    }
    await this.putThing(url, builder.build())
  }

  private readDetail(thing: Thing): TaskDetailFile | undefined {
    const uri = getUrl(thing, V.detailFile)
    if (!uri) return
    return {
      uri,
      name: getStringNoLocale(thing, V.detailName) ?? 'Task detail',
      mediaType: getStringNoLocale(thing, V.detailMediaType) ?? 'application/octet-stream',
      size: getInteger(thing, V.detailSize) ?? 0,
    }
  }

  private async readTask(url: string): Promise<TaskList> {
    const thing = getThingAll(await getSolidDataset(url, { fetch: authFetch }))[0]
    if (!thing) throw new Error(`Invalid Task-List resource: ${url}`)
    const parts = await Promise.all(getUrlAll(thing, V.part).map((item) => this.readPart(item)))
    const children = await Promise.all(getUrlAll(thing, V.childTask).map((item) => this.readTask(item)))
    const proofs = await Promise.all(getUrlAll(thing, V.proof).map((item) => this.readProof(item)))
    const upstream = getUrlAll(thing, V.upstreamOwner)
    return {
      id: this.requiredString(thing, V.identifier, 'Task-List identifier'), uri: url,
      name: this.requiredString(thing, V.name, 'Task-List name'), description: getStringNoLocale(thing, V.description) ?? '',
      ownerWebId: this.requiredUrl(thing, V.owner, 'Task-List owner'), upstreamOwnerWebId: getUrl(thing, V.directUpstreamOwner) ?? undefined, upstreamWebIds: upstream,
      originDate: this.requiredString(thing, V.originDate, 'Task-List origin date'), deadline: getStringNoLocale(thing, V.deadline) ?? '',
      status: (getStringNoLocale(thing, V.status) ?? 'CREATED') as TaskList['status'], parts, children, proofs, detailFile: this.readDetail(thing),
      sourceProposalId: getStringNoLocale(thing, V.sourceProposalId) ?? undefined,
    }
  }

  private async readPart(url: string): Promise<TaskPart> {
    const thing = getThingAll(await getSolidDataset(url, { fetch: authFetch }))[0]
    if (!thing) throw new Error(`Invalid Task-Part resource: ${url}`)
    return {
      id: this.requiredString(thing, V.identifier, 'Task-Part identifier'), name: this.requiredString(thing, V.name, 'Task-Part name'),
      description: getStringNoLocale(thing, V.description) ?? '', status: (getStringNoLocale(thing, V.status) ?? 'UNASSIGNED') as TaskPart['status'],
      delegatedTaskUri: getUrl(thing, V.delegatedTask) ?? undefined, detailFile: this.readDetail(thing),
    }
  }

  private async readProposal(url: string): Promise<Proposal> {
    const thing = getThingAll(await getSolidDataset(url, { fetch: authFetch }))[0]
    if (!thing) throw new Error(`Invalid Proposal resource: ${url}`)
    const consentUrl = getUrl(thing, V.consent)
    let identityConsent: Proposal['identityConsent']
    if (consentUrl) {
      const consent = getThingAll(await getSolidDataset(consentUrl, { fetch: authFetch }))[0]
      if (consent) identityConsent = { grantedAt: getStringNoLocale(consent, V.grantedAt) ?? '', disclosedTo: getUrlAll(consent, V.disclosedTo) }
    }
    return {
      id: this.requiredString(thing, V.identifier, 'Proposal identifier'), taskListId: this.requiredString(thing, V.taskListId, 'Proposal Task-List'),
      taskPartId: this.requiredString(thing, V.taskPartId, 'Proposal Task-Part'), fromWebId: this.requiredUrl(thing, V.proposer, 'Proposer'),
      toWebId: this.requiredUrl(thing, V.recipient, 'Recipient'), status: (getStringNoLocale(thing, V.status) ?? 'PROPOSED') as Proposal['status'],
      createdAt: this.requiredString(thing, V.createdAt, 'Proposal creation date'), taskName: this.requiredString(thing, V.name, 'Proposal name'),
      taskDescription: getStringNoLocale(thing, V.description) ?? '', deadline: getStringNoLocale(thing, V.deadline) ?? '',
      upstreamWebIds: getUrlAll(thing, V.upstreamOwner), respondedAt: getStringNoLocale(thing, V.respondedAt) ?? undefined,
      replyInbox: getUrl(thing, V.replyInbox) ?? undefined, notificationUri: getUrl(thing, V.notification) ?? undefined,
      acceptedTaskUri: getUrl(thing, V.acceptedTask) ?? undefined, identityConsent, detailFile: this.readDetail(thing),
    }
  }

  private async readProof(url: string): Promise<Proof> {
    const thing = getThingAll(await getSolidDataset(url, { fetch: authFetch }))[0]
    if (!thing) throw new Error(`Invalid Proof resource: ${url}`)
    let rejectionReason: string | undefined
    const reviewUrl = getUrl(thing, V.review)
    if (reviewUrl) {
      const review = getThingAll(await getSolidDataset(reviewUrl, { fetch: authFetch }))[0]
      rejectionReason = review ? getStringNoLocale(review, V.reason) ?? undefined : undefined
    }
    return {
      id: this.requiredString(thing, V.identifier, 'Proof identifier'), address: this.requiredUrl(thing, V.evidence, 'Proof evidence'),
      size: getInteger(thing, V.size) ?? 0, submittedAt: this.requiredString(thing, V.submittedAt, 'Proof submission date'),
      status: (getStringNoLocale(thing, V.status) ?? 'PENDING') as Proof['status'], rejectionReason,
    }
  }

  private requiredString(thing: Thing, predicate: string, label: string) {
    const value = getStringNoLocale(thing, predicate)
    if (value === null) throw new Error(`${label} is missing from RDF data.`)
    return value
  }
  private requiredUrl(thing: Thing, predicate: string, label: string) {
    const value = getUrl(thing, predicate)
    if (value === null) throw new Error(`${label} is missing from RDF data.`)
    return value
  }

  async taskUri(taskId: string) { return `${await this.root()}task-lists/${encodeURIComponent(taskId)}.ttl` }
  private async partUri(partId: string) { return `${await this.root()}task-parts/${encodeURIComponent(partId)}.ttl` }
  private async proofUri(proofId: string) { return `${await this.root()}proofs/${encodeURIComponent(proofId)}.ttl` }
  private proposalUri(proposalId: string, root: string) { return `${root}proposals/${encodeURIComponent(proposalId)}.ttl` }

  async uploadTaskDetail(partId: string, file: File): Promise<TaskDetailFile> {
    const target = `${await this.root()}details/${encodeURIComponent(partId)}/${encodeURIComponent(file.name)}`
    const saved = await overwriteFile(target, file, { contentType: file.type || 'application/octet-stream', fetch: authFetch })
    return { uri: getSourceUrl(saved), name: file.name, mediaType: file.type || 'application/octet-stream', size: file.size }
  }

  async shareTaskDetail(detail: TaskDetailFile, recipientWebId: string) {
    const access = await universalAccess.setAgentAccess(detail.uri, recipientWebId, {
      read: true, append: false, write: false, controlRead: false, controlWrite: false,
    }, { fetch: authFetch })
    if (!access?.read) throw new Error('Could not grant the delegate read access to the task-detail file.')
  }

  async revokeTaskDetail(detail: TaskDetailFile, recipientWebId: string) {
    await universalAccess.setAgentAccess(detail.uri, recipientWebId, {
      read: false, append: false, write: false, controlRead: false, controlWrite: false,
    }, { fetch: authFetch })
  }

  async downloadTaskDetail(detail: TaskDetailFile) {
    return getFile(detail.uri, { fetch: authFetch })
  }
}

export class DemoRepository implements WorkspaceRepository {
  private key = 'otaku-demo-workspace'
  async load() {
    try { return normalizeWorkspace(JSON.parse(localStorage.getItem(this.key) ?? JSON.stringify(emptyWorkspace()))) }
    catch (cause) { throw new Error(cause instanceof SyntaxError ? 'Demo workspace data is corrupt.' : cause instanceof Error ? cause.message : 'Demo workspace data is corrupt.') }
  }
  async save(data: Workspace) { localStorage.setItem(this.key, JSON.stringify(data)) }
  async taskUri(taskId: string) { return `urn:otaku:demo:task:${taskId}` }
  async uploadTaskDetail(partId: string, file: File): Promise<TaskDetailFile> {
    return { uri: `urn:otaku:demo:detail:${partId}:${encodeURIComponent(file.name)}`, name: file.name, mediaType: file.type || 'application/octet-stream', size: file.size }
  }
  async shareTaskDetail() {}
  async revokeTaskDetail() {}
  async downloadTaskDetail(): Promise<Blob> { throw new Error('Task-detail downloads require a Solid Pod session.') }
}
