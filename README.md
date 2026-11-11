# OTAku

## Overengineered To-do Appku: Sistem Manajeman dan Pembagian Tugas secara Hierarkis

### Members

- Muhammad Dzaky Ar-Rasyid
- Pratama Nanindra Aji (24/533677/PA/22604)

---

### Tech Stack:

- Frontend: Vue, Vuetify, Tailwindcss, Typescript
- Backend: Go
- Database: SOLID

### Project Structure:

```
root/
|- clients/
|  |- web
|- services/
   |- microservice_1
   |- microservice_2
|- tests/
|- openapi.yaml
|- CHANGELOG.md
```

---

### Run locally

```bash
npm install
npm run dev
```

Sign in with a Solid identity provider, or choose **Explore demo mode**. Production mode reads and writes `private/otaku/workspace.json` directly in the signed-in user's Pod. Demo mode stores isolated sample data in the current browser only.

Quality checks:

```bash
npm test
npm run build
npm run lint
```

### Reliability model

Cross-Pod changes use persisted, idempotent outbox operations. Failed deliveries remain visible in the workspace and can be retried without creating duplicate delegated tasks or proof effects. See [ADR-0001](docs/decisions/0001-durable-cross-pod-operations.md) and the [audit remediation record](docs/audit-remediation.md).
