# Changelog

All notable changes to RedPen will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2026-09-16

### Added

- **Executive Admin & Sub-Admin Operations Suite (`/admin/*`).** Complete platform management suite featuring Admin Command Center, Subject Manager, Question Paper Uploader, Sub-Admin Roles, Member Directory, Payment Ledger, and AI Report Re-generation.
- **Secure Programmatic King Admin Creation.** Added `POST /api/admin/create-admin-secret` endpoint secured via system secret key (`REDPEN_ADMIN_SECRET_KEY`). King Admin accounts cannot be created from the public UI.
- **King Admin & Sub-Admin Roles with Checkbox Permissions.**
  - Added `SUB_ADMIN` role enum in `UserRole.java`.
  - Added `AdminPermission` enum (`MANAGE_PAPERS`, `MANAGE_SUBJECTS`, `MANAGE_USERS`, `VIEW_PAYMENTS`, `REGENERATE_REPORTS`).
  - Added sub-admin user creation form with granular checkbox permission assignment in `AdminSubAdmins.tsx`.
- **Dynamic Subject & Stream Management.**
  - Added `subjects` database table supporting Class 10 (General) and Class 12 (Science, Commerce, Humanities streams) with automatic seeding.
  - Added `AdminSubjects.tsx` for adding, filtering, and organizing CBSE subjects.
- **Board Question Paper Uploader.**
  - Created `AdminQuestionPapers.tsx` dynamically fetching subjects from DB, allowing admins to upload board question papers and answer keys by Class and Stream.
- **Flyway Database Migration (`V003__subjects.sql`).** Automatic database schema creation for CBSE subjects (`subjects` table) across Class 10 & Class 12 streams for both H2 in-memory DB and production PostgreSQL.
- **Interactive Eye / Eye-Off Password Visibility Toggle.** Added SVG toggle button across all password inputs in the application (`Login.tsx`, `Settings.tsx`, `AdminSubAdmins.tsx`, `AddStudent.tsx`).
- **Responsive Layout & Mobile Menu Drawer (`AppShell.tsx`).** Responsive navigation with a desktop sidebar (`w-64`) and a mobile top bar with a slide-out backdrop drawer overlay.
- **High-Contrast Admin UI Styling & Prominent Action Banners.** High-contrast active tab styling and prominent hero action buttons for "Add Sub-Admin Staff" and "1-Click AI Re-generate".
- **Member & Student Directory (`/admin/members`).**
  - Searchable directory of all registered Parent, Student, Staff, and Sub-Admin accounts with active subscription status and paper quotas.
- **Razorpay Payment Ledger & Revenue Analytics (`/admin/payments`).**
  - Transaction history table displaying Razorpay Order IDs, Payment IDs, plan purchases, coupon codes (`WISH10`, `WISH15`), and live revenue metrics.
- **Evaluation Reports & 1-Click AI Re-generation (`/admin/reports`).**
  - Centralized report dashboard for reviewing student evaluations and triggering 1-click AI report re-generation via `/api/admin/reports/{paperId}/regenerate`.

### Added

- **100% Razorpay REST Integration & Signature Verification.** `RazorpayGateway.java` implemented with live/test REST order creation and HMAC-SHA256 payment signature verification (`verifyPayment`).
- **Server-side Razorpay Webhooks.** Added `POST /api/webhooks/razorpay` endpoint in `WebhookController.java`. Verifies `X-Razorpay-Signature` header against webhook secret (`P@war2330`) and auto-provisions subscriptions for `order.paid` events.
- **3-Tier Subscription Pricing Model.** Updated `PlanCatalog` and frontend pricing cards to paper bundle packages:
  - 5 Papers Bundle: **₹599** (MRP ₹749)
  - 12 Papers Bundle: **₹1,099** (MRP ₹1,299)
  - 20 Papers Bundle: **₹1,999** (MRP ₹2,499)
- **Coupon Code Discount Engine.** Added coupon validation endpoint `POST /api/checkout/validate-coupon` supporting `WISH10` (10% OFF) and `WISH15` (15% OFF) with live price breakdown at checkout.
- **Prorated Plan Upgrades.** Parents upgrading from 5 Papers to 12 Papers pay only the ₹500 price difference; upgrading to 20 Papers pays ₹1,400 (or ₹900 from 12 Papers).
- **Student Quota Limits per Package.** Enforced 1 Child Student Account for the ₹599 plan, and up to 2 Child Student Accounts for ₹1,099 and ₹1,999 plans in `FamilyService.java` and `Settings.tsx`.
- **Paid vs Unpaid Access Control Paywall.** AppShell checks parent subscription status and displays an **Active Plan Required** paywall banner for unpaid accounts, directing them to `/checkout`.
- **Exam Board & Answer Script Portal (`/portal/exam-board`).** CBSE Class 10/12 paper list, paper PDF download, photo/PDF answer script upload, and status pipeline (`DRAFT` → `UPLOADED` → `IN_REVIEW` → `MARKED`).
- **Evaluation Reports Page (`/portal/reports`).** Interactive report displaying score summary, single biggest mark leak habit, chapter-wise score breakdown, and red pen marked script preview.
- **Settings & Family Page (`/portal/settings`).** Parent profile management, active paper quota status, prorated plan upgrade options, and Child Account Creator.

## [0.2.0] - 2026-09-09

### Added

- **Google OAuth 2.0 sign-in for parents.** `POST /api/auth/google` verifies an ID token against Google's JWKS (server-side, no browser trust) and issues our app JWT. Creates a PARENT user on first sign-in.
- **Family / student model.** New `families` and `payment_orders` tables ([`V002__family_and_google_auth.sql`](../../apps/backend/src/main/resources/db/migration/V002__family_and_google_auth.sql)).
- **Checkout + plans.** `GET /api/checkout/plans`, `POST /api/checkout`, and `POST /api/checkout/{id}/confirm`. Money in paise (BIGINT).
- **Aiven Postgres wiring.** `application.yml` reads DB config from env vars (`SPRING_DATASOURCE_URL/USERNAME/PASSWORD`).

## [0.1.0] - 2026-09-09

### Added

- **Monorepo scaffold** — `apps/web` (React + Vite + Tailwind) and `apps/backend` (Java 21 + Spring Boot 3.3 + Gradle).
