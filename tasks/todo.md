# OTAku SRS Completion Tasks

## Task 1: Formal lifecycle and expiry

**Acceptance criteria:**
- [ ] Task-Part editing and every implemented status transition are owner/actor validated.
- [ ] Proposals accept an owner-selected expiry and become `EXPIRED` after it passes.
- [ ] Expired proposals cannot be accepted, rejected, or cancelled as pending.

**Verification:** Focused workflow tests; full `npm test`; `npm run build`.

**Dependencies:** None  
**Likely files:** `src/domain/models.ts`, `src/domain/workflow.ts`, `src/domain/workflow.test.ts`, `src/App.vue`  
**Scope:** Medium

## Task 2: Guarded deletion

**Acceptance criteria:**
- [ ] Owners can delete local Task-Parts and child Task-Lists.
- [ ] Deletion is blocked when accepted delegated descendants or active proposals exist.
- [ ] Non-owners cannot delete resources.

**Verification:** Focused workflow tests; full `npm test`; build.

**Dependencies:** Task 1  
**Likely files:** `src/domain/workflow.ts`, `src/domain/workflow.test.ts`, `src/App.vue`  
**Scope:** Medium

## Task 3: Return request workflow

**Acceptance criteria:**
- [ ] Delegate can request return only from an accepted assignment without active delegated descendants.
- [ ] Direct delegator can approve or decline; no other actor can decide.
- [ ] Approval frees the original Task-Part for reassignment and preserves history across Pods.

**Verification:** Domain and transport tests; simulated Alice/Bob flow; build.

**Dependencies:** Tasks 1-2  
**Likely files:** models, workflow, proposal transport, repository, `App.vue`  
**Scope:** Medium

## Checkpoint: Lifecycle

- [ ] All tests pass.
- [ ] Production build passes.

## Task 4: Colleagues and updates

**Acceptance criteria:**
- [ ] Users can add/remove colleagues by valid HTTPS WebID.
- [ ] Authorized participants can post/read task-specific, non-chat status updates.
- [ ] Colleagues alone gain no task-resource access.

**Verification:** Domain/repository/component tests; build.

**Dependencies:** Task 1  
**Likely files:** models, repository, new collaboration module/tests, `App.vue`  
**Scope:** Medium

## Task 5: Consent withdrawal and contributors

**Acceptance criteria:**
- [ ] Contributor can withdraw and renew consent with timestamped records.
- [ ] Withdrawal blocks future identity/status disclosure and downstream delegation without deleting history.
- [ ] Root owner can list consented contributors; a delegate sees upstream identities and peers authorized for the same Task-List only.

**Verification:** Workflow/repository/component tests; build.

**Dependencies:** Tasks 3-4  
**Likely files:** models, workflow, repository, transport, `App.vue`  
**Scope:** Medium

## Task 6: Least-privilege resource access

**Acceptance criteria:**
- [ ] Proposal resources are shared only with proposer and recipient.
- [ ] Proof/review/status resources are shared only with owner and direct verifier as required.
- [ ] Failed or unsupported grants produce actionable errors and do not claim successful delivery.

**Verification:** Access-policy unit tests with mocked Solid boundary; manual provider checklist; build.

**Dependencies:** Tasks 3-5  
**Likely files:** repository, new access service/tests, transport  
**Scope:** Medium

## Checkpoint: Privacy

- [ ] Authorization tests pass.
- [ ] All tests and build pass.

## Task 7: Durable retry and reconciliation

**Acceptance criteria:**
- [ ] Cross-Pod operations have stable IDs and persisted pending/succeeded/failed state.
- [ ] Retrying is idempotent and does not duplicate acceptance, return, or review effects.
- [ ] UI exposes pending failures and a retry action.

**Verification:** Failure-injection tests; full suite; build.

**Dependencies:** Tasks 3 and 6  
**Likely files:** models, repository, transport, new operation service/tests, `App.vue`  
**Scope:** Medium

## Task 8: Direct proof synchronization

**Acceptance criteria:**
- [ ] Delegate shares only selected proof with direct upstream owner.
- [ ] Approval/rejection synchronizes both Pods and updates the original Task-Part.
- [ ] Lower-level proofs are never automatically exposed higher in the hierarchy.

**Verification:** Alice/Bob/Eve transport tests with failure recovery; build.

**Dependencies:** Task 7  
**Likely files:** models, workflow, repository, transport, `App.vue`  
**Scope:** Medium

## Checkpoint: Reliability

- [ ] Failure recovery tests pass.
- [ ] All tests and build pass.

## Task 9: Complete bare HTML interface

**Acceptance criteria:**
- [ ] Every implemented workflow is operable by keyboard through labeled semantic controls.
- [ ] Authorized hierarchy, contributors, updates, pending operations, return, expiry, and deletion states are visible.
- [ ] Errors identify unreachable versus unauthorized Pod operations.

**Verification:** Component tests; browser smoke test if DevTools MCP is available; lint/build.

**Dependencies:** Tasks 1-8  
**Likely files:** `src/App.vue`, component tests, optional focused components  
**Scope:** Medium

## Task 10: RDF completeness and migration

**Acceptance criteria:**
- [ ] Every resource type round-trips through RDF tests.
- [ ] SHACL shapes cover all mandatory fields and links.
- [ ] Legacy JSON migrates without deletion or data loss.

**Verification:** Repository integration tests; full suite; build.

**Dependencies:** Tasks 1-8  
**Likely files:** repository, repository tests, Solid data-model docs  
**Scope:** Medium

## Task 11: Acceptance scenario and provider guide

**Acceptance criteria:**
- [ ] Automated Alice/Bob/Eve scenario covers delegation, consent, rejection/resubmission, return, contributor visibility, and approval.
- [ ] Manual guide covers AT-1 through AT-8 on two providers and records evidence.
- [ ] External-account-only checks are clearly distinguished from automated checks.

**Verification:** Full suite; execute guide when credentials are available.

**Dependencies:** Tasks 1-10  
**Likely files:** acceptance tests, `docs/solid-interoperability-test.md`  
**Scope:** Medium

## Task 12: Final documentation

**Acceptance criteria:**
- [ ] Progress matrix accurately maps every SRS requirement to evidence or external verification.
- [ ] Data model, README, and changelog match implementation.
- [ ] No unsupported completion claims remain.

**Verification:** Link/file review; test/lint/build results recorded.

**Dependencies:** Tasks 1-11  
**Likely files:** progress document, README, changelog, docs  
**Scope:** Small

## Checkpoint: Complete

- [ ] `npm test` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] SRS traceability review is complete.
