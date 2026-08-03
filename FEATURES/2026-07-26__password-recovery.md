# Password Recovery

## Status

done

## Problem

Students who forget their password need a secure, understandable way to request a reset email and set a new password without exposing whether an account exists.

## Scope

- Add `/forgot-password` with an email form that calls `POST /api/auth/forgot-password`.
- Normalize submitted email addresses and show the backend's generic success response without revealing account eligibility.
- Apply a persisted 60-second client-side cooldown per normalized email; backend rate limiting remains authoritative.
- Add `/reset-password?token=<token>` that calls `POST /api/auth/reset-password` with `{ token, newPassword }`.
- Remove the reset token from browser history immediately after it is read.
- Provide password requirements, confirmation validation, accessible field errors, recovery states for invalid/expired/used reset links, and a non-immediate 429 recovery state.
- Add a `Forgot password?` link to Login.
- Add strict API request/response validation, noindex route metadata, and robots exclusions.

## Out of scope

- Backend endpoints, database migrations, reset-token generation, expiry rules, email delivery, rate-limit policy, or stable error-code changes.
- Password recovery by SMS, code entry, authenticated password changes, session/device management, or cookie-based sessions.
- Authoritative `Retry-After` handling; the current backend does not provide it.

## Acceptance criteria

- A student can request a reset link from Login through `/forgot-password`.
- Forgot-password success stays generic and does not disclose whether an account exists.
- A student can set a compliant, confirmed new password through `/reset-password`.
- The reset token is removed from the visible browser URL before the reset request is sent.
- Invalid, expired, and used tokens direct the student to request a new link; transient errors offer retry; 429 does not offer immediate retry.
- Login, forgot-password, and reset-password pages are keyboard-accessible and excluded from search indexing.

## Verification

- `npm run lint` passed.
- `npx tsc --noEmit --incremental false` passed.
- Full coverage passed: 45 test files and 295 tests, with 87.43% statements, 79.90% branches, 83.23% functions, and 89.84% lines.
- Forgot-password branch coverage is 82.75%; reset-password branch coverage is 90.90%.
- Recovery tests cover invalid email, safe network/server errors, persisted cooldown restoration, missing tokens, password mismatch, unchanged passwords, permanent token failures, rate limiting, and successful transient-error retry.
- Local `npm run build` passed with public HTTPS test values; Inter is packaged locally, so production builds no longer download Google Fonts.
- All 9 serial Playwright assertions passed against the local production bundle, including the complete mocked password-recovery journey.
- The Playwright-managed production server now shuts down cleanly after the suite; `npx playwright test --workers=1` exits normally.
- Runtime response validation now also covers practice generation, summaries, items, answers, submission, results, progress, revision lists, revision summaries, and bookmark actions.

## Risks

- Reset-error mapping temporarily relies on documented backend message text until stable backend error codes are available.
- The client cooldown is advisory only; the backend's in-memory rate limit is the source of enforcement.
- The reset token exists in the inbound URL until client-side JavaScript runs. The route removes it immediately after hydration; a server-side token exchange would require backend support.

## Open questions

- When will password-recovery errors include stable machine-readable codes and `Retry-After` data?
- Should the backend move from bearer tokens in local storage to Secure HttpOnly cookie sessions with session revocation controls?
