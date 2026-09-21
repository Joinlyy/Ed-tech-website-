# Admin Operations — Happy Path

# Admin Operations — Happy Path

Admins and Sub-Admins run the business: subject catalog management, question paper uploads, onboarding sub-admin staff with granular permissions, watching revenue & payment ledgers, member directory tracking, and triggering 1-click AI report re-generation. Everything they do is `/admin/**` and requires role `ADMIN` or `SUB_ADMIN`.

1. **Provision King Admin.** King Admin (`ADMIN`) accounts CANNOT be registered from the public UI. They are provisioned programmatically via `POST /api/admin/create-admin-secret` passing `fullName`, `email`, `password`, and `secretKey` (matching system env var `REDPEN_ADMIN_SECRET_KEY`).
2. **Log in.** `/auth/login` with an admin (`ADMIN`) or sub-admin (`SUB_ADMIN`) account. Redirected to `/admin/dashboard`.
2. **Watch the Executive Ops Board.** Dashboard displays live metrics: Total Revenue (in ₹), Active Families & Enrolled Students, Pending Board Evaluation Queue, and Delegated Sub-Admin Count.
3. **Manage Subjects & Streams.** Access `/admin/subjects` to view, filter, and create subjects for:
   - **Class 10:** General stream (Mathematics, Science, Social Science, English, Hindi).
   - **Class 12:** Science (Physics, Chemistry, Biology, Mathematics), Commerce (Accountancy, Economics, Business Studies), and Humanities (History, Political Science, Geography).
4. **Upload Question Papers.** Access `/admin/question-papers` to upload new CBSE board exam papers and answer keys. The subject dropdown dynamically fetches available subjects from PostgreSQL based on the selected Class & Stream.
5. **Create & Delegate Sub-Admins.** Access `/admin/sub-admins` (King Admin only). Admin fills in Full Name, Email, Password, and selects checkbox permissions:
   - `MANAGE_PAPERS`: Upload/edit question papers.
   - `MANAGE_SUBJECTS`: Manage Class 10/12 subjects & streams.
   - `MANAGE_USERS`: Member & student directory access.
   - `VIEW_PAYMENTS`: Razorpay transaction history & revenue metrics.
   - `REGENERATE_REPORTS`: Trigger AI report re-evaluation.
6. **Inspect Member & Student Directory.** Access `/admin/members` to search and filter across all Parent, Student, Staff, Sub-Admin, and Admin accounts, inspecting active paper quotas and plan subscriptions.
7. **Track Razorpay Payment Ledger.** Access `/admin/payments` to review all payment orders, applied discount coupons (`WISH10` / `WISH15`), MRP vs final amount paid, Razorpay Order/Payment IDs, and webhook transaction statuses.
8. **1-Click AI Report Re-generation.** Access `/admin/reports` to monitor diagnostic evaluation reports and trigger 1-click AI re-generation via `POST /api/admin/reports/{paperId}/regenerate` when an evaluation is updated or disputed.

Non-goals for sub-admins: Sub-admins cannot create other sub-admins or grant themselves permissions. King Admin retains full unconstrained control over the platform.
