# Implementation Plan: Complete OTAku SRS

## Overview

Complete the confirmed MVP requirements in `../Software Requirements Specification.md` while preserving decentralized Solid Pod ownership. Work proceeds as test-driven vertical slices, with RDF resources and LDN notifications used for cross-Pod state. Live-provider acceptance tests remain a documented manual gate because they require external accounts.

## Architecture Decisions

- Task data remains exclusively in participant Pods; no application-owned database is introduced.
- Cross-Pod commands and acknowledgements use typed LDN messages with durable local operation records for retry and reconciliation.
- Consent withdrawal is future-only: prior audit records remain, future identity/status disclosure stops, and new downstream delegation is blocked until consent is renewed.
- Returning accepted work is a request that the direct delegator approves or declines. A return request is blocked while active delegated descendants exist. Approval cancels the delegated Task-List link and makes the original Task-Part available for reassignment.
- Proposal expiry is selected by the proposer and evaluated when workspaces/inboxes are loaded or refreshed.
- Deletion is owner-only and blocked for resources with accepted delegated descendants; historical proposal, consent, proof, and review records remain.
- Access is private by default. Only proposal participants, direct proof submitter/reviewer, and specifically consented upstream identity recipients receive the minimum resource access required.

## Task List

### Phase 1: State model and task lifecycle

- [ ] Task 1: Formalize status transitions, proposal expiry, and editable Task-Parts.
- [ ] Task 2: Add safe Task-Part and Task-List deletion with delegated-descendant guards.
- [ ] Task 3: Implement return requests and delegator approval/decline.

### Checkpoint: Lifecycle

- [ ] Focused workflow tests pass.
- [ ] Full tests and production build pass.

### Phase 2: Privacy and collaboration

- [ ] Task 4: Implement colleagues and task-specific status updates as RDF resources.
- [ ] Task 5: Implement consent withdrawal/renewal and contributor visibility.
- [ ] Task 6: Apply least-privilege ACL/ACP sharing to proposals, status, proof, review, and identity records.

### Checkpoint: Privacy

- [ ] Unauthorized actors are rejected by domain rules and resource-sharing tests.
- [ ] Full tests and production build pass.

### Phase 3: Reliability and cross-Pod consistency

- [ ] Task 7: Add durable outbox operations, idempotent LDN messages, retry, and reconciliation.
- [ ] Task 8: Complete proof/status synchronization between direct upstream and delegate Pods.

### Checkpoint: Reliability

- [ ] Simulated transient failures recover without duplicate state transitions.
- [ ] Full tests and production build pass.

### Phase 4: UI, migration, and acceptance

- [ ] Task 9: Expose all completed workflows in accessible bare HTML UI.
- [ ] Task 10: Expand RDF migration/round-trip tests and SHACL shapes for every resource type.
- [ ] Task 11: Add automated reference-scenario coverage and a two-provider manual test guide.
- [ ] Task 12: Update progress, data-model, README, and changelog documentation.

### Checkpoint: Complete

- [ ] `npm test`, `npm run lint`, and `npm run build` pass.
- [ ] Every confirmed SRS requirement is implemented or explicitly marked as requiring external-account verification.
- [ ] Alice/Bob/Eve reference scenario is automated below the external Solid boundary.
- [ ] Manual AT-1 through AT-8 instructions and evidence checklist are complete.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| WAC/ACP behavior differs by provider | High | Use Inrupt universal access, isolate grants, report unsupported access clearly, and provide two-provider test matrix. |
| Multi-resource writes fail halfway | High | Durable idempotent operations, retry UI, and inbox reconciliation. |
| Previously disclosed identity cannot be erased | Medium | Future-only withdrawal with immutable historical consent/withdrawal records. |
| Remote descendants become unreachable | High | Block destructive transitions unless known descendants are settled; preserve retryable operations. |
| Current `App.vue` is orchestration-heavy | Medium | Extract only cohesive services/components required by each slice; avoid broad redesign. |

## External Verification Constraint

AT-1, AT-3, and provider-level ACL portions of AT-8 cannot be truthfully completed without authenticated accounts on at least two independent Solid servers. The repository will include repeatable instructions and automated boundary tests, but final interoperability sign-off requires those credentials.
