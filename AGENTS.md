# AGENTS.md — RedPen Monorepo Working Rules

These rules apply to every AI agent AND every human engineer touching this repo.
Read this file before you touch anything. Then read `/docs`.

---

## 1. Golden Rules

### Rule 1 — Always read `/docs` before starting a task
Before any code change, skim the relevant docs so you don't build against a stale
mental model. At minimum:
- `docs/product/` — what we're building and for whom
- `docs/flows/` — how each user role moves through the product
- `docs/features/` — what already exists vs. what is planned
- `docs/architecture/` — monorepo layout, API contract, deployment

### Rule 2 — Mandatory documentation synchronization
Code and docs move together. **Never leave them out of sync.**

| Change type | Docs you MUST also update |
|---|---|
| User-flow change | `docs/flows/*.md` |
| API endpoint change | `apps/web/src/types/index.ts` **and** `docs/architecture/api-spec.md` |
| Entity / model change | `apps/web/src/types/index.ts` **and** `docs/architecture/api-spec.md` |
| New feature shipped | `docs/features/feature-matrix.md` **and** `docs/changelog/CHANGELOG.md` |
| New env var / deploy target | `docs/architecture/deployment.md` |

A PR that touches the API but leaves `api-spec.md` untouched is considered incomplete.

### Rule 3 — Always validate before completing
Never say "done" without running the appropriate check.

| Scope of change | Command |
|---|---|
| Backend change | `npm run test:backend` |
| Web change | `npm run typecheck` (and `npm run build:web` for major changes) |
| Global / cross-cutting | `npm run typecheck` and `npm run test:backend` |

CI runs the same commands — passing locally first is the point.

### Rule 4 — Secret handling & auth (non-negotiable)

- **Never** commit real secrets. `.env` is git-ignored at every depth. Real values
  come only from environment variables — `application.yml` must only contain `${…}`
  references.
- **Never** paste a live secret into chat, a PR, an issue, or a screenshot. If one
  slips out, rotate it in the provider console (Aiven / Razorpay / Google Cloud /
  cloud host) before doing anything else.
- **Never** email a password. Not a random one, not a "temporary" one, not a
  parent-plus-date one. Passwords are set by their owner (or, for RedPen students,
  by their parent in the portal) and shared out-of-band.
- **Never** issue a predictable password. Anything derived from a name, a date, or
  an order id is a security bug — flag it, propose the safe alternative, wait for
  a decision.
- JWT signing key must be ≥ 32 UTF-8 bytes. `JwtService` refuses to start if it
  isn't. Rotate quarterly.
- Auth errors do not leak account existence. A wrong password and an unknown email
  return the same `INVALID_CREDENTIALS`. A parent using the wrong path (password
  login on a Google-only account) gets the same error, not "this is a Google
  account" — otherwise we'd help an attacker enumerate account types.
- Payment confirmation is **idempotent**. Webhooks retry. A duplicate confirm on a
  PAID order returns the existing state; it must never charge or grant access
  twice.
- Money is stored in the smallest currency unit (paise for INR). Never floats.

### Rule 5 — System optimization
- Prefer concise, modular code. Delete before you add.
- **Backend:** strong Java types. No raw `Object`, no `Map<String, Object>` DTOs, no reflection tricks unless a framework demands it.
- **Web:** strict TypeScript. No `any` as a shortcut. No `@ts-ignore` without a comment explaining why.
- Do not add a dependency you can implement in ≤ 30 lines.
- Do not add boilerplate for hypothetical future features.

---

## 2. Project Structure & Scopes

- `apps/web` — React 18 + Vite + Tailwind. Marketing site, auth screens, client/staff/admin portals.
- `apps/backend` — Java 21 + Spring Boot 3.3 + Gradle. REST API, PostgreSQL 16 in prod, H2 in dev.
- `docs/` — the single source of truth for product, flows, features, architecture, changelog.

---

## 3. Sub-Project Guides

Each workspace has its own AGENT file with folder conventions specific to that stack:

- Web rules → [`apps/web/AGENT.md`](apps/web/AGENT.md)
- Backend rules → [`apps/backend/AGENT.md`](apps/backend/AGENT.md)

If a sub-project rule contradicts this file, this file wins — open a PR to reconcile.

---

## 4. Design & Brand Consistency

**Brand name (strict):** `RedPen` — one word, capital R, capital P. Never "Red Pen",
never "redpen", never "Red-Pen". In legal footers: *"RedPen. Not affiliated with CBSE
or any examination board."*

**Color palette (canonical hex values):**

| Token | Hex | Use |
|---|---|---|
| `background` / `paper` | `#F7FAFF` | Page background |
| `paper-warm` | `#FFFFFF` | Card / surface background |
| `ink` | `#16233F` | Headings, primary text |
| `ink-soft` | `#5B6780` | Body copy |
| `ink-faint` | `#93A0B8` | Captions, rules, disabled |
| `accent` / `blue` | `#2C5FF6` | Primary actions, links |
| `blue-deep` | `#1B40B8` | Button shadows, hover |
| `blue-wash` | `#E8EFFE` | Section tints |
| `pen` (danger) | `#D93A2B` | Examiner marks, destructive |
| `pen-soft` | `#FBE7E4` | Danger backgrounds |
| `success` / `green` | `#1F9D63` | Correct marks, success states |
| `mark` | `#FFE59B` | Highlighter |

**Typography:**

| Role | Family | Fallback |
|---|---|---|
| Display (H1–H4) | Bricolage Grotesque | `system-ui, sans-serif` |
| Body | Instrument Sans | `system-ui, sans-serif` |
| Handwriting / examiner | Caveat | `cursive` |
| Mono / numbers | IBM Plex Mono | `ui-monospace, monospace` |

Any new UI must use these tokens. If you need a colour that isn't listed, propose it
in a PR — don't sprinkle new hex values into components.
