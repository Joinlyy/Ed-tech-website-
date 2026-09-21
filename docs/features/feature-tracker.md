# Feature Tracker

A lightweight kanban of what's in flight. Move items across columns as work progresses.
For a stable "what exists today" view, see `feature-matrix.md`.

## Now (in progress)

- **Marketing site + auth screens.** Landing, pricing, FAQ, login, signup, forgot-password.
  Owner: web. Status: scaffolded, copy needs review.
- **Auth service + JWT.** Sign-up / login endpoints returning a signed JWT. Owner: backend.
  Status: complete for happy path; add rate-limiting before opening publicly.

## Next (queued)

- **Add-student flow.** Client portal onboarding step to attach one or more students
  to the parent account.
- **Paper upload.** Client uploads photographs of each page; backend stores in object
  storage (provider TBD).
- **First-pass marker.** Software that matches script → marking scheme → step-wise
  provisional marks. This is the technical heart of the product; spike it in isolation
  first.

## Later (parked, not scheduled)

- ICSE and state-board support (currently CBSE-only).
- Native mobile app. (Web + WhatsApp covers the current parent flow.)
- Coaching-institute white-label. Only if a design partner asks; not proactively.

## Blocked / decisions needed

- Payment provider (Razorpay vs. Stripe India). Decision blocks the pricing checkout flow.
- Object storage for scripts (S3 vs. Cloudflare R2 vs. self-hosted MinIO). Decision blocks
  paper upload.
