# Feature Matrix

Legend: **✓** shipped · **⏳** planned · **n/a** not applicable to this surface.

| Feature | Web | Backend |
|---|:-:|:-:|
| Marketing site (Home / About / Pricing) | ✓ | n/a |
| Sign up / log in with email + password | ✓ | ✓ (STUDENT / STAFF / ADMIN) |
| Google OAuth sign-in for parents | ✓ | ✓ (PARENT) |
| JWT session (bearer token) | ✓ | ✓ |
| Family / student model | ✓ | ✓ |
| Plan checkout + payment order | ✓ | ✓ |
| 100% Razorpay Gateway & Webhooks | ✓ | ✓ |
| Coupon Code Discounts (WISH10 / WISH15) | ✓ | ✓ |
| Prorated Plan Upgrades (599 -> 1099 -> 1999) | ✓ | ✓ |
| Parent adds student login & Settings | ✓ | ✓ (Enforces student quota) |
| Paid vs Unpaid Access Paywall | ✓ | ✓ |
| Exam Board Portal & Script Upload | ✓ | ✓ |
| Evaluation Reports & Score Breakdown | ✓ | ✓ |
| Forgot password | ⏳ | ⏳ |
| First-pass software marking | n/a | ⏳ |
| Staff review queue | ✓ | ⏳ |
| Evaluator sign-off | ⏳ | ⏳ |
| Annotated PDF export | ⏳ | ⏳ |
| Progress report (across 5 papers) | ⏳ | ⏳ |
| WhatsApp notifications | n/a | ⏳ |
| Admin ops dashboard | ✓ | ✓ |
| Sub-Admin Roles & Granular Checkbox Permissions | ✓ | ✓ |
| Programmatic King Admin Creation Endpoint (`/api/admin/create-admin-secret`) | n/a (API only) | ✓ |
| Dynamic Subject Database (Class 10 & Class 12 Science/Commerce/Humanities) | ✓ | ✓ |
| Question Paper Uploader dynamically linked to Subject DB | ✓ | ✓ |
| Razorpay Payment Ledger & Revenue Analytics Board | ✓ | ✓ |
| Member & Student Account Directory | ✓ | ✓ |
| 1-Click AI Evaluation Report Re-generation | ✓ | ✓ |
| Interactive Eye / Eye-Off Password Visibility Toggle | ✓ | n/a |
| Responsive Layout & Mobile Drawer | ✓ | n/a |
| Role-based access (PARENT / STUDENT / STAFF / SUB_ADMIN / ADMIN) | ✓ | ✓ |
| CORS + security headers | ✓ | ✓ |
| Flyway migrations | n/a | ✓ |
| H2 dev profile (zero-setup) | n/a | ✓ |
| PostgreSQL prod profile (Aiven Cloud) | n/a | ✓ |

When you ship a feature, flip its cell to ✓ **and** add a line to `docs/changelog/CHANGELOG.md`.
