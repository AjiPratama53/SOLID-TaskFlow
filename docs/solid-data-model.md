# OTAku Solid data model

OTAku uses the documented RDF namespace `urn:otaku:vocab:` (`otaku:`). Each user owns the resources beneath `/private/otaku/` in their Pod.

## Resource layout

```text
/private/otaku/
├── index.ttl                         Workspace index
├── task-lists/{id}.ttl               One resource per Task-List
├── task-parts/{id}.ttl               One resource per Task-Part
├── proposals/{id}.ttl                One resource per proposal
├── consents/{proposal-id}.ttl        One resource per identity consent
├── proofs/{id}.ttl                   One resource per proof submission
├── reviews/{proof-id}.ttl            One resource per review decision
├── details/{part-id}/{filename}      Owner-controlled instruction file
└── shapes/otaku-shapes.ttl           SHACL validation shapes
```

`index.ttl` links only to the user's top-level Task-Lists and proposal records. Task-List resources link recursively to child Task-Lists, Task-Parts, and proof submissions. Objects are not embedded in the index.

## Classes

| Class | Purpose |
| --- | --- |
| `otaku:Workspace` | Entry point for one user's OTAku data. |
| `otaku:TaskList` | A unit of responsibility with one `otaku:owner`. |
| `otaku:TaskPart` | Work subdivision belonging to a Task-List. |
| `otaku:Proposal` | Delegation request from proposer to recipient. |
| `otaku:IdentityConsent` | Timestamped identity-disclosure consent and its recipients. |
| `otaku:ProofSubmission` | Submitted evidence URI, size, date, and status. |
| `otaku:ReviewDecision` | Approval or rejection, including the rejection reason. |

## Task-detail file

The Task-Part owner uploads the instruction file beneath `details/{part-id}/`. The Task-Part references it through `otaku:detailFile` and records its original name, media type, and byte size. A proposal carries the same reference. Before delivery, OTAku grants the intended recipient read-only access to that file. Acceptance carries the reference into the recipient-owned delegated Task-List; ownership of the file does not move.

## Cross-Pod links

- `otaku:delegatedTask` links the original Task-Part to the accepted Task-List in the recipient's Pod.
- `otaku:acceptedTask` records the same URI on the proposal.
- `otaku:directUpstreamOwner` identifies the direct verifier.
- `otaku:upstreamOwner` lists identities disclosed through consent.

## Legacy migration

If `index.ttl` does not exist, OTAku reads the old `/private/otaku/workspace.json`. The next successful save writes the separate RDF resources and `index.ttl`. The legacy JSON file is not deleted automatically.
