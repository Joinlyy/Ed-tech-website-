# Client Journey — Happy Path

The client is a *parent* who pays for one or more students. Parent and student
are two distinct users linked through a `family`.

For the technical shape of every step, see
[`docs/architecture/auth-and-payments.md`](../architecture/auth-and-payments.md).

1. **Land on marketing site.** `/` → `/pricing`. Reads Hero → Pricing → FAQ.
   Picks a plan (5 Papers @ ₹599, 12 Papers @ ₹1,099, 20 Papers @ ₹1,999).
2. **Google sign-in.** Google Identity Services opens in the browser. Parent
   picks their Google account. Frontend receives an ID token and POSTs it to
   `/api/auth/google`. Backend verifies, creates a PARENT user on first sign-in,
   returns our JWT.
3. **Pick plan & apply coupon.** Optional coupon input (`WISH10` = 10% OFF, `WISH15` = 15% OFF).
   Frontend POSTs `{planCode, couponCode}` to `/api/checkout`. Backend calculates final price,
   creates a PENDING `payment_orders` row, and registers order with Razorpay.
4. **Pay via Razorpay Modal.** Razorpay JS SDK popup opens. Parent completes payment
   (via Card/UPI/NetBanking).
5. **Confirm.** Razorpay returns `providerPaymentId` & `signature`. Frontend POSTs to
   `/api/checkout/{orderId}/confirm` (or Razorpay Webhook `POST /api/webhooks/razorpay` auto-activates).
   Backend verifies signature, marks order PAID, and provisions `family` subscription.
6. **Paid vs Unpaid Access Control.**
   - **Unpaid accounts:** AppShell displays a paywall banner blocking exam submission and report downloads until plan is activated.
   - **Paid accounts:** Unlocks Exam Board (`/portal/exam-board`), Reports (`/portal/reports`), and Settings (`/portal/settings`).
7. **Settings — Add child student accounts.** Parent navigates to `/portal/settings` or post-payment page.
   Enforces quota: 1 student account for 5 Papers (₹599); 2 student accounts for 12 & 20 Papers (₹1,099 & ₹1,999).
   Parent enters credentials *they choose*. Frontend POSTs `{fullName, email, password}` to `/api/family/students`.
8. **Parent shares credentials with child out-of-band.** Passwords never traverse email.
9. **Student logs in.** Student opens `/auth/login`, enters student credentials set by parent.
10. **Exam Board & Evaluation.**
    - Student accesses `/portal/exam-board`, downloads CBSE paper.
    - Student uploads answer script photos/PDF.
    - Track pipeline status (`DRAFT` → `UPLOADED` → `IN_REVIEW` → `MARKED`).
11. **Report delivered.** Parent and student view interactive evaluation report at `/portal/reports`.
    Chapter scores, single biggest leak habit callout, and red pen marked script PDF.
12. **Prorated Plan Upgrades.** Parent can upgrade plan anytime from `/portal/settings` or `/checkout`
    and pays only the price difference (e.g. ₹500 to upgrade from 5 Papers to 12 Papers).
