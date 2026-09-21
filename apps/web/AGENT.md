# AGENT.md — apps/web

Root rules apply first: see [`../../AGENTS.md`](../../AGENTS.md).
This file only lists things specific to the web workspace.

## Stack

- React 18, Vite 5, TypeScript strict, Tailwind CSS 3, React Router v6.
- Path alias: `@/*` → `src/*` (configured in both `vite.config.ts` and `tsconfig.app.json`).

## Folder Conventions

```
src/
├── main.tsx                 # entry — mounts <App /> into #root
├── App.tsx                  # router: marketing / auth / client / staff / admin
├── index.css                # tailwind base + tokens + a small utility layer
├── pages/
│   ├── marketing/           # public pages — no auth
│   ├── auth/                # login, signup, forgot-password
│   ├── client/              # parent / student portal (auth required)
│   ├── staff/               # examiner dashboards
│   └── admin/               # ops dashboards
├── components/
│   ├── app/                 # AppShell, sidebar, portal chrome
│   ├── auth/                # AuthLayout, form primitives
│   └── (root of components/)# marketing components (Hero, Navbar, Footer, FAQ...)
├── hooks/                   # useAuth, useApi...
├── lib/                     # api client, auth helpers, utils
└── types/index.ts           # SHARED domain types — MUST mirror backend DTOs
```

## Routing

- Everything lives under `App.tsx` using `react-router-dom` v6 `<Routes>`.
- Route prefixes match the folder split: `/`, `/pricing`, `/auth/login`,
  `/portal/*`, `/staff/*`, `/admin/*`.
- New portal pages live in the matching `pages/<role>/` folder.
- Any route that requires auth must be wrapped in `<ProtectedRoute />` — never
  gate visibility with a top-level `if (!user) return null` inside a page.

## Types & API

- `src/types/index.ts` is the **single source of truth** for domain types on the web.
- **When you change a backend DTO or endpoint, update `types/index.ts` in the same PR
  and update `/docs/architecture/api-spec.md`.** No exceptions.
- API calls go through `src/lib/api.ts`. Do not `fetch()` directly from components.

## Styling

- Tailwind only. No CSS-in-JS libraries. No ad-hoc `<style>` tags.
- Use the design tokens declared in `tailwind.config.js`. If you need a colour that
  isn't there, add it to Tailwind config and to `AGENTS.md` — don't hardcode a hex
  in a component.

## Validation

Before you say a change is done:

```bash
npm run typecheck
npm run lint
# for anything non-trivial:
npm run build
```
