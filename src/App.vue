<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import TaskTree from './components/TaskTree.vue'
import type { AcceptanceRecord, OutboxOperation, ProofReviewRecord, ProofSubmissionRecord, Proposal, ProposalResponseRecord, TaskList } from './domain/models'
import { acceptProposal, addChildTask, addTaskPart, approveProof, cancelProposal, completeLocalPart, confirmDelegation, createProposal, createTask, rejectProof, rejectProposal, submitProof, updateTask } from './domain/workflow'
import { restoreSession, signIn, signOut } from './services/auth'
import { DemoRepository, emptyWorkspace, normalizeWorkspace, PodRepository, type Workspace, type WorkspaceRepository } from './services/repository'
import { ProposalTransport } from './services/proposalTransport'
import { enqueueOperation, markOperationFailed, markOperationSucceeded } from './services/operations'

const workspace = ref<Workspace>(emptyWorkspace())
const repository = ref<WorkspaceRepository>()
const selected = ref<TaskList>()
const receivedProposals = ref<Proposal[]>([])
const loading = ref(true)
const error = ref('')
const dialog = ref(false)
const partDialog = ref(false)
const childDialog = ref(false)
const editDialog = ref(false)
const proposalDialog = ref(false)
const proofDialog = ref(false)
const issuer = ref('https://solidcommunity.net')
const form = ref({ name: '', description: '', deadline: '' })
const partForm = ref({ name: '', description: '' })
const partDetailFile = ref<File>()
const childForm = ref({ name: '', description: '', deadline: '' })
const editForm = ref({ name: '', description: '', deadline: '' })
const proposalForm = ref({ partId: '', toWebId: '' })
const identityConsent = ref<Record<string, boolean>>({})
const proofForm = ref({ address: '', size: 0 })
const rejectionReasons = ref<Record<string, string>>({})
const webId = ref('')
const demo = ref(false)
const actorWebId = () => webId.value || 'https://demo.otaku.local/profile#me'
const transport = new ProposalTransport()
const activeActions = new Set<string>()
const selectedProposals = computed(() => selected.value
  ? workspace.value.proposals.filter((proposal) => proposal.taskListId === selected.value!.id)
  : [])
const dialogOpen = computed(() => dialog.value || partDialog.value || childDialog.value || editDialog.value || proposalDialog.value || proofDialog.value)

async function open(repo: WorkspaceRepository) {
  loading.value = true; error.value = ''
  try { repository.value = repo; workspace.value = normalizeWorkspace(await repo.load()); selected.value = workspace.value.tasks[0] }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Something went wrong.' }
  finally { loading.value = false }
}

async function useDemo() { demo.value = true; await open(new DemoRepository()) }
async function save() { if (repository.value) await repository.value.save(workspace.value) }

function queueOperation(input: Pick<OutboxOperation, 'id' | 'kind' | 'recipientWebId' | 'inbox' | 'payload'>) {
  workspace.value.outbox = enqueueOperation(workspace.value.outbox, input)
}

async function deliverOperation(operationId: string) {
  const operation = workspace.value.outbox.find((candidate) => candidate.id === operationId)
  if (!operation || operation.status === 'SUCCEEDED') return
  try {
    if (!demo.value) await transport.sendOperation(operation)
    workspace.value.outbox = workspace.value.outbox.map((candidate) => candidate.id === operationId ? markOperationSucceeded(candidate) : candidate)
  } catch (cause) {
    workspace.value.outbox = workspace.value.outbox.map((candidate) => candidate.id === operationId ? markOperationFailed(candidate, cause) : candidate)
    error.value = cause instanceof Error ? cause.message : 'A remote operation failed.'
  }
  await save()
}

async function retryOperation(operationId: string) {
  await deliverOperation(operationId)
}

async function flushOutbox() {
  for (const operation of workspace.value.outbox.filter((candidate) => candidate.status !== 'SUCCEEDED')) {
    await deliverOperation(operation.id)
  }
}
async function addTask() {
  try {
    const task = createTask({ ...form.value, ownerWebId: webId.value || 'https://demo.otaku.local/profile#me' })
    workspace.value.tasks.push(task); selected.value = task; await save(); dialog.value = false
    form.value = { name: '', description: '', deadline: '' }
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not create task.' }
}

function replaceTask(tasks: TaskList[], replacement: TaskList): TaskList[] {
  return tasks.map((task) => task.id === replacement.id ? replacement : { ...task, children: replaceTask(task.children, replacement) })
}

function findTask(tasks: TaskList[], taskId: string): TaskList | undefined {
  for (const task of tasks) {
    if (task.id === taskId) return task
    const nested = findTask(task.children, taskId)
    if (nested) return nested
  }
}

async function persistSelected(replacement: TaskList) {
  workspace.value.tasks = replaceTask(workspace.value.tasks, replacement)
  selected.value = replacement
  await save()
}

async function addPart() {
  if (!selected.value) return
  try {
    const partId = crypto.randomUUID()
    const detailFile = partDetailFile.value
      ? await repository.value!.uploadTaskDetail(partId, partDetailFile.value)
      : undefined
    await persistSelected(addTaskPart(selected.value, { ...partForm.value, id: partId, detailFile }, actorWebId()))
    partForm.value = { name: '', description: '' }; partDetailFile.value = undefined; partDialog.value = false
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not create task part.' }
}

async function addChild() {
  if (!selected.value) return
  try {
    await persistSelected(addChildTask(selected.value, childForm.value, actorWebId()))
    childForm.value = { name: '', description: '', deadline: '' }; childDialog.value = false
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not create child task list.' }
}

function beginEdit() {
  if (!selected.value) return
  editForm.value = { name: selected.value.name, description: selected.value.description, deadline: selected.value.deadline }
  editDialog.value = true
}

async function editTask() {
  if (!selected.value) return
  try {
    await persistSelected(updateTask(selected.value, editForm.value, actorWebId()))
    editDialog.value = false
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not update task list.' }
}

async function finishPart(partId: string) {
  if (!selected.value) return
  try { await persistSelected(completeLocalPart(selected.value, partId, actorWebId(), workspace.value.proposals)) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not complete task part.' }
}

function beginProposal(partId: string) {
  proposalForm.value = { partId, toWebId: '' }
  proposalDialog.value = true
}

function selectPartDetail(event: Event) {
  partDetailFile.value = (event.target as HTMLInputElement).files?.[0]
}

async function openTaskDetail(detail: import('./domain/models').TaskDetailFile) {
  try {
    const file = await repository.value!.downloadTaskDetail(detail)
    const objectUrl = URL.createObjectURL(file)
    window.open(objectUrl, '_blank', 'noopener')
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not read the task-detail file.' }
}

async function proposePart() {
  if (!selected.value) return
  const actionKey = `proposal:${selected.value.id}:${proposalForm.value.partId}`
  if (activeActions.has(actionKey)) return
  activeActions.add(actionKey)
  let proposal: Proposal | undefined
  let persisted = false
  try {
    proposal = createProposal(selected.value, proposalForm.value.partId, proposalForm.value.toWebId, actorWebId(), workspace.value.proposals)
    if (!demo.value) proposal.replyInbox = await transport.discoverInbox(actorWebId())
    if (proposal.detailFile) await repository.value!.shareTaskDetail(proposal.detailFile, proposal.toWebId)
    workspace.value.proposals.push(proposal)
    queueOperation({ id: `proposal:${proposal.id}`, kind: 'proposal', recipientWebId: proposal.toWebId, payload: proposal })
    await save()
    persisted = true
    await deliverOperation(`proposal:${proposal.id}`)
    proposalDialog.value = false
  } catch (cause) {
    if (proposal?.detailFile && !persisted) await repository.value!.revokeTaskDetail(proposal.detailFile, proposal.toWebId).catch(() => undefined)
    error.value = cause instanceof Error ? cause.message : 'Could not create proposal.'
  }
  finally { activeActions.delete(actionKey) }
}

async function cancelPendingProposal(proposalId: string) {
  const proposal = workspace.value.proposals.find((candidate) => candidate.id === proposalId)
  if (!proposal) return
  try {
    workspace.value.proposals = workspace.value.proposals.map((candidate) => candidate.id === proposalId ? cancelProposal(candidate, actorWebId()) : candidate)
    if (proposal.detailFile) await repository.value!.revokeTaskDetail(proposal.detailFile, proposal.toWebId)
    const response: ProposalResponseRecord = {
      id: `cancel:${proposal.id}`, proposalId: proposal.id, fromWebId: actorWebId(), toWebId: proposal.toWebId,
      decision: 'CANCELLED', respondedAt: new Date().toISOString(),
    }
    queueOperation({ id: response.id, kind: 'response', recipientWebId: response.toWebId, payload: response })
    await save()
    await deliverOperation(response.id)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not cancel proposal.' }
}

async function respondToProposal(proposalId: string, accepts: boolean) {
  const proposal = receivedProposals.value.find((candidate) => candidate.id === proposalId)
    ?? workspace.value.proposals.find((candidate) => candidate.id === proposalId)
  if (!proposal) return
  const actionKey = `response:${proposalId}`
  if (activeActions.has(actionKey)) return
  activeActions.add(actionKey)
  try {
    if (accepts) {
      const result = acceptProposal(proposal, actorWebId(), identityConsent.value[proposalId] === true)
      result.task.uri = await repository.value!.taskUri(result.task.id)
      const existing = workspace.value.proposals.some((candidate) => candidate.id === proposalId)
      workspace.value.proposals = existing
        ? workspace.value.proposals.map((candidate) => candidate.id === proposalId ? result.proposal : candidate)
        : [...workspace.value.proposals, result.proposal]
      workspace.value.tasks = workspace.value.tasks.some((task) => task.id === result.task.id)
        ? workspace.value.tasks.map((task) => task.id === result.task.id ? result.task : task)
        : [...workspace.value.tasks, result.task]
      selected.value = result.task
      identityConsent.value[proposalId] = false
      if (!proposal.replyInbox && !demo.value) throw new Error('The proposal does not include a reply inbox.')
      const acceptance: AcceptanceRecord = {
        id: `acceptance:${proposal.id}`, proposalId: proposal.id, fromWebId: actorWebId(), toWebId: proposal.fromWebId,
        taskListUri: result.task.uri, acceptedAt: result.proposal.respondedAt!,
      }
      queueOperation({ id: acceptance.id, kind: 'acceptance', inbox: proposal.replyInbox, recipientWebId: proposal.fromWebId, payload: acceptance })
      await save()
      await deliverOperation(acceptance.id)
    } else {
      const rejected = rejectProposal(proposal, actorWebId())
      workspace.value.proposals = [...workspace.value.proposals.filter((candidate) => candidate.id !== proposalId), rejected]
      const response: ProposalResponseRecord = {
        id: `reject:${proposal.id}`, proposalId: proposal.id, fromWebId: actorWebId(), toWebId: proposal.fromWebId,
        decision: 'REJECTED', respondedAt: rejected.respondedAt!,
      }
      queueOperation({ id: response.id, kind: 'response', inbox: proposal.replyInbox, recipientWebId: response.toWebId, payload: response })
      await save()
      await deliverOperation(response.id)
    }
    receivedProposals.value = receivedProposals.value.filter((candidate) => candidate.id !== proposalId)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not respond to proposal.' }
  finally { activeActions.delete(actionKey) }
}

async function refreshReceived() {
  if (demo.value || !webId.value) return
  try {
    const notifications = await transport.received(webId.value)
    const unprocessed = notifications.filter((item) => {
      const payload = item.kind === 'proposal' ? item.proposal : item.kind === 'acceptance' ? item.acceptance : item.kind === 'response' ? item.response : item.kind === 'proof' ? item.proof : item.review
      return !workspace.value.processedNotificationIds.includes(`${item.kind}:${payload.id}`)
    })
    receivedProposals.value = unprocessed
      .filter((item) => item.kind === 'proposal' && item.proposal.toWebId === webId.value)
      .map((item) => (item as { kind: 'proposal'; proposal: Proposal }).proposal)
      .filter((proposal) => !workspace.value.proposals.some((stored) => stored.id === proposal.id && stored.status !== 'PROPOSED'))

    let changed = false
    for (const item of unprocessed) {
      const payload = item.kind === 'proposal' ? item.proposal : item.kind === 'acceptance' ? item.acceptance : item.kind === 'response' ? item.response : item.kind === 'proof' ? item.proof : item.review
      const notificationId = `${item.kind}:${payload.id}`
      if (item.kind === 'acceptance' && item.acceptance.toWebId === webId.value) {
        const proposal = workspace.value.proposals.find((candidate) => candidate.id === item.acceptance.proposalId)
        const task = proposal && findTask(workspace.value.tasks, proposal.taskListId)
        if (proposal?.status === 'PROPOSED' && task) {
          const confirmed = confirmDelegation(task, proposal, item.acceptance, webId.value)
          workspace.value.tasks = replaceTask(workspace.value.tasks, confirmed.task)
          workspace.value.proposals = workspace.value.proposals.map((candidate) => candidate.id === proposal.id ? confirmed.proposal : candidate)
          if (selected.value?.id === task.id) selected.value = confirmed.task
          changed = true
        }
      } else if (item.kind === 'response' && item.response.toWebId === webId.value) {
        workspace.value.proposals = workspace.value.proposals.map((proposal) => proposal.id === item.response.proposalId
          ? { ...proposal, status: item.response.decision, respondedAt: item.response.respondedAt }
          : proposal)
        changed = true
        if (item.response.decision === 'CANCELLED') receivedProposals.value = receivedProposals.value.filter((proposal) => proposal.id !== item.response.proposalId)
      } else if (item.kind === 'proof' && item.proof.toWebId === webId.value) {
        if (!workspace.value.incomingProofs.some((proof) => proof.id === item.proof.id)) workspace.value.incomingProofs.push(item.proof)
        changed = true
      } else if (item.kind === 'review' && item.review.toWebId === webId.value) {
        const task = workspace.value.tasks.find((candidate) => candidate.sourceProposalId === item.review.proposalId)
        if (task) {
          const reviewed = item.review.decision === 'APPROVED'
            ? approveProof(task, item.review.proofId, item.review.fromWebId)
            : rejectProof(task, item.review.proofId, item.review.fromWebId, item.review.reason ?? '')
          workspace.value.tasks = replaceTask(workspace.value.tasks, reviewed)
          if (selected.value?.id === task.id) selected.value = reviewed
          changed = true
        }
      }
      if (item.kind !== 'proposal') workspace.value.processedNotificationIds.push(notificationId)
    }
    if (changed) await save()
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not load received proposals.' }
}

async function submitTaskProof() {
  if (!selected.value) return
  try {
    const submitted = submitProof(selected.value, proofForm.value, actorWebId())
    workspace.value.tasks = replaceTask(workspace.value.tasks, submitted)
    selected.value = submitted
    const proof = submitted.proofs.at(-1)!
    const message: ProofSubmissionRecord = {
      id: `proof:${proof.id}`, proposalId: submitted.sourceProposalId!, fromWebId: actorWebId(), toWebId: submitted.upstreamOwnerWebId!,
      taskListUri: submitted.uri!, taskName: submitted.name, proof,
    }
    queueOperation({ id: message.id, kind: 'proof', recipientWebId: message.toWebId, payload: message })
    await save()
    await deliverOperation(message.id)
    proofForm.value = { address: '', size: 0 }; proofDialog.value = false
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not submit proof.' }
}

async function reviewIncomingProof(submission: ProofSubmissionRecord, approves: boolean) {
  try {
    const reason = rejectionReasons.value[submission.proof.id] ?? ''
    if (!approves && !reason.trim()) throw new Error('Rejection reason is required')
    const proposal = workspace.value.proposals.find((candidate) => candidate.id === submission.proposalId)
    if (!proposal || proposal.fromWebId !== actorWebId()) throw new Error('Only the direct upstream owner may review proof')
    const task = findTask(workspace.value.tasks, proposal.taskListId)
    if (!task) throw new Error('Original task list not found')
    const updated: TaskList = {
      ...task,
      parts: task.parts.map((part) => part.id === proposal.taskPartId ? { ...part, status: approves ? 'DONE' : 'IN_PROGRESS' } : part),
    }
    workspace.value.tasks = replaceTask(workspace.value.tasks, updated)
    const review: ProofReviewRecord = {
      id: `review:${submission.proof.id}:${approves ? 'approved' : 'rejected'}`,
      proposalId: submission.proposalId, fromWebId: actorWebId(), toWebId: submission.fromWebId,
      proofId: submission.proof.id, decision: approves ? 'APPROVED' : 'REJECTED', reason: approves ? undefined : reason.trim(),
      reviewedAt: new Date().toISOString(),
    }
    workspace.value.incomingProofs = workspace.value.incomingProofs.filter((candidate) => candidate.id !== submission.id)
    queueOperation({ id: review.id, kind: 'review', recipientWebId: review.toWebId, payload: review })
    await save()
    await deliverOperation(review.id)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not review proof.' }
}

async function reviewTaskProof(proofId: string, approves: boolean) {
  if (!selected.value) return
  try {
    const reviewed = approves
      ? approveProof(selected.value, proofId, actorWebId())
      : rejectProof(selected.value, proofId, actorWebId(), rejectionReasons.value[proofId] ?? '')
    await persistSelected(reviewed)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not review proof.' }
}
async function exit() { if (!demo.value) await signOut(); location.reload() }

onMounted(async () => {
  try {
    const info = await restoreSession()
    if (info.isLoggedIn && info.webId) {
      webId.value = info.webId
      await open(new PodRepository(info.webId))
      await flushOutbox()
      await refreshReceived()
    } else loading.value = false
  }
  catch { loading.value = false; error.value = 'Sign-in could not be restored.' }
})
</script>

<template>
  <div>
    <main v-if="!webId && !demo" class="login-shell" :inert="dialogOpen || undefined">
      <section class="login-copy">
        <p class="eyebrow">DECENTRALIZED WORKSPACE</p>
        <h1>Own your work.<br>Share only what matters.</h1>
        <p>Break group assignments into clear responsibilities while every student keeps their data in their own Solid Pod.</p>
      </section>

      <section class="login-card">
        <h2>Sign in to OTAku</h2>
        <p>Your task data never enters an OTAku database.</p>
        <form @submit.prevent="signIn(issuer)">
          <label for="issuer">Solid identity provider</label>
          <input id="issuer" v-model="issuer" type="url" />
          <button type="submit">Continue with Solid</button>
        </form>
        <hr />
        <button type="button" @click="useDemo">Explore demo mode</button>
        <p class="demo-note">Demo data stays in this browser and is not shared.</p>
      </section>
    </main>

    <template v-else>
      <header class="app-bar" :inert="dialogOpen || undefined">
        <p><strong>OTA</strong><span class="brand-accent">ku</span></p>
        <p class="identity" :title="demo ? 'Demo workspace' : webId">{{ demo ? 'Demo workspace' : webId }}</p>
        <button type="button" aria-label="Sign out" @click="exit">Sign out</button>
      </header>

      <aside class="sidebar" :inert="dialogOpen || undefined">
        <div class="sidebar-head">
          <div>
            <p class="eyebrow">MY WORKSPACE</p>
            <h2>Projects</h2>
          </div>
          <button type="button" aria-label="Create project" @click="dialog = true">+</button>
        </div>
        <div class="sidebar-body">
          <p v-if="loading">Loading…</p>
          <TaskTree v-else :tasks="workspace.tasks" :selected-id="selected?.id" @select="selected = $event" />
          <p v-if="!loading && !workspace.tasks.length" class="empty-small">No projects yet.<br>Create your first project.</p>
        </div>
      </aside>

      <main :inert="dialogOpen || undefined">
        <p v-if="error" class="page-alert" role="alert">
          {{ error }}
          <button type="button" @click="error = ''">Dismiss</button>
        </p>

        <section v-if="!demo" class="received-proposals">
          <h1>Received Proposals</h1>
          <button type="button" @click="refreshReceived">Refresh received proposals</button>
          <p v-if="!receivedProposals.length">No pending proposals received.</p>
          <ul v-else>
            <li v-for="proposal in receivedProposals" :key="proposal.id">
              <h2>{{ proposal.taskName }}</h2>
              <p>{{ proposal.taskDescription || 'No description provided.' }}</p>
              <p>Proposed by: {{ proposal.fromWebId }}</p>
              <p v-if="proposal.deadline">Deadline: {{ proposal.deadline }}</p>
              <p v-if="proposal.detailFile"><button type="button" @click="openTaskDetail(proposal.detailFile)">Open instructions: {{ proposal.detailFile.name }}</button> ({{ proposal.detailFile.size }} bytes)</p>
              <p>Your WebID will be disclosed to: {{ proposal.upstreamWebIds.join(', ') }}</p>
              <label><input v-model="identityConsent[proposal.id]" type="checkbox" /> I consent to this identity disclosure</label>
              <button type="button" @click="respondToProposal(proposal.id, true)">Accept</button>
              <button type="button" @click="respondToProposal(proposal.id, false)">Reject</button>
            </li>
          </ul>
        </section>

        <section v-if="selected" class="detail">
          <header class="detail-heading">
            <div class="detail-copy">
              <p class="eyebrow">PROJECT OVERVIEW</p>
              <h1>{{ selected.name }}</h1>
              <p class="detail-description">{{ selected.description || 'No description provided.' }}</p>
            </div>
            <p class="status">{{ selected.status.replaceAll('_', ' ') }}</p>
            <button v-if="!['PENDING_VERIFICATION', 'DONE', 'CANCELLED', 'EXPIRED'].includes(selected.status)" type="button" @click="beginEdit">Edit task list</button>
          </header>

          <dl class="facts">
            <div><dt>Owner</dt><dd>{{ selected.ownerWebId }}</dd></div>
            <div><dt>Started</dt><dd>{{ new Date(selected.originDate).toLocaleDateString() }}</dd></div>
            <div><dt>Deadline</dt><dd>{{ selected.deadline || 'Not set' }}</dd></div>
          </dl>

          <div class="section-head">
            <div>
              <p class="eyebrow">WORK BREAKDOWN</p>
              <h2>Task parts</h2>
            </div>
            <div>
              <button v-if="!['PENDING_VERIFICATION', 'DONE', 'CANCELLED', 'EXPIRED'].includes(selected.status)" type="button" @click="partDialog = true">Add task part</button>
              <button v-if="!['PENDING_VERIFICATION', 'DONE', 'CANCELLED', 'EXPIRED'].includes(selected.status)" type="button" @click="childDialog = true">Add child task list</button>
            </div>
          </div>

          <p v-if="!selected.parts.length" class="empty-state">No task parts yet.</p>
          <ul v-else>
            <li v-for="part in selected.parts" :key="part.id">
              <h3>{{ part.name }}</h3>
              <p>{{ part.description || 'No description provided.' }}</p>
              <p v-if="part.detailFile"><button type="button" @click="openTaskDetail(part.detailFile)">Task detail: {{ part.detailFile.name }}</button> ({{ part.detailFile.mediaType }}, {{ part.detailFile.size }} bytes)</p>
              <p>Status: {{ part.status.replaceAll('_', ' ') }}</p>
               <button v-if="part.status !== 'DONE' && !part.delegatedTaskUri && !workspace.proposals.some((proposal) => proposal.taskPartId === part.id && ['PROPOSED', 'ACCEPTED'].includes(proposal.status))" type="button" @click="finishPart(part.id)">Mark done</button>
               <button v-if="part.status !== 'DONE' && !part.delegatedTaskUri && !workspace.proposals.some((proposal) => proposal.taskPartId === part.id && ['PROPOSED', 'ACCEPTED'].includes(proposal.status))" type="button" @click="beginProposal(part.id)">Propose delegation</button>
            </li>
          </ul>

          <section>
            <h2>Child task lists</h2>
            <p v-if="!selected.children.length">No child task lists yet.</p>
            <ul v-else>
              <li v-for="child in selected.children" :key="child.id">
                <button type="button" @click="selected = child">{{ child.name }}</button>
                — {{ child.status.replaceAll('_', ' ') }}
              </li>
            </ul>
          </section>

          <section>
            <h2>Sent and recorded delegation proposals</h2>
            <p v-if="!selectedProposals.length">No proposals recorded.</p>
            <ul v-else>
              <li v-for="proposal in selectedProposals" :key="proposal.id">
                <strong>{{ proposal.taskName }}</strong>
                <p>From {{ proposal.fromWebId }} to {{ proposal.toWebId }}</p>
                <p>Status: {{ proposal.status }}</p>
                <button v-if="proposal.status === 'PROPOSED' && proposal.fromWebId === actorWebId()" type="button" @click="cancelPendingProposal(proposal.id)">Cancel proposal</button>
                <template v-if="proposal.status === 'PROPOSED' && proposal.toWebId === actorWebId()">
                  <p>Your WebID will be disclosed to: {{ proposal.upstreamWebIds.join(', ') }}</p>
                  <label><input v-model="identityConsent[proposal.id]" type="checkbox" /> I consent to this identity disclosure</label>
                  <button type="button" @click="respondToProposal(proposal.id, true)">Accept</button>
                  <button type="button" @click="respondToProposal(proposal.id, false)">Reject</button>
                </template>
              </li>
            </ul>
          </section>

          <section>
            <h2>Proof and verification</h2>
            <p v-if="selected.detailFile"><button type="button" @click="openTaskDetail(selected.detailFile)">Open work instructions: {{ selected.detailFile.name }}</button></p>
            <button v-if="selected.upstreamOwnerWebId && selected.ownerWebId === actorWebId() && ['ACCEPTED', 'IN_PROGRESS'].includes(selected.status) && selected.parts.every((part) => part.status === 'DONE') && selected.children.every((child) => child.status === 'DONE') && !selected.proofs.some((proof) => proof.status === 'PENDING')" type="button" @click="proofDialog = true">Submit proof</button>
            <p v-if="!selected.proofs.length">No proof submissions yet.</p>
            <ol v-else>
              <li v-for="proof in selected.proofs" :key="proof.id">
                <a :href="proof.address">{{ proof.address }}</a>
                <p>Size: {{ proof.size }} bytes; submitted: {{ new Date(proof.submittedAt).toLocaleString() }}; status: {{ proof.status }}</p>
                <p v-if="proof.rejectionReason">Rejection reason: {{ proof.rejectionReason }}</p>
                <template v-if="proof.status === 'PENDING' && selected.upstreamOwnerWebId === actorWebId()">
                  <button type="button" @click="reviewTaskProof(proof.id, true)">Approve</button>
                  <label :for="`reason-${proof.id}`">Rejection reason</label>
                  <input :id="`reason-${proof.id}`" v-model="rejectionReasons[proof.id]" />
                  <button type="button" @click="reviewTaskProof(proof.id, false)">Reject</button>
                </template>
              </li>
            </ol>
          </section>

          <section v-if="workspace.incomingProofs.length">
            <h2>Proofs awaiting your review</h2>
            <article v-for="submission in workspace.incomingProofs" :key="submission.id">
              <h3>{{ submission.taskName }}</h3>
              <a :href="submission.proof.address">{{ submission.proof.address }}</a>
              <p>Size: {{ submission.proof.size }} bytes</p>
              <button type="button" @click="reviewIncomingProof(submission, true)">Approve</button>
              <label :for="`incoming-reason-${submission.proof.id}`">Rejection reason</label>
              <input :id="`incoming-reason-${submission.proof.id}`" v-model="rejectionReasons[submission.proof.id]" />
              <button type="button" @click="reviewIncomingProof(submission, false)">Reject</button>
            </article>
          </section>

          <section v-if="workspace.outbox.some((operation) => operation.status === 'FAILED')">
            <h2>Failed remote operations</h2>
            <ul>
              <li v-for="operation in workspace.outbox.filter((candidate) => candidate.status === 'FAILED')" :key="operation.id">
                {{ operation.kind }}: {{ operation.error }}
                <button type="button" @click="retryOperation(operation.id)">Retry</button>
              </li>
            </ul>
          </section>
        </section>

        <section v-else class="welcome">
          <h1>Your responsibilities, clearly connected.</h1>
          <p>Select a project or create one to begin dividing the work.</p>
          <button type="button" @click="dialog = true">Create project</button>
        </section>
      </main>
    </template>

    <section v-if="dialog" class="dialog" role="dialog" aria-modal="true" aria-label="Create a project" @keydown.esc="dialog = false">
      <h2 class="dialog-title">Create a project</h2>
      <form id="create-project-form" @submit.prevent="addTask">
        <label for="project-name">Project name</label>
        <input id="project-name" v-model="form.name" type="text" required autofocus />
        <label for="project-description">Description</label>
        <textarea id="project-description" v-model="form.description" rows="3" />
        <label for="project-deadline">Deadline</label>
        <input id="project-deadline" v-model="form.deadline" type="date" />
        <div class="dialog-actions">
          <button type="button" @click="dialog = false">Cancel</button>
          <button type="submit">Create project</button>
        </div>
      </form>
    </section>

    <section v-if="partDialog" class="dialog" role="dialog" aria-modal="true" aria-label="Add task part" @keydown.esc="partDialog = false">
      <h2>Add task part</h2>
      <form @submit.prevent="addPart">
        <label for="part-name">Name</label>
        <input id="part-name" v-model="partForm.name" required autofocus />
        <label for="part-description">Description</label>
        <textarea id="part-description" v-model="partForm.description" rows="3" />
        <label for="part-detail">Task-detail file</label>
        <input id="part-detail" type="file" @change="selectPartDetail" />
        <button type="button" @click="partDialog = false">Cancel</button>
        <button type="submit">Add task part</button>
      </form>
    </section>

    <section v-if="childDialog" class="dialog" role="dialog" aria-modal="true" aria-label="Add child task list" @keydown.esc="childDialog = false">
      <h2>Add child task list</h2>
      <form @submit.prevent="addChild">
        <label for="child-name">Name</label>
        <input id="child-name" v-model="childForm.name" required autofocus />
        <label for="child-description">Description</label>
        <textarea id="child-description" v-model="childForm.description" rows="3" />
        <label for="child-deadline">Deadline</label>
        <input id="child-deadline" v-model="childForm.deadline" type="date" />
        <button type="button" @click="childDialog = false">Cancel</button>
        <button type="submit">Add child task list</button>
      </form>
    </section>

    <section v-if="editDialog" class="dialog" role="dialog" aria-modal="true" aria-label="Edit task list" @keydown.esc="editDialog = false">
      <h2>Edit task list</h2>
      <form @submit.prevent="editTask">
        <label for="edit-name">Name</label>
        <input id="edit-name" v-model="editForm.name" required autofocus />
        <label for="edit-description">Description</label>
        <textarea id="edit-description" v-model="editForm.description" rows="3" />
        <label for="edit-deadline">Deadline</label>
        <input id="edit-deadline" v-model="editForm.deadline" type="date" />
        <button type="button" @click="editDialog = false">Cancel</button>
        <button type="submit">Save changes</button>
      </form>
    </section>

    <section v-if="proposalDialog" class="dialog" role="dialog" aria-modal="true" aria-label="Propose delegation" @keydown.esc="proposalDialog = false">
      <h2>Propose delegation</h2>
      <form @submit.prevent="proposePart">
        <label for="proposal-recipient">Recipient WebID</label>
        <input id="proposal-recipient" v-model="proposalForm.toWebId" type="url" required autofocus />
        <button type="button" @click="proposalDialog = false">Cancel</button>
        <button type="submit">Create proposal</button>
      </form>
    </section>

    <section v-if="proofDialog" class="dialog" role="dialog" aria-modal="true" aria-label="Submit proof" @keydown.esc="proofDialog = false">
      <h2>Submit proof</h2>
      <form @submit.prevent="submitTaskProof">
        <label for="proof-address">Evidence address</label>
        <input id="proof-address" v-model="proofForm.address" type="url" required autofocus />
        <label for="proof-size">Evidence size in bytes</label>
        <input id="proof-size" v-model.number="proofForm.size" type="number" min="0" required />
        <button type="button" @click="proofDialog = false">Cancel</button>
        <button type="submit">Submit for verification</button>
      </form>
    </section>
  </div>
</template>
