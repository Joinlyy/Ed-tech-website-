# Staff Workflow — Evaluator Happy Path

Staff (retired / practising CBSE evaluators) log in to review provisional marks proposed by
the first-pass software. Their job is judgment, not typing.

1. **Log in.** Evaluator visits `/auth/login`, enters credentials. Role `STAFF`.
   Redirected to `/staff/dashboard`.
2. **See the queue.** Dashboard shows scripts with status `IN_REVIEW`, sorted by upload age
   (oldest first). Each row: script id, subject, provisional mark, age.
3. **Open a script.** Clicking a row opens the annotated script side-by-side with:
   - the original student handwriting, page by page,
   - the marking scheme for that paper,
   - the provisional marks the software assigned, with reasons.
4. **Review question by question.** For each question the evaluator can: accept the
   provisional mark, override the mark, or flag a segment as illegible.
5. **Write the "biggest leak".** One short human sentence identifying the most costly
   habit in this paper. Not a topic list — a habit.
6. **Sign off.** Evaluator marks the paper `MARKED`. The system takes over from here:
   PDF generation, notification, delivery.
7. **Handle exceptions.** If a page is unreadable, evaluator selects the page and clicks
   *Request re-photograph* → the parent gets a WhatsApp asking for that page only.
8. **Log out.** Session ends when the JWT expires (24 h) or on explicit logout.

Non-goals for staff: no direct student contact, no scheduling, no billing. All handled by
admin.
