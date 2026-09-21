# Monorepo Architecture

## Why a monorepo

The web client and the backend evolve as a pair: a new API changes both the Java DTO and
the TypeScript type on the same day. A single repo makes that PR atomic, keeps the doc-sync
rules in `AGENTS.md` enforceable in code review, and lets us run one CI pipeline instead of
two out-of-sync ones.

We chose npm workspaces (not pnpm, not Turborepo) because the only cross-workspace concern
is script dispatch — no shared JS packages need hoisting, no build graph needs orchestration
beyond what npm's `--workspace=` flag already gives us.

## Workspace boundaries

| Workspace | Language | Role |
|---|---|---|
| `apps/web` | TypeScript / React | Everything the user's browser talks to. Marketing, auth, portals. |
| `apps/backend` | Java 21 / Spring Boot | Everything with a database or a secret. REST API, marking pipeline, jobs. |

**No shared code between workspaces.** The API contract is shared *by convention*:
`apps/web/src/types/index.ts` mirrors the DTOs in `apps/backend/src/main/java/com/redpen/dto/`.
This is enforced by review and by the doc-sync rule in `AGENTS.md`, not by tooling. If the
two ever drift far enough to hurt, we introduce an OpenAPI generator — not before.

## Dependency rules

- The web workspace **never** imports from `apps/backend/`. It only ever talks HTTP.
- The backend workspace has no knowledge that a web client exists. It exposes REST and
  serves nothing else.
- Docs live in `/docs` at the repo root. Neither workspace owns them; both must update them.

## Build & run flow

- `npm install` at the root installs both workspaces via workspaces.
- Root scripts route to workspaces via `npm --workspace=<name> run <script>`.
- Backend's `package.json` is a thin wrapper — its scripts shell out to `gradlew` via
  a tiny cross-platform Node dispatcher (`apps/backend/scripts/gradle.js`) so the root
  monorepo can call it uniformly with `npm run test:backend` on any OS.

## What lives outside code

- `docker-compose.yml` for local Postgres lives in `apps/backend/` — it belongs to the
  workspace that needs it.
- Deployment manifests (Dockerfiles, Fly / Render / Netlify configs) will live under each
  workspace when they exist. Cross-cutting CI config, when added, lives at the root.
