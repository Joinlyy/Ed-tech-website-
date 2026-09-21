# Deployment

## Targets

| Workspace | Target (current plan) | Artifact |
|---|---|---|
| `apps/web` | Netlify / Cloudflare Pages / any static host | `apps/web/dist/` — plain static bundle |
| `apps/backend` | Fly.io / Render / any container host | `apps/backend/build/libs/redpen-backend-<version>.jar` (executable fat JAR) |
| Database (prod) | Managed PostgreSQL 16 (Neon, Supabase, RDS, or self-hosted) | — |

## Environment variables

### `apps/web` — build-time only, all `VITE_*` are inlined into the client bundle

| Name | Required | Example | Purpose |
|---|:-:|---|---|
| `VITE_API_BASE_URL` | ✓ | `https://api.redpen.example.com/api` | Where the SPA sends its XHRs |
| `VITE_SITE_URL` | ✓ | `https://redpen.example.com` | Canonical URL / OG tags |

### `apps/backend` — runtime, all server-only

| Name | Required | Example | Purpose |
|---|:-:|---|---|
| `SPRING_PROFILES_ACTIVE` | prod=`prod`, dev=`dev` | `prod` | Selects `application-<profile>.yml` |
| `SPRING_DATASOURCE_URL` | ✓ (prod) | `jdbc:postgresql://db:5432/redpen` | Postgres JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | ✓ (prod) | `redpen` | DB user |
| `SPRING_DATASOURCE_PASSWORD` | ✓ (prod) | *secret* | DB password |
| `REDPEN_SECURITY_JWT_SECRET` | ✓ | *32+ byte random string* | HS256 signing key. Rotate quarterly. |
| `REDPEN_SECURITY_JWT_TTL_HOURS` | — | `24` | Session lifetime |
| `REDPEN_CORS_ALLOWED_ORIGINS` | ✓ | `https://redpen.example.com` | Comma-separated list |
| `SERVER_PORT` | — | `8080` | Listener port |

Never commit secrets. Use your host's secret manager (Fly secrets, Render env, AWS SSM).

## CI outline

Suggested pipeline (single workflow per PR, both workspaces):

1. `npm ci` (root — hydrates both workspaces via workspaces).
2. **Web checks** in parallel: `npm run lint`, `npm run typecheck`, `npm run build:web`.
3. **Backend checks** in parallel: `npm run test:backend`, `npm run build:backend`.
4. On merge to `main`, publish the web `dist/` to the static host and the backend JAR
   to the container registry.
5. On tag `v*`, cut a release: run migrations first (`flyway migrate`), then roll the
   backend, then invalidate the CDN for the web build.

Zero-downtime rollouts require running new backend + old web (or vice versa) briefly.
Because DTOs are versioned by hand today, additive changes only in a single release;
breaking changes need two releases (add the new field, migrate readers, drop the old).
