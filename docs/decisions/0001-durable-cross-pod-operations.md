# ADR-0001: Durable idempotent cross-Pod operations

## Status

Accepted

## Date

2026-11-10

## Context

Delegation originally saved local state and then posted an LDN notification. A transient failure could therefore leave the sender and recipient with different states. Retrying created a new random proposal, acceptance, task, or proof and duplicated the effect.

Solid does not provide one transaction spanning two Pods. OTAku must therefore make every remote effect replay-safe and retain enough local state to retry it.

## Decision

- Every outbound effect has a deterministic operation ID derived from its domain entity, such as `proposal:<proposal-id>` or `proof:<proof-id>`.
- Operations are persisted in the workspace outbox before delivery and retain `PENDING`, `FAILED`, or `SUCCEEDED` state, attempt count, and the last error.
- Reload retries unfinished operations; the UI exposes failed operations with an explicit Retry action.
- Inbox notifications are deduplicated by message kind and entity ID. Processed non-proposal notifications are recorded so replay is a no-op.
- Accepted delegated Task-Lists use `delegated-<proposal-id>` as their stable identity.
- Cancellation, rejection, proof submission, and proof review are explicit messages rather than local-only state changes.

## Consequences

- A network retry can repeat delivery without creating a second local task or proof effect.
- Users can see and retry remote failures instead of receiving a false success state.
- Workspace schema version 3 persists outbox, processed notification IDs, incoming proofs, and source-proposal links.
- Inbox resources remain immutable audit records; deduplication, rather than deletion, prevents replay.
- Authenticating the author of arbitrary LDN JSON still depends on provider-level authenticated inbox provenance or a future signed-envelope profile. Field validation and authorization checks prevent malformed or mismatched messages from changing state, but they are not cryptographic signatures.

## Alternatives considered

### Delete every inbox message after processing

Rejected because deletion support and authorization differ by Solid provider, and deleting messages removes useful audit evidence.

### Treat HTTP delivery as exactly once

Rejected because HTTP and cross-Pod writes can fail after either side has committed. Exactly-once delivery cannot be guaranteed; idempotent effects are required.

### Central coordination database

Rejected because it would violate OTAku's requirement that task data remain in participant Pods.
