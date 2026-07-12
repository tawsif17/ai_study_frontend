# Practice Answer Save Reliability Backend / Contract Follow-Up for Tawsif

## Frontend Change Summary

- Updated the authenticated `/practice/[id]` session flow with a deterministic, session-scoped answer-save queue.
- The frontend now keeps at most one answer-save request active per session, coalesces rapid changes to the same item, and preserves the latest local selection over stale answer-list responses.
- Added visible, accessible `Saving`, `Saved`, `Retrying`, and `Save failed` states; automatic retry is bounded to two retries after the initial save attempt, followed by an explicit retry action.
- Submission now waits for all pending saves, blocks on a persistent save failure, and uses a synchronous client lock to avoid duplicate submit requests.
- Added route-leaving, refresh/close, and browser-history protection while saving or submitting.
- The frontend continues to use only the existing answer list, answer save, session submit, and session summary endpoints. No request payload, endpoint, backend, database, or `CONTRACTS/` change was made.

## Current UI Behavior

- On `/practice/[id]`, selecting an MCQ answer updates the visible selection immediately, then saves through the existing frontend API usage.
- The page displays `Saving...` until the current local revision receives a successful save response. It never displays `Saved` optimistically.
- Temporary network and retryable server failures display `Retrying...`; a terminal or exhausted failure displays `Save failed` with `Retry saving`, while retaining the student’s latest local selection.
- The page waits for the existing saved-answer list before enabling practice interaction. If that baseline cannot load, it shows `Unable to load saved answers` and `Retry loading answers`.
- Submit waits for all saves. Once the submit endpoint succeeds, the UI will not issue another submit call even if summary/results revalidation temporarily fails; it instead offers `Retry loading results`.
- The answer queue, save statuses, and navigation guard are connected to existing frontend API calls. They are not mocked or placeholder behavior in the runtime UI. Test doubles are used only in automated tests.
- CQ remains shared-code-path support only; the current beta is MCQ-only. Clearing CQ text is not represented as a successful persisted deletion.

## Backend Data Needed Later

| Field name | Description | Example value | Required or optional | Screen/component uses it |
| --- | --- | --- | --- | --- |
| `PATCH /api/practice/:id/answers -> data.saved` | Existing acknowledgement that the submitted answer batch was accepted. The frontend treats any non-true value as unconfirmed. | `true` | Required now. | `usePracticeAnswerSaveQueue` and save-status UI. |
| `GET /api/practice/:id/answers -> data.answers[].practice_item_id` | Existing practice-item key for the saved-answer baseline. | `7` | Required now. | Local/server answer reconciliation in `usePracticeAnswerSaveQueue`. |
| `GET /api/practice/:id/answers -> data.answers[].answer_type`, `selected_option_label`, `cq_text`, `updated_at` | Existing persisted answer value and timestamp fields. | `"MCQ"`, `"B"`, `"2026-07-13T10:00:00.000Z"` | Required now for baseline display; `updated_at` is informational today. | `PracticeSessionContent` answer state. |
| `GET /api/practice/:id/summary -> data.attempt_status` | Existing authoritative submitted state used to transition to results. | `"SUBMITTED"` | Required now. | Practice wrapper and results transition. |
| `POST /api/practice/:id/submit -> 409 SESSION_ALREADY_SUBMITTED` | Existing duplicate-submit recovery signal. | HTTP `409` | Required now. | Submit recovery and summary revalidation. |
| Future save response `practice_item_id`, persisted answer value, `updated_at`, and server revision or accepted mutation ID | An authoritative acknowledgement tied to one answer mutation. This would make cross-tab and out-of-order conflict handling observable. | `{ "practice_item_id": 7, "selected_option_label": "B", "revision": 42 }` | Optional for current same-tab beta; required for stronger multi-client guarantees. | Future queue reconciliation and conflict handling. |
| Future CQ deletion representation | Explicit way to persist a cleared CQ answer. | `{ "deleted": true }` or documented empty-answer semantics | Optional until CQ is enabled; required before CQ launch. | Existing CQ textarea path. |

## Current Assumptions

- `PATCH /api/practice/:id/answers` accepts the current answer payload only and returns `{ saved: true }` after a successful upsert.
- Retrying an identical MCQ answer is safe enough for same-tab recovery: the current upsert converges on the same value, although it is not a formal request-idempotency guarantee.
- `practice_item_id` is unique in persisted answers and answer integrity checks are active in production.
- `POST /api/practice/:id/submit` is transactional and a second submission returns `409 Session already submitted`.
- A queued same-tab save is drained before this frontend sends its submit request. This does not serialize saves or submits initiated in another client or browser tab.
- The existing save response does not identify the persisted value, mutation, or revision; the frontend therefore does not claim cross-client last-write-wins correctness.
- CQ empty text remains invalid until the backend provides a deletion contract.

## CONTRACTS/ Status

**CONTRACTS/ likely stale; needs Tawsif review.**

The frontend is using backend behavior that includes answer upsert acknowledgement, answer-list `updated_at`, transactional submission, and duplicate-submit recovery. The current reliability feature also depends on their precise error semantics. No contract files were changed in this work.

## Backend Questions for Tawsif

- Can you confirm that the production database has the unique `practice_item_id` constraint and final answer-integrity trigger applied?
- Is retrying an identical MCQ `PATCH /api/practice/:id/answers` request after an ambiguous timeout explicitly supported in production?
- Are answer saves and session submission intended to serialize on the same practice-session lock? Current behavior does not make that guarantee for independent requests.
- Is `409 Session already submitted` with `SESSION_ALREADY_SUBMITTED` the stable contract for a duplicate submit or a save after submission?
- Can a future save response echo the persisted item/value and provide a server revision or accepted client mutation ID?
- What cross-tab conflict policy should be documented: last database arrival, last client revision, or another rule?
- Before CQ is enabled, what request and response semantics should persist clearing a CQ answer?
- Are the current answer list and summary fields fully documented in `CONTRACTS/`, including `updated_at` and `attempt_status`?

## Risk if Not Updated

- Same-tab autosave remains reliable, but a second browser tab or client can still overwrite an answer based on database arrival order because no server revision precondition exists.
- A timeout remains ambiguous: the save may have persisted even when the frontend never receives `{ saved: true }`.
- The frontend can recover from the known duplicate-submit response, but undocumented 409/error variations can produce an incorrect error or results-retry state.
- CQ must remain unavailable; otherwise clearing an answer can look unsaved because the current backend rejects empty CQ text.
- If production integrity constraints or triggers differ from inspected backend source, answer validation and save-after-submit protection can diverge from frontend expectations.
- Stale contracts can lead future frontend work to add unsupported request fields such as revisions or deletion flags.

## Recommended Backend/Docs Action

- **No backend action needed** to ship the current same-tab MCQ save queue, provided the existing production behavior and database safeguards are confirmed.
- **Confirm existing endpoint:** verify the production behavior of `GET/PATCH /api/practice/:id/answers`, `POST /api/practice/:id/submit`, and `GET /api/practice/:id/summary`, especially their success and 409 semantics.
- **Update CONTRACTS/:** document the existing answer-list fields, `{ saved: true }` acknowledgement, submitted-session error behavior, and the fact that unknown answer payload fields are rejected.
- **Needs discussion:** agree on the cross-client conflict rule and whether server revisions or mutation IDs are needed before claiming multi-tab/client ordering guarantees.
- **Add missing response field only if approved:** return authoritative persisted answer data plus a server revision or accepted mutation ID from answer saves.

### Tawsif Task Workflow

1. Verify the production migration state: unique `practice_item_id` constraint and answer-integrity/write-protection trigger.
2. Exercise the existing answer save, answer list, summary, and submit endpoints against a deployed or staging session; record success, timeout/retry, 409, and submitted-session behavior.
3. Reconcile those observed behaviors in `CONTRACTS/` without changing frontend request payloads.
4. Decide and document the cross-client conflict rule. If backend ordering must be authoritative, design and approve a revision or mutation-ID contract before implementing it.
5. Before enabling CQ, define and document a CQ deletion representation, validation, and response behavior.
