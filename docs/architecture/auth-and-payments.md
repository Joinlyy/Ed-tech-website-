# Auth & Payments

The whole system is built around one product decision:
**parent pays, student uses, and no password ever travels by email.**

## The signup flow

```
┌──────────────────────────────────────────────────────────────────────┐
│  1. Parent lands on /pricing → picks a plan (5, 12, or 20 papers)    │
│  2. Parent signs in with Google (Google Identity Services in browser)│
│  3. Frontend POSTs {idToken} → /api/auth/google → app JWT            │
│  4. Optional: Parent applies coupon code (WISH10 / WISH15)           │
│  5. Frontend POSTs {planCode, couponCode} → /api/checkout            │
│  6. Razorpay Modal SDK opens in browser → parent completes payment    │
│  7. Frontend POSTs {providerPaymentId, signature} → /confirm         │
│     (or Razorpay Webhook POSTs to /api/webhooks/razorpay)           │
│     ↳ backend creates/upgrades the family, marks order PAID           │
│  8. Settings / Post-payment page: parent types student's creds       │
│     POST {email, password, fullName} → /api/family/students          │
│  9. Parent shares credentials with child manually                    │
│ 10. Student logs in via /api/auth/login with the parent-set creds    │
└──────────────────────────────────────────────────────────────────────┘
```

Nothing about step 8 involves email. The parent chooses the password themselves,
sees it once on screen, and hands it to their child through whatever channel
they prefer. We never store, log, or transmit the plaintext password.

## Data model

```
users
 ├─ id               UUID
 ├─ email            unique
 ├─ password_hash    nullable   ← null for Google-authed parents
 ├─ full_name
 ├─ role             PARENT | STUDENT | STAFF | ADMIN
 ├─ google_sub       nullable, unique when set
 ├─ family_id        nullable, FK → families(id)
 └─ created_at

families
 ├─ id
 ├─ parent_user_id   unique, FK → users(id)
 ├─ plan_code
 ├─ paid_at
 ├─ valid_until
 └─ created_at

payment_orders
 ├─ id
 ├─ parent_user_id   FK → users(id)
 ├─ family_id        nullable — set on PAID
 ├─ plan_code
 ├─ amount_paise     BIGINT     ← always the smallest currency unit
 ├─ currency         "INR"
 ├─ status           PENDING | PAID | CANCELLED | FAILED
 ├─ provider         "STUB" | "RAZORPAY"
 ├─ provider_order_id
 ├─ provider_payment_id
 ├─ created_at
 └─ paid_at
```

One parent → one family → 1 or 2 students based on subscription tier:
- **5 Papers Bundle (₹599):** 1 Student Account allowed.
- **12 Papers Bundle (₹1,099):** 2 Student Accounts allowed.
- **20 Papers Bundle (₹1,999):** 2 Student Accounts allowed.

## Authentication paths

| Role | How they log in | Endpoint | Notes |
|---|---|---|---|
| PARENT | Google ID token exchange | `POST /api/auth/google` | Creates account on first sign-in |
| STUDENT | Email + password (set by parent) | `POST /api/auth/login` | Created by parent in portal settings |
| STAFF | Email + password | `POST /api/auth/login` | Created by admin |
| SUB_ADMIN | Email + password | `POST /api/auth/login` | Created by King ADMIN with checkbox permissions |
| ADMIN | Email + password | `POST /api/auth/login` | Default account seeded on startup (`admin@redpen.in` / `admin123456`); custom admins provisioned via `POST /api/admin/create-admin-secret` |

Both paths issue the same app JWT (HS256, 24h TTL, secret in
`REDPEN_SECURITY_JWT_SECRET`). The Google ID token is used only to verify
identity — it's never stored, never forwarded, never used for authorization.

## Payments & Razorpay Integration

Money is handled through `RazorpayGateway` implementing `PaymentGateway`:

- `createOrder(amountPaise, currency, internalOrderId) → CreatedOrder`
- `verifyPayment(providerOrderId, providerPaymentId, signature)`
- `name()` — returns `"RAZORPAY"`

**Active Configuration:**
- Set `REDPEN_PAYMENTS_PROVIDER=RAZORPAY` in `apps/backend/.env`.
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` loaded dynamically into `RazorpayGateway`.
- `POST /api/webhooks/razorpay` verifies `X-Razorpay-Signature` HMAC-SHA256 signature against `REDPEN_PAYMENTS_RAZORPAY_WEBHOOK_SECRET` (`P@war2330`).

## Prorated Plan Upgrades

When a parent with an active plan purchases a higher bundle:
- **5 Papers (₹599) → 12 Papers (₹1,099):** Pay only the **₹500** difference.
- **5 Papers (₹599) → 20 Papers (₹1,999):** Pay only the **₹1,400** difference.
- **12 Papers (₹1,099) → 20 Papers (₹1,999):** Pay only the **₹900** difference.

Calculated automatically in `OrderService.createCheckout`.

## Idempotency

`confirmPayment` is idempotent — a duplicate webhook (Razorpay retries them)
on an already-PAID order returns the existing family without side-effects.

## Secret handling

- Nothing sensitive is ever committed. `.env` is git-ignored at every depth.
- `application.yml` only reads `${…}` references — every real value comes from
  the environment.
- The JWT signing key must be ≥ 32 bytes; `JwtService` refuses to start otherwise.
