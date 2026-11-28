# Runtime and domain audit remediation

Date: 2026-11-10

## Scope

This remediation follows the Chrome DevTools and domain-invariant audit. OTAku intentionally keeps a bare semantic HTML interface; no visual design system was added.

## Correctness changes

- A Task-Part can have only one active proposal, cannot be delegated to its current owner, and cannot be completed while a proposal is active.
- Completed, cancelled, expired, and pending-verification Task-Lists cannot be edited or subdivided.
- Proof submission requires every local part and child Task-List to be done, permits only one pending proof, and cannot reopen a completed task.
- Rejected work returns to `IN_PROGRESS`.
- Acceptance creates a deterministic delegated Task-List and is safe to replay.
- Per-proposal consent state replaces the previous shared checkbox state.

## Cross-Pod reliability

- Durable outbox records proposal, acceptance, response, proof, and review delivery.
- Cancellation and rejection now notify the other participant.
- Direct proof and review messages synchronize the delegate and direct upstream owner.
- Inbox payloads are structurally validated and deduplicated before use.
- Processed notification IDs prevent repeated effects after reload.
- Failed operations remain visible and retryable.
- Browser Web Locks serialize writes from same-origin tabs. Cross-device conflicts remain subject to Solid provider conditional-write capabilities.

## Privacy and input hardening

- Task-detail access is revoked when a proposal is cancelled.
- Access granted before a failed local persist is rolled back on a best-effort basis.
- Acceptance and review messages are matched to known proposal participants before state changes.
- Corrupt demo and operation metadata produce explicit errors.

## Document and tooling fixes

- Added doctype, charset, language, viewport, title, description, and inline favicon metadata without styling the UI.
- Added valid `robots.txt` and `llms.txt` resources.
- Added ESLint flat configuration compatible with ESLint 9.
- Upgraded `@inrupt/solid-client-authn-browser` from 3.1.x to 5.0.3, replacing the vulnerable legacy OIDC client and `serialize-javascript` chain with `oidc-client-ts`.
- Upgraded Vitest to 5.1.0 and constrained vulnerable transitive glob matching packages to patched releases. Both production-only and full dependency audits now report zero known vulnerabilities.

## Verification

- `npm test` covers domain guards, stable identities, outbox replay, boundary validation, and workspace migration.
- `npm run lint` validates TypeScript and Vue source.
- `npm run build` performs Vue TypeScript checking and a production Vite build.
- `npm audit` and `npm audit --omit=dev` validate the complete and production dependency graphs.
- Chrome DevTools smoke testing verifies the demo workflow, metadata, console, network, and accessibility tree.

## Remaining provider-level constraint

OTAku validates message shape, recipient, proposal ID, and expected participant before applying a notification. It cannot cryptographically prove that an arbitrary LDN JSON document was authored by its claimed `fromWebId`. Production deployments should require provider-authenticated inbox provenance or adopt a signed Linked Data envelope profile when interoperable provider support is selected.
