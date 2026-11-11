# Changelog

## [Unreleased]

### Added

- Durable idempotent outbox operations with visible retry for cross-Pod messages.
- Cancellation, rejection, direct proof, and review synchronization messages.
- Workspace schema v3 metadata for processed notifications and incoming proof review.
- ESLint 9 flat configuration and browser document metadata.
- Inrupt browser authentication 5.0.3 and patched development tooling dependencies.

### Fixed

- Prevent duplicate and self-delegation proposals, completion with active proposals, and self-review chains.
- Prevent proof submission with unfinished work, duplicate pending proofs, and `DONE` to `PENDING_VERIFICATION` regression.
- Return rejected delegated work to `IN_PROGRESS` and lock terminal task states against mutation.
- Isolate identity consent per proposal and validate untrusted inbox payloads before use.
- Revoke delegated file access on cancellation and roll it back when proposal persistence fails.
- Remove known production and development dependency advisories reported by `npm audit`.

## [0.1.0] - 2026-11-05

### Added
- Vue application foundation with Solid OIDC sign-in.
- Direct Pod workspace persistence and browser-only demo mode.
- Project hierarchy navigation, project creation, and proof workflow domain rules.
- Cross-Pod Received Proposals and acceptance reconciliation through Solid LDN inboxes.
- Separate RDF resources for Task-Lists, Task-Parts, proposals, consents, proofs, and review decisions, with SHACL shapes and legacy JSON migration.
- Owner-hosted Task-Detail file uploads with read-only delegate access and propagation into accepted Task-Lists.
