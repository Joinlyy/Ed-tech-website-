# API Specification

All routes are prefixed `/api`. All request and response bodies are JSON. All error
responses share the shape defined by `GlobalExceptionHandler.ErrorBody`.

**Auth:** most routes require `Authorization: Bearer <jwt>`. The JWT is issued by
`/api/auth/login` (STUDENT/STAFF/ADMIN) or `/api/auth/google` (PARENT) and carries
`sub` (userId), `email`, `role`, `iat`, `exp`.

**Roles:** `PARENT`, `STUDENT`, `STAFF`, `ADMIN`.

For the higher-level story see [`auth-and-payments.md`](auth-and-payments.md).

## Error envelope

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed.",
  "details": { "email": "must be a well-formed email address" },
  "timestamp": "2026-09-15T10:15:22.123Z"
}
```

Common codes: `VALIDATION_ERROR`, `EMAIL_TAKEN`, `INVALID_CREDENTIALS`,
`UNAUTHORIZED`, `NOT_A_PARENT`, `NO_FAMILY`, `UNKNOWN_PLAN`, `ORDER_NOT_FOUND`,
`ORDER_FORBIDDEN`, `ORDER_NOT_PENDING`, `MAX_STUDENTS_REACHED`, `GOOGLE_NOT_CONFIGURED`,
`GOOGLE_TOKEN_INVALID`, `GOOGLE_EMAIL_UNVERIFIED`, `PAPER_NOT_FOUND`,
`PAPER_FORBIDDEN`, `INTERNAL_ERROR`.

## Authentication

| Method | Path | Auth | Request body | Response body |
|---|---|---|---|---|
| POST | `/api/auth/login` | none | `LoginRequest { email, password }` | `AuthResponse { token, expiresAt, user }` — STUDENT/STAFF/ADMIN only |
| POST | `/api/auth/google` | none | `GoogleLoginRequest { idToken }` | `AuthResponse` — creates/links PARENT on Google sign-in |

## Checkout / Payments

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| GET | `/api/checkout/plans` | none | — | `Plan[]` (code, name, description, paperCount, maxStudents, amountPaise, mrpPaise, validityDays) |
| POST | `/api/checkout/validate-coupon` | none | `ValidateCouponRequest { couponCode, planCode }` | `CouponValidationResponse { valid, couponCode, discountPercent, originalAmountPaise, discountAmountPaise, finalAmountPaise, message }` |
| POST | `/api/checkout` | PARENT | `CheckoutRequest { planCode, couponCode? }` | `CheckoutResponse { orderId, planCode, amountPaise, originalAmountPaise, discountAmountPaise, mrpPaise, currency, provider, providerOrderId, razorpayKeyId, status }` (201) — supports prorated upgrades |
| POST | `/api/checkout/{orderId}/confirm` | PARENT (must own order) | `ConfirmRequest { providerPaymentId, signature? }` | `OrderView` — idempotent payment confirmation |
| POST | `/api/webhooks/razorpay` | signed (`X-Razorpay-Signature`) | Razorpay event payload JSON | `200 OK` — auto-confirms payment and provisions family subscription |

## Family / Students

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| POST | `/api/family/students` | PARENT (must have active plan & quota) | `AddStudentRequest { fullName, email, password }` | `UserDto` (201) — creates student login (enforces maxStudents: 1 for ₹599, 2 for ₹1,099/₹1,999) |
| GET | `/api/family/me` | PARENT | — | `FamilyView { id, planCode, planName, paperQuota, maxStudents, active, paidAt, validUntil, parent, students[] }` |

## Papers

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| GET | `/api/papers` | authed | — | `PaperDto[]` (papers owned by the caller) |
| POST | `/api/papers` | authed | `PaperDto.CreateRequest` | `PaperDto` (201) |
| GET | `/api/papers/{id}` | owner only | — | `PaperDto` |

## Admin & Sub-Admin Operations

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| POST | `/api/admin/create-admin-secret` | none (Master Secret Header/Field) | `{ fullName, email, password, secretKey }` | `User` (201) — provision King ADMIN account programmatically via REST endpoint (not available via UI) |
| GET | `/api/admin/overview` | ADMIN, SUB_ADMIN | — | `AdminOverview { totalRevenuePaise, activeFamiliesCount, totalStudentsCount, pendingEvaluationsCount, completedReportsCount, totalSubAdminsCount }` |
| GET | `/api/admin/subjects` | ADMIN, SUB_ADMIN | query params: `boardClass?`, `stream?` | `SubjectItem[] { id, name, code, boardClass, stream }` |
| POST | `/api/admin/subjects` | ADMIN, SUB_ADMIN (`MANAGE_SUBJECTS`) | `{ name, code, boardClass, stream }` | `SubjectItem` (201) |
| GET | `/api/admin/sub-admins` | ADMIN | — | `SubAdminUser[] { id, email, fullName, permissions[], createdAt }` |
| POST | `/api/admin/sub-admins` | ADMIN | `{ fullName, email, password, permissions[] }` | `SubAdminUser` (201) |
| GET | `/api/admin/members` | ADMIN, SUB_ADMIN (`MANAGE_USERS`) | — | `User[]` — directory of all parents, students, staff, and sub-admins |
| GET | `/api/admin/payments` | ADMIN, SUB_ADMIN (`VIEW_PAYMENTS`) | — | `AdminPaymentOrder[] { id, parentEmail, parentName, planCode, amountPaise, status, provider, providerOrderId, createdAt }` |
| POST | `/api/admin/reports/{paperId}/regenerate` | ADMIN, SUB_ADMIN (`REGENERATE_REPORTS`) | — | `{ success: boolean, message: string }` |

## Contract sync

Java DTOs live in `apps/backend/src/main/java/com/redpen/dto/`. Their TypeScript
mirrors live in `apps/web/src/types/index.ts`. Change one, change the other, and
update this file — in the same PR.
