# Practice Results final UI

## Scope

The submitted MCQ state of `/practice/[id]` now uses the approved question-navigator results design from `Results Final.png`. The implementation is frontend-only and preserves the existing authenticated `PageShell`, navbar, footer, report-question workflow, Weak Areas route, API client, practice submission flow, and backend contracts.

## Verified contracts

- `GET /api/practice/:id/summary` requires a Bearer token and is the authoritative submitted-session gate. Its response includes session identity, `subject_id`, `mode`, `attempt_status`, and `totals.mcq_total` / `totals.cq_total`; it does not provide a complete correct count or accuracy score.
- `GET /api/practice/:id/results` requires a Bearer token and accepts `section`, `page`, and `page_size`. Pagination defaults to 10 and is capped at 20; the frontend requests `section=MCQ` and `page_size=20`.
- Each results page provides `practice_session_id`, `section`, `page`, `page_size`, `total_in_section`, and `items`. The MCQ review uses each item's `section_order_no`, `user_answer.selected_option_label`, `mcq.is_correct`, `mcq.correct_option_label`, `mcq.options`, and `question.explanation`. Missing result text, explanation, correctness, or option values are represented as `null` where the contract allows it.
- The results endpoint returns `403` for a session owned by another account, `404` for a missing session, and `409` when the session has not been submitted. `401` remains the authentication-recovery case.
- `GET /api/practice/:id/results/jump` requires `section` and `number` and returns one result item. It remains available but is not needed after the frontend has safely loaded the complete MCQ result set.
- The existing report workflow is `POST /api/questions/:id/reports` with authentication. The frontend sends a validated `reason_code` and optional trimmed `details`, and uses the response message for success feedback; it does not show raw reason codes to students.
- The shared client prefixes calls with `/api` and unwraps the existing `{ success, data }` envelope.

No new endpoint, query parameter, response field, score field, chapter field, reviewed-state field, or persistence request was introduced.

## Complete-session loading

`getCompleteResults()` performs the following work before any score or question navigator is exposed:

1. Fetch page 1 at 20 results per page.
2. Read `total_in_section` and the effective returned page size.
3. Calculate the remaining number of pages.
4. Reject a result total above the existing 50-MCQ practice limit, or an invalid returned page size, before requesting another page.
5. Fetch every remaining page.
6. Verify the requested session ID and section on page one, then verify consistent session ID, section, total count, and page numbering across every page.
7. Merge and sort by `section_order_no`, then `order_no`.
8. Reject invalid, duplicate, or non-contiguous question numbers.
9. Reject a merged count that differs from `total_in_section`.

SWR uses one complete-results key for the session and section, disables focus revalidation, and deduplicates React development rendering. Changing the selected question updates local UI state and does not refetch results. A first-page or later-page failure leaves the score and navigator hidden and exposes a real Retry action through SWR revalidation.

## Derived result semantics

Each question has one mutually exclusive status:

- Correct: `mcq.is_correct === true`.
- Unanswered: it is not correct and no selected option label matches a real returned option.
- Incorrect: a valid returned option is selected and `mcq.is_correct !== true`.
- Needs review: incorrect plus unanswered.

Accuracy is `Math.round(correctCount / totalQuestions * 100)`. A zero-question session returns zero, and displayed visual percentages are clamped to 0–100.

The summary shows correct, needs-review, incorrect, unanswered, and accuracy values only after every result page succeeds.

## Subject and chapter context

After a populated result set is available, the page resolves `summary.subject_id` against the existing authenticated SSC subject catalogue. It shows `{Subject} practice complete` when matched and `Practice complete` while the optional name is unavailable or unresolved. The optional catalogue request is deferred during results loading, failure, and empty states so it cannot delay or add noise to core recovery paths.

The current summary/results contracts do not identify the session chapter or selection label. The approved screenshot's `Light` context is therefore intentionally omitted; no chapter is inferred from question wording and answer review does not wait for optional catalogue data.

## Navigator and reviewed progress

- Every returned MCQ question number is rendered in numeric order.
- The initial selection is the first incorrect or unanswered result, or question one for an all-correct session.
- Correct, needs-review, unanswered, and selected states use text, icons, borders, and accessible labels rather than colour alone.
- Question controls are semantic buttons with approximately 44-pixel targets and visible focus.
- Previous and Next follow the already sorted result order and disable at their endpoints.
- Review next mistake includes both incorrect and unanswered results and wraps to the first needs-review result. It becomes `No mistakes to review` when the session is all correct.
- Previous, Next, and Review next mistake move focus to the updated question heading. Direct navigator activation retains focus on the selected navigator button.

`Reviewed x of y` is local UI state for the current page visit. A needs-review question counts as reviewed when it is initially selected or opened through navigation. The state is not saved, does not trigger an API request, and resets naturally after reload.

## Answer review and missing content

- A selected correct option states both `Your answer` and `Correct answer`.
- An incorrect selection and the correct option are separately labelled.
- An unanswered result states `No answer submitted` and still identifies the correct option when the option contract is complete.
- Missing question text uses `This question text is unavailable.`
- Missing explanations use `No explanation is available for this question yet.`
- Missing, duplicate, or incomplete option data produces an `Answer options unavailable` state without fabricating choices; reporting and navigation remain available.
- The existing report dialog keeps its reason-code mapping, duplicate-submit guard, success/error announcements, Radix focus return, and now uses an approximately 44-pixel trigger.

## Page states

- Authentication and summary loading use labelled status skeletons.
- Logged-out and expired-authentication states preserve `/practice/{id}` as the login destination.
- Summary and result errors differentiate unauthorized, forbidden, not-found, not-submitted, and general complete-load failures.
- Empty submitted MCQ sessions show a factual recovery state.
- Partial multi-page results never render.
- Invalid, non-positive, or non-integer practice IDs continue through the existing App Router `notFound()` path.

## Responsive and accessibility decisions

- Wide desktop uses a compact 19-rem navigator beside a dominant review panel.
- Tablet and smaller desktop widths stack the navigator above the review panel to protect readable answer widths.
- Mobile order is back link, heading/context, summary, navigator, legend/progress, current question, options, explanation, navigation, Weak Areas handoff, and shared footer.
- The mobile navigator wraps into a compact five-column grid without horizontal scrolling; larger intermediate widths increase the columns before switching to the desktop two-column navigator.
- Option text can wrap without colliding with answer labels. Navigation controls stack on narrow screens.
- The page has one `h1`, logical section headings, semantic landmarks/buttons, accessible selected/status names, labelled progress bars, polite loading/error communication, disabled semantics, visible focus, and text plus icons for status. Results success text uses `emerald-700` on its white-card treatment (5.48:1 contrast), rather than the shared success token.
- Transitions opt out for reduced-motion preferences. The layout uses no sticky answer controls and is designed to reflow at 200% zoom.

## Tests

Focused coverage includes:

- empty, single-page, and multi-page aggregation; remaining-page calculation; ordering; requested-session validation; maximum-result and invalid-page-size rejection; duplicate or missing question numbers; inconsistent totals; incomplete merges; and first- or later-page failure;
- correct, incorrect, unanswered, needs-review, whole-number accuracy, and zero-question calculations;
- first-needs-review and all-correct defaults;
- numbered, previous/next, and wrapped mistake navigation;
- accessible status/selected names and answer comparison text;
- selected-correct, selected-incorrect, unanswered, missing stem/options/explanation, loading, empty, Retry, 401, 403, and 404 states;
- report success/failure and reason-code mapping;
- the real Weak Areas route and absence of CQ/Mixed results controls and Refund Policy copy.

## Verification results

The final frontend verification run passed:

- `npm run lint`;
- `npx tsc --noEmit --incremental false`;
- focused Results tests - 2 test files and 48 tests passed;
- full suite - 22 test files and 158 tests passed;
- `npm run build`;
- `git diff --check`.

The focused Results tests use mocked contracts for populated, all-correct, mixed, empty, malformed, paginated, first-page-failure, and later-page-failure states.

Live authenticated browser verification used a disposable 10-question Physics session submitted through the existing UI. It confirmed the derived 1 correct / 9 needs-review / 10% accuracy summary, the ordered navigator, answer comparison, missing-explanation fallback, local reviewed count, direct-navigator focus retention, previous/next focus transfer to the question heading, and reload-safe session recovery. At 390px and 768px viewports, the layout retained one `h1` and no horizontal overflow; the narrow-view navigator retained all ten controls. Browser console diagnostics showed no warnings or errors before or after reload; the post-reload page rehydrated back to the complete summary.

The controlled browser did not apply its native zoom shortcut (device-pixel ratio remained unchanged), so the 390px viewport test is evidence of narrow-layout reflow rather than a replacement for a manual 200% browser-zoom release check. No hydration mismatch was observed.

## Screenshot fidelity and intentional deviations

The implementation follows the approved visual hierarchy, restrained light-blue cards, compact status summary, navigator/workspace proportions, answer comparison, explanation panel, and Weak Areas handoff. All session values remain live.

Intentional deviations are contract- or product-grounded:

- no hardcoded Physics, Light, questions, answers, counts, or score;
- no chapter context without a verified field;
- no screenshot-only Blog, Careers, or Refund Policy links;
- the current shared navbar/footer remain unchanged;
- incorrect and unanswered are both included in the needs-review total while remaining separately identifiable in the navigator;
- no CQ or Mixed results tabs because this approved target is the submitted MCQ state and those practice modes are not currently selectable.

## Tawsif handoff — Results contract and efficiency

### What already exists

- An authenticated submitted-session summary through `GET /api/practice/:id/summary`.
- Paginated result retrieval through `GET /api/practice/:id/results`.
- Per-question MCQ correctness, the submitted option label, the correct option label, returned options, and a question explanation where available.
- Result lookup by section number through `GET /api/practice/:id/results/jump`.
- Authenticated question reporting through the existing question-report route.

### What the frontend completed

- Safe loading of every MCQ results page before exposing a score or navigator, including validation of the current 50-MCQ maximum and returned pagination metadata.
- Complete-session correct, incorrect, unanswered, needs-review, and accuracy calculation.
- A status-aware question navigator, answer comparison, previous/next controls, and wrapped `Review next mistake` behaviour.
- Local-only reviewed progress, accessible loading/recovery states, responsive desktop/tablet/mobile layout, focused contract/UI tests, and a deferred optional subject-catalogue lookup once populated results are ready.

### Current contract limitations

- The reloadable summary does not expose a complete correct count or accuracy score.
- Results must be aggregated across pages before a safe complete-session score can be shown.
- Subject display can require a separate existing catalogue lookup from `subject_id`.
- Session chapter context is not reliably present in the summary or result response.
- Reviewed-result progress is not persisted.
- The frontend must not infer or invent chapter context from question wording.

### Efficiency consideration

Client-side aggregation is accurate and safe with the current contract, but it requires multiple requests when a result section has more than 20 questions. The frontend validates the current 50-MCQ practice maximum and the returned page size before issuing follow-up requests, so malformed metadata cannot create unbounded client pagination. Tawsif may later consider a persisted results summary or a richer submitted-session contract if product needs justify the added contract surface. This document does not prescribe field names or a new endpoint, and the current contract must remain unchanged for this work. The frontend should retain aggregation until an approved replacement exists.

### Exact change declaration

- Backend changes: **No**.
- API-response changes: **No**.
- Database changes: **No**.
- Authentication changes: **No**.
- Practice-submission changes: **No**.
- Question-generation changes: **No**.
- Payment/subscription changes: **No**.
- Environment changes: **No**.
- Package changes: **No**.

### Release implications

Client aggregation is safe for the beta because it waits for a validated complete result set before showing learner-facing totals, accuracy, or navigation. No current contract limitation blocks the selected Results design.

The screenshot's subject/chapter treatment was intentionally reduced: the subject title is resolved only when the existing catalogue lookup can provide it, and chapter text is omitted because the session contract does not safely provide it. Tawsif should later review whether a submitted-session display context, a persisted review lifecycle, a server-backed complete-results summary, or error-envelope consistency is needed for future scale or fidelity. These are follow-up decisions, not launch blockers.

The shared Weak Areas design, dependencies, and lockfiles are also unchanged.
