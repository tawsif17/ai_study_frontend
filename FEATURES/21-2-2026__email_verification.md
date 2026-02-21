# Email Verification Frontend

## Status
proposed

## Problem
Users can register but cannot complete email verification in the frontend flow, even though backend contracts require verification before login issues JWT.

## Scope
- Add email verification screen for token-based verification.
- Add resend-verification screen/form for users who did not receive or lost the original link.
- Integrate with existing auth UX (signup/login messaging and redirects).

## Screens/routes
- `GET /verify-email?token=<token>`
- `GET /resend-verification`
- `app/signup/page.tsx`: after successful signup, include guidance and CTA to `/resend-verification`.
- `app/login/page.tsx`: when backend returns unverified error (`401` + `Email verification required`), show CTA to `/resend-verification` and optionally prefill email.

## Exact endpoints used
Source: `project_docs/CONTRACTS/api.md`

1. `POST /api/auth/verify-email`
- Auth: none
- Request schema: `project_docs/CONTRACTS/schemas/auth.verify-email.post.json#/properties/request`
- Request body: `{ "token": "string" }`
- Success: `200`
- Success schema: `project_docs/CONTRACTS/schemas/auth.verify-email.post.json#/properties/response`
- Error statuses: `400`, `429`, `500`
- Example error messages from contracts:
  - `Invalid verification token`
  - `Verification token expired`
  - `Verification token already used`
  - `Email already verified`
  - `Too many requests. Please try again later.`

2. `POST /api/auth/resend-verification`
- Auth: none
- Request schema: `project_docs/CONTRACTS/schemas/auth.resend-verification.post.json#/properties/request`
- Request body: `{ "email": "string" }`
- Success: `200`
- Success schema: `project_docs/CONTRACTS/schemas/auth.resend-verification.post.json#/properties/response`
- Error statuses: `400`, `429`, `500`
- Example messages from contracts:
  - Success: `If the account is eligible, a verification email has been sent.`
  - `Invalid email address`
  - `Too many requests. Please try again later.`

## UX states (loading/empty/error/success)

### Route: `/verify-email?token=<token>`
- Loading:
  - Initial page load while parsing query and sending `POST /api/auth/verify-email`.
  - Disable actions; show progress text (e.g., "Verifying your email...").
- Empty:
  - Missing `token` query param.
  - Show explicit state: "Verification token is missing." with primary CTA to `/resend-verification`.
- Error:
  - `400` invalid/expired/used/already-verified -> show server message; keep CTA to `/resend-verification`.
  - `429` -> show rate-limit message and retry guidance.
  - `500`/network failure -> generic retryable error.
- Success:
  - `200` + backend message.
  - Show success confirmation and primary CTA to `/login`.

### Route: `/resend-verification`
- Loading:
  - While submitting `POST /api/auth/resend-verification`, disable form submit.
- Empty:
  - Initial untouched form state with email input + submit button.
- Error:
  - `400` invalid input -> show inline/server message.
  - `429` -> show cooldown/rate-limit message.
  - `500`/network failure -> generic retryable message.
- Success:
  - `200` always generic success message; display it as-is.
  - Keep user on page with option to return to login.

## Validation rules (mirror schemas)
Source:
- `project_docs/CONTRACTS/schemas/auth.verify-email.post.json`
- `project_docs/CONTRACTS/schemas/auth.resend-verification.post.json`

1. Verify email request
- Body is required.
- `token` is required.
- `token` type: `string`.
- No additional body fields allowed (`additionalProperties: false`).
- Query must be empty object when used by API contract (`additionalProperties: false`).

2. Resend verification request
- Body is required.
- `email` is required.
- `email` type: `string`.
- No additional body fields allowed (`additionalProperties: false`).
- Query must be empty object when used by API contract (`additionalProperties: false`).

3. Response handling contract
- Success payloads require:
  - `success: true`
  - `data.message: string`
- Error payloads follow common error format in contracts:
  - `success: false`
  - `error.message: string`

## Tests to add

1. Unit tests: API layer
- Add tests for `verifyEmail(token)` request shape (`POST`, exact path, exact body).
- Add tests for `resendVerification(email)` request shape (`POST`, exact path, exact body).
- Add tests that no unexpected fields are sent.

2. Route/component tests: `/verify-email`
- Missing token renders empty state and resend CTA.
- Valid token triggers API call once on load and renders success state.
- Contracted `400` messages render correctly (invalid/expired/used/already-verified).
- `429` renders rate-limit state.
- `500` or network failure renders generic error with retry action.

3. Route/component tests: `/resend-verification`
- Initial empty state renders email input and disabled/enabled submit behavior.
- Submitting valid input shows loading then success message from response.
- `400` message renders inline.
- `429` message renders correctly.
- `500`/network failure path renders generic fallback.

4. Integration tests: auth flow
- Signup -> verification guidance visible.
- Login unverified response (`401` + `Email verification required`) shows resend-verification CTA.
- Verify success path leads user to login CTA and can proceed with login afterward.

## Out of scope
- Backend endpoint changes.
- Token generation/expiry policy changes.
- Email template/content changes.
