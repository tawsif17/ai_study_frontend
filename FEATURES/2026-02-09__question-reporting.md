# Question Reporting Frontend Brief

## Summary
Add an authenticated frontend path for learners to report published questions for review using the latest contract in `project_docs/CONTRACTS/`: `POST /api/questions/:id/reports`.

Contract source note: this frontend repo does not currently have a root `CONTRACTS/` directory. The available synced contracts are under `project_docs/CONTRACTS/`.

## Screens
- `/practice/[id]` while a session is in progress: add report affordance on the currently displayed question.
- `/practice/[id]` after submission/results view: add report affordance on each result question card.
- Reusable report dialog/sheet component opened from those screens, with reason selection, optional details, submit, cancel, and success/error feedback.

## UX states
- Loading: disable report trigger and form submit while a report request is in flight; show submitting copy or spinner in the submit button.
- Empty: do not render the report action when no current question/result item exists or the question ID is unavailable.
- Error: show backend error messages from the common error body, including validation, unauthorized, duplicate, not found, rate limit, and unexpected failures.
- Success: close or reset the form after submission and show the returned `data.message`; keep the current practice/results context unchanged.

## API usage
- Endpoint: `POST /api/questions/:id/reports`
- Auth: required `Authorization: Bearer <JWT>` via existing `apiClient` `requiresAuth: true`.
- Path params:
  - `id`: string route parameter in the contract; frontend can pass the numeric `question_id` as a path segment string.
- Query: empty object; do not send query params.
- Request body:
  - `reason_code` required.
  - `details` optional.
- Allowed `reason_code` values:
  - `OUT_OF_SYLLABUS`
  - `NO_CORRECT_ANSWER`
  - `WRONG_ANSWER`
  - `UNCLEAR_QUESTION`
  - `TYPO`
  - `OTHER`
- Success response `201`:
  - `id: number`
  - `question_id: number`
  - `reason_code`
  - `status: "OPEN" | "REVIEWED" | "RESOLVED" | "DISMISSED"`
  - `message: string`
  - `created_at: string`
- Error statuses to handle:
  - `400` invalid request/reason/details
  - `401` missing/invalid auth
  - `404` question not found
  - `409` duplicate open report by same user/question/reason
  - `429` rate limited
  - `500` unexpected failure

## Validation
- Mirror backend schema in `lib/api/contracts.ts` before UI wiring.
- Use a strict request validator that rejects extra fields.
- Require `reason_code` and restrict it to the six contract enum values.
- Trim `details` before sending; omit it if blank.
- Enforce `details` max length of 1000 characters in UI and contract validator.
- Do not invent client-only reason codes or send display labels to the API.
- Do not allow submit without a valid question ID.

## Tests
- UI:
  - Report trigger renders in practice session for current question without exposing database IDs as visible learner text.
  - Report trigger renders in results cards for each result item.
  - Dialog requires a reason, enforces details max length, disables submit while loading, and shows success/error messages.
  - Unauthorized/duplicate/rate-limit backend messages are visible and actionable.
- Integration:
  - API function calls `POST /questions/:id/reports` with `requiresAuth: true`.
  - Payload contains only `reason_code` and optional trimmed `details`.
  - Contract validator accepts valid examples from `project_docs/CONTRACTS/examples/questions.reports.post.request.json`.
  - Contract validator rejects missing reason, invalid reason, details over 1000 characters, and extra fields.

## Implementation Plan
1. Add contract types for question reports in `lib/api/types.ts`.
2. Add strict question report request validation in `lib/api/contracts.ts`.
3. Add `reportQuestion(questionId, data)` to `lib/api/index.ts` using the existing `apiClient`.
4. Build a reusable `QuestionReportDialog` component with accessible labels, radio/select reason options, optional details, loading, success, and error states.
5. Wire the dialog into `PracticeSessionContent` using the current item `question_id`.
6. Wire the dialog into `PracticeResultsContent` using `item.question.id`.
7. Add or update Vitest coverage for validators, API wiring, session UI, and results UI.
8. Run `npm run lint` and `npm run test`; run `npm run build` if implementation changes touch routing or shared API contracts.
