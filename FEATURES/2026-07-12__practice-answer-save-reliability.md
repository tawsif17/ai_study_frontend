# Practice Answer Save Reliability

## Status
Done - approved frontend implementation, QA revisions, and verification completed.

## Goal
Make answer saving on `/practice/[id]` deterministic, visible, recoverable, and safe to submit. The frontend must preserve the student's latest local answer during recoverable failures, serialize writes for a practice session, wait for all acknowledged saves before submission, prevent duplicate submission, and warn before navigation can discard unsaved work.

This brief plans frontend work only. It does not authorize backend, database, migration, contract, authentication, entitlement, CQ-availability, or product-scope changes.

## Affected Routes
- `/practice/[id]` while `attempt_status === "IN_PROGRESS"`.
- `/practice/[id]` during the transition from submission to the existing results view.
- Route-leaving navigation initiated from the shared page shell while the practice session has unsaved, queued, retrying, or failed work.

## Current Behavior and Lifecycle

### Answer selection
- `PracticeSessionContent` immediately updates `localAnswers` when an MCQ option is selected or CQ text changes.
- The visible answer therefore changes optimistically before the server confirms persistence.
- The existing CQ textarea calls the save path on every keystroke. CQ is unavailable in the current MCQ-only beta, but the shared code path still exists and must not be made less safe.

### Autosave initiation
- Every local change immediately calls `saveCurrentAnswer()`.
- Each call sends a one-answer `PATCH /api/practice/:id/answers` request.
- There is no debounce, queue, coalescing, request revision, or ordering mechanism.

### Overlapping saves and rapid answer changes
- Multiple save requests can be active at the same time.
- A single `isSaving` boolean is set by every request and cleared by whichever request finishes first, so the UI can stop showing `Saving...` while a later request is still active.
- Repeated changes to the same answer can reach the backend out of order. The database upsert applies whichever request executes last, which may not be the student's latest selection.
- Each successful request calls `mutateAnswers()`. A revalidated server snapshot can replace the complete `localAnswers` map and visually restore an older value.

### Network failure and retry
- Save errors are written only to `console.error`.
- The student sees no failure state, no retry state, and no retry action.
- There is no automatic retry policy and no distinction between retryable and terminal API failures.
- The latest local selection usually remains visible while the component stays mounted, but the UI gives no honest indication that it is unsaved.

### Navigation and unmounting
- Previous/Next question navigation changes the current index and does not wait for the answer save. Remaining on the same mounted session is usually safe for local display, but the request continues independently.
- There is no `beforeunload`, route-leaving guard, or back-navigation protection when work is pending or failed.
- The component does not cancel retry timers or explicitly ignore late async completions after unmount.
- Force-closing, refreshing, or leaving the route can discard an unconfirmed local answer.

### Session submission and results transition
- `handleSubmit()` calls `submitPractice()` immediately. It does not wait for active or pending answer saves.
- A slow answer save can therefore race the transactional backend submission. Submission can score the previously persisted answer or no answer, while a late save is rejected after the session becomes submitted.
- On submit success, the frontend revalidates the practice summary and calls `router.refresh()`. The wrapper renders `PracticeResultsContent` after the summary reports `SUBMITTED`.

### Duplicate submission
- The submit button is disabled using React state after the first handler call.
- The handler checks `isSubmitting`, but React state is not a synchronous mutex; two events in the same render window are not guarded by a ref/lock.
- The backend does protect duplicate submission with a session-row lock and returns `409 Session already submitted`, but the frontend should still prevent duplicate requests and recover cleanly if another client submits first.

## Backend Findings (Read-Only Inspection)

### Repeated-save behavior
- `practice_answers.practice_item_id` is unique.
- The backend uses `INSERT ... ON CONFLICT (practice_item_id) DO UPDATE`, so repeating the same payload converges on the same answer value.
- This is data-outcome idempotence for an identical payload, not request idempotency. There is no idempotency key, and a repeated save updates `updated_at`.

### Request ordering
- Requests can arrive or execute out of order.
- There is no client revision, server revision, mutation ID, compare-and-set condition, or last-write sequence in the request or database update.
- The database therefore cannot distinguish a newer student selection from an older delayed request.

### Save response
- A successful save returns only `{ "saved": true }` inside the API response envelope.
- It does not echo the persisted answer, `practice_item_id`, `updated_at`, revision, or mutation ID.
- `GET /api/practice/:id/answers` returns the persisted answer rows and `updated_at`, but a revalidation response is not tied to the mutation that triggered it.

### Submission
- Submission is transactional.
- The backend locks the `practice_sessions` row with `FOR UPDATE`, checks ownership and `attempt_status`, computes the score, updates answer scoring fields, marks the session `SUBMITTED`, and commits.
- Duplicate submissions are rejected with `409` after the session-row lock.
- Answer saving does not acquire the same session-row lock. A database trigger rejects inserts/updates when it observes a submitted session, but frontend code alone cannot prove all save-versus-submit race orderings across independent clients.

### CQ deletion
- The current backend rejects empty CQ text, so clearing a CQ answer cannot currently be persisted as deletion.
- CQ is out of the current MCQ-only beta. The frontend must not display a false `Saved` state for a cleared CQ answer if the shared CQ code remains present.

## Proposed Frontend Design

### 1. Deterministic session-level save queue
Add a focused queue module and hook, tentatively:
- `lib/practice-answer-save-queue.ts`: pure queue/reducer logic with no React dependency.
- `hooks/use-practice-answer-save-queue.ts`: React lifecycle integration and UI-facing state.

Use one active `PATCH` request at a time per mounted practice session. Do not run concurrent saves for different questions in the same session in the first implementation; the current backend offers no revision guarantee that makes concurrency materially safer.

Each local mutation receives a monotonic client-only revision:
- `sessionId`
- `practiceItemId`
- `answerType`
- latest local value
- `clientRevision`

The revision is frontend state only and must not be sent to the current endpoint because the backend rejects unexpected fields.

Queue rules:
1. Update the visible local answer synchronously.
2. Enqueue the corresponding mutation.
3. Keep at most one network request active for the session.
4. Coalesce queued mutations for the same `practice_item_id` to the latest value.
5. If the same item changes while an older revision is in flight, retain one queued successor containing the latest value.
6. Process pending items in deterministic FIFO order based on their first unsaved enqueue position.
7. A response for revision N may acknowledge only revision N. It must never mark revision N+1 as saved or replace its local value.
8. Do not call `mutateAnswers()` after every individual save.

### 2. Local/server answer reconciliation
- Treat the initial `GET /practice/:id/answers` result as the persisted baseline.
- Keep locally edited answers as a separate overlay rather than replacing the full local map whenever SWR revalidates.
- Render the local overlay whenever an item has a local revision newer than its acknowledged revision.
- Merge later server snapshots only into items that have no newer local mutation.
- A stale GET response or older save completion must never visually replace a newer local selection.
- After the queue drains, optional revalidation may refresh the persisted baseline, but `Saved` must be based on successful acknowledgement of the latest queued mutation, not on an optimistic assumption.

### 3. Save state machine
Expose an aggregate session state and enough per-item revision state to derive it:
- `idle`: no edit has been made in this mount and no save is active.
- `saving`: the latest work is queued or in flight.
- `retrying`: a retryable save is waiting for or performing an automatic/manual retry.
- `saved`: every current local revision has received a successful response and there is no queued, active, or failed work.
- `failed`: the latest required mutation has exhausted automatic retries or received a terminal error.

UI copy:
- `Saving...`
- `Saved`
- `Save failed`
- `Retrying...`

Never show `Saved` before the latest local revisions are confirmed by successful responses.

### 4. Bounded retry policy
- Allow at most two automatic retries after the initial request: three total attempts for one mutation snapshot.
- Use deterministic exponential delays suitable for fake-timer tests, initially 500 ms then 1,000 ms.
- Automatically retry network failures, HTTP `408`, `429`, and `5xx` responses.
- Do not automatically retry `400`, `401`, `403`, `404`, or `409` responses.
- If a failed/retrying mutation has been superseded locally, stop retrying the obsolete snapshot and schedule only the newest value.
- After the retry budget is exhausted, enter `failed`, keep the latest local selection visible, stop automatic attempts, and expose an explicit `Retry` action.
- Manual retry receives a fresh bounded attempt budget; repeated manual actions require an explicit student action and must not form an automatic infinite loop.

### 5. Explicit retry UI
- Place the compact save status near the practice progress/navigation area so it is visible on desktop and mobile.
- In `failed`, show concise guidance and a `Retry saving` button.
- The retry action sends only the latest unsaved value for each affected item.
- Disable the retry action while a retry is active.
- Preserve the student's local selection throughout retryable and persistent failures.

### 6. Submission barrier and duplicate-submit lock
Submission flow:
1. Acquire a synchronous `submitInFlightRef` lock before awaiting anything.
2. Disable answer inputs, route-leaving actions, Retry, and Submit while the final flush/submission sequence is running.
3. Flush any debounced value into the queue.
4. Wait until the queue has no pending, active, retrying, or failed mutation.
5. If a save reaches persistent failure, do not call `submitPractice()`; show an actionable message and return focus to the save failure/retry control.
6. Call `submitPractice()` exactly once after all latest revisions are acknowledged.
7. Revalidate the summary and transition to results only after submit succeeds.
8. Release the lock only on a recoverable submit failure. Do not allow another local submit call while the first is unresolved.

If submit returns `409 Session already submitted`, revalidate the summary. If the authoritative summary is `SUBMITTED`, transition to results rather than inviting repeated submission.

### 7. Navigation protection
Activate navigation protection whenever the queue has queued, active, retrying, or failed work, and during the submit transaction.

Required coverage:
- Browser refresh, close, and external navigation through `beforeunload`.
- Same-origin links that leave the current practice route.
- Browser back/forward navigation using a scoped, tested history guard compatible with the installed Next.js version.

Behavior:
- In-app Previous/Next question controls remain available while saving because they do not unmount the session and the queue is session-scoped.
- Route-leaving navigation shows an accessible confirmation explaining that an answer has not been saved.
- `Stay and retry` keeps the student on the practice route and focuses the save status/retry control.
- `Leave without saving` deliberately disarms the guard for that navigation only.
- Do not monkey-patch global Next.js router APIs. Keep the guard scoped to the practice session lifecycle.

### 8. Unmount safety
- Clear retry timers and detach `beforeunload`, click, and history listeners on unmount.
- Mark the queue disposed so late promise completions cannot update React state, announce `Saved`, start another retry, or initiate submission.
- Do not assume aborting a browser request means the backend did not persist it.
- If the student explicitly confirms leaving, no further frontend retries should begin after unmount.

## Components and Files Expected to Change After Approval

Existing files:
- `components/practice-session-content.tsx`
- `components/practice-session-content.test.tsx`
- `app/practice/[id]/page.tsx` only if the navigation guard must be mounted above session content.
- `app/practice/[id]/page.test.tsx` for results-transition and route-navigation coverage.
- `lib/api/client.ts` only if a narrowly scoped request cancellation signal is proven necessary; cancellation must not be treated as proof that a save did not reach the server.

Likely new files:
- `lib/practice-answer-save-queue.ts`
- `lib/practice-answer-save-queue.test.ts`
- `hooks/use-practice-answer-save-queue.ts`
- `hooks/use-practice-answer-save-queue.test.tsx` if hook lifecycle coverage cannot remain clear in the component tests.
- A small practice-specific save status component only if it materially reduces complexity in `PracticeSessionContent`.

No new dependency is expected.

## Mobile Requirements
- The save state must be visible without relying on the desktop-only question sidebar.
- Status and Retry must fit above or near the sticky mobile navigation without covering the answer options.
- `Retry saving` and navigation-confirmation actions should meet the 44 by 44 CSS pixel target where practical.
- Long error messages must wrap without horizontal overflow.
- The student must be able to continue moving between questions while the session-level queue saves in the background.

## Accessibility Requirements
- Use a persistent text status; do not communicate state by color or spinner alone.
- Announce `Saving`, `Saved`, and `Retrying` through a polite live region.
- Announce persistent `Save failed` through an assertive alert or equivalent immediately discoverable error treatment.
- Avoid announcing every keystroke or intermediate queued revision. Announce state transitions only.
- The Retry button must have a clear accessible name and visible focus state.
- When submission is blocked by a save failure, move focus to the error/retry region.
- The route-leaving confirmation must be keyboard operable, trap focus while open, restore focus when cancelled, and identify the unsaved-work consequence.
- Busy regions and disabled controls should expose `aria-busy`/disabled semantics where appropriate.

## Data and API Dependencies

Existing endpoints only:
- `GET /api/practice/:id/answers`
- `PATCH /api/practice/:id/answers`
- `POST /api/practice/:id/submit`
- `GET /api/practice/:id/summary`

Existing save payload remains unchanged:
```json
{
  "answers": [
    {
      "practice_item_id": 7,
      "answer_type": "MCQ",
      "selected_option_label": "A"
    }
  ]
}
```

Do not add revision, mutation, idempotency, or delete fields to requests without a documented backend change from Tawsif.

## Frontend Work That Can Be Completed Now
- Implement a deterministic, single-active-request queue for one practice session.
- Coalesce rapid local changes and preserve the latest visible local answer.
- Prevent stale SWR/server snapshots from overwriting newer local revisions.
- Add honest Saving, Saved, Retrying, and Save failed states.
- Add bounded retry behavior and explicit manual retry.
- Drain the queue before submit and block submission on persistent save failure.
- Add a synchronous duplicate-submit lock.
- Add scoped navigation protection and unmount cleanup.
- Add accessible live announcements and focus recovery.
- Add all frontend unit/component tests listed below using controlled promises and fake timers.

## Backend Guarantees Tawsif Must Confirm
- Confirm that production has the final practice-answer integrity trigger and unique `practice_item_id` constraint applied.
- Confirm whether answer saving and submission are intended to serialize on the same practice-session lock. Current code does not make that guarantee obvious for independent requests.
- Confirm that retrying an identical MCQ save after an ambiguous timeout is supported and safe.
- Confirm whether a future save response will echo authoritative persisted state or accept a client mutation/revision ID.
- Confirm the intended cross-tab/client conflict rule: last database arrival, last client revision, or another policy.
- Confirm and document how a CQ answer is deleted/cleared before CQ is enabled. The current API rejects empty CQ text.
- Confirm that `409 Session already submitted` is the stable duplicate-submit response and that summary revalidation is the supported recovery path.

These confirmations do not block the same-tab frontend queue, but they block claims of cross-client last-write-wins safety.

## Residual Risks Frontend Code Alone Cannot Eliminate
- A second browser tab or another client can send an older answer after this queue's latest save and overwrite it because the backend has no revision precondition.
- A timeout can be ambiguous: the backend may have committed the answer even when the client receives no success response.
- `{ saved: true }` does not prove which value is currently persisted after concurrent writers.
- A forced browser/process termination can interrupt an unsaved request despite navigation protection.
- The frontend cannot make CQ clearing truthful until the backend supports deletion or an explicit empty-answer representation.
- A save and submit initiated by separate clients can still race outside the single frontend queue.
- The current plan deliberately avoids durable offline answer storage; recovery is limited to the mounted session and confirmed server answers after reload.

## Test Plan

### Pure queue tests
- **Rapid answer changes:** enqueue A, B, C for the same item; assert the latest queued successor is C and at most one request is active.
- **Slow save:** hold the first promise; assert later mutations remain queued, UI state remains `saving`, and concurrency never exceeds one.
- **Failed save:** reject a retryable request; assert the local answer remains visible and state does not become `saved`.
- **Retry success:** fail initial attempts, advance fake timers, resolve a bounded retry, and assert `retrying` then `saved` for the latest revision.
- **Persistent failure:** exhaust exactly three total attempts; assert no further timers/requests, `failed`, and explicit retry availability.
- **Stale response ordering:** resolve an older revision after a newer local change; assert the newer local value remains visible and only its later acknowledgement can produce `saved`.
- **Per-item coalescing:** change one item repeatedly while another item is queued; assert deterministic FIFO item order and latest-value coalescing.

### Component and integration tests
- **Submission during pending save:** click Submit while a save is unresolved; assert `submitPractice()` is not called until the queue drains.
- **Submission after failed save:** exhaust retries; assert submission is blocked, the error is announced, and focus reaches Retry.
- **Double submission:** dispatch two submit interactions before React rerenders; assert exactly one submit API call.
- **Duplicate submission response:** return `409`, revalidate summary, and show results when the session is already authoritative `SUBMITTED`.
- **Navigation during saving:** attempt a route-leaving link, browser unload, and back navigation; assert the guard activates while in-session Previous/Next remains available.
- **Unmounting during a request:** unmount before resolution; assert timers/listeners are removed, no later retry begins, and no late `Saved` announcement/state update occurs.
- **Server baseline reconciliation:** deliver an older `GET answers` snapshot after a local change; assert it does not overwrite the newer local answer.
- **Visible states:** verify Saving, Saved, Save failed, and Retrying text and live-region behavior.
- **Manual retry:** after persistent failure, click Retry; assert only the latest unsaved answer is sent and success transitions to Saved.
- **Results transition:** assert results render only after save drain and successful submission/summary revalidation.
- **Accessibility:** verify live-region roles, focus movement, keyboard operation, confirmation-dialog labels, and no announcement spam during rapid changes.

Use Vitest fake timers and manually controlled deferred promises. Tests must not depend on real time, real network latency, or nondeterministic request scheduling.

## Acceptance Criteria
1. One practice session has no more than one active answer-save request from this queue at any time.
2. Rapid changes are coalesced without losing the latest local selection.
3. An older response or server snapshot cannot visually replace a newer local answer.
4. Saving, Saved, Retrying, and Save failed states are visibly and accessibly communicated.
5. Saved is shown only after all current local revisions are successfully acknowledged.
6. Automatic retries are bounded to two retries after the initial attempt and never loop indefinitely.
7. Persistent failure exposes a working explicit Retry action and preserves the latest local value.
8. Submit waits for all latest answer saves and is not sent if any required save remains failed.
9. Two rapid submit interactions create only one frontend submit request.
10. Route-leaving navigation is guarded while work is unsaved, pending, retrying, failed, or submitting.
11. Unmount cleanup prevents late UI updates, announcements, retries, or submission.
12. The existing authenticated session/results flow continues to use only current endpoints and payloads.
13. All specified reliability tests pass, followed by the repository's lint, TypeScript, full test, and production-build verification commands during implementation.

## Out of Scope
- Backend source, route, controller, service, model, migration, schema, or database changes.
- `CONTRACTS/` changes.
- New API fields, mutation IDs, revision IDs, delete semantics, or endpoints.
- Enabling CQ or Mixed Practice during the MCQ-only beta.
- Changing scoring, question generation, answer correctness, results fields, authentication, entitlements, pricing, or subject availability.
- Durable offline synchronization across browser restarts.
- Cross-tab coordination presented as authoritative without backend revision support.
- Redesigning the practice page beyond the save/retry/submission/navigation states needed for reliability.

## Tawsif Coordination Notes
- Frontend implementation can safely serialize same-tab saves now without backend changes.
- Do not describe the result as globally last-write-wins until Tawsif confirms or implements server-side revision ordering.
- The current upsert makes identical retry payloads converge on the same value, but it is not a formal idempotency contract.
- The current submit transaction provides strong duplicate-submit protection, but answer saves do not visibly take the same session lock.
- The current save acknowledgement is non-authoritative. Future revision/mutation support would materially strengthen multi-client correctness.
- CQ deletion remains a backend requirement for later CQ availability and must not be simulated as successful in the frontend.

## Implementation Sequence After Approval
1. Add pure queue types, reducer/state machine, coalescing, bounded retries, flush, and disposal behavior with unit tests.
2. Add the React hook that owns the session queue, baseline/local overlay, live state, and cleanup.
3. Integrate local answer selection and status/retry UI into `PracticeSessionContent`.
4. Replace per-save SWR revalidation with safe baseline reconciliation.
5. Add submit flush and synchronous duplicate-submit locking.
6. Add scoped navigation protection and accessible confirmation/focus behavior.
7. Add the required component and route tests.
8. Run `npm run lint`, `npx tsc --noEmit`, targeted tests, `npm test`, and `npm run build`.
9. Reinspect the final diff for frontend-only scope and document any remaining backend-dependent risk.
