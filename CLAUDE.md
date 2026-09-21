# CLAUDE.md — Command Cheatsheet

Quick reference for anyone (human or AI) driving this repo from the terminal.
For the full rules, see [`AGENTS.md`](AGENTS.md).

## Development

```bash
# web only
npm run dev                 # alias of dev:web
npm run dev:web             # Vite dev server on :5173

# backend on PostgreSQL (needs Docker Postgres running, or Aiven via env vars)
docker-compose -f apps/backend/docker-compose.yml up -d
npm run dev:backend         # Spring Boot on :8080 (default profile → PostgreSQL)

# backend on in-memory H2 (zero setup, great for AI iterations)
npm run dev:backend:h2      # Spring Boot on :8080 (dev profile → H2)
```

### Run BOTH web + backend together (2 terminals)

```bash
# terminal 1 — backend on H2 (no Docker needed)
npm run dev:backend:h2

# terminal 2 — Vite web on :5173
npm run dev:web
```

Web expects the API at `http://localhost:8080/api` (override via
`VITE_API_BASE_URL` in `apps/web/.env`).

### One-shot: run both in parallel from one terminal

```bash
# Unix / macOS / Git Bash
npm run dev:backend:h2 & npm run dev:web

# Windows PowerShell (start each in its own window)
Start-Process powershell -ArgumentList "npm run dev:backend:h2"
Start-Process powershell -ArgumentList "npm run dev:web"
```

## Testing & Validation

```bash
npm run test:backend        # gradle test — JUnit 5, Spring Boot slice tests
npm run typecheck           # tsc --noEmit on apps/web
npm run lint                # eslint on apps/web
```

## Production Builds

```bash
npm run build:web           # vite build → apps/web/dist
npm run build:backend       # gradle build → apps/backend/build/libs/*.jar
```

## Workspace Map

- `apps/web` — React 18 + Vite + Tailwind (marketing, auth, portals).
- `apps/backend` — Java 21 + Spring Boot 3.3 + Gradle (REST API, Postgres/H2, Flyway).

## Development Rules (condensed — see AGENTS.md for the full text)

1. **Read `/docs` first.** Product, flows, features, architecture. No exceptions.
2. **Sync docs with code in the same PR.** API change → `apps/web/src/types/index.ts`
   + `docs/architecture/api-spec.md`. New feature → `feature-matrix.md` + `CHANGELOG.md`.
3. **Validate before you claim done.** Backend → `test:backend`. Web → `typecheck`.
   Cross-cutting → both. Never mark work complete without a green run.
