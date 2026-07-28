# Secure Cookie Sessions

## Status

done

## Problem

The frontend currently stores a bearer token in `localStorage` and sends it through the
`Authorization` header. The backend contract now uses rotating HttpOnly cookie sessions and
session-bound CSRF tokens, so the existing transport cannot authenticate protected requests or
revoke a session safely.

## Scope

- Replace bearer-token authentication with credentialed cookie requests.
- Keep CSRF tokens in memory and attach them to authenticated unsafe requests.
- Restore sessions through `GET /api/auth/me`.
- Refresh expired access sessions through `GET /api/auth/csrf` and `POST /api/auth/refresh`.
- Revoke the current session through `POST /api/auth/logout`.
- Preserve cross-tab auth synchronization and clear authenticated client caches when a session ends.
- Invalidate local auth state after a successful password reset.
- Update affected auth, protected-route, contact, and logout states and tests.

## Out of scope

- A UI or frontend context method for `POST /api/auth/logout-all`.
- Backend cookie, CORS, session, refresh-rotation, CSRF-signing, or rate-limit policy.
- New endpoints, response fields, or stable error codes not present in the contracts.
- A visual redesign of authentication or account pages.

## Acceptance criteria

- No authentication secret is read from or written to browser storage.
- Every API request that may use cookie authentication sends credentials.
- Authenticated unsafe requests carry a current `X-CSRF-Token`.
- A protected request retries at most once after one deduplicated session refresh.
- An exact CSRF failure retries at most once after token reacquisition; unrelated `403` responses
  remain visible to the caller.
- Initial auth state is determined through `/auth/me`, not a client-readable token.
- Logout revokes the backend session before clearing local state, except that an already-invalid
  `401` is treated as logged out.
- Password reset clears stale auth state in every open tab.
- Loading, indeterminate, error, and success states are accessible and covered by tests.

## Risks

- Credentialed cross-origin requests depend on matching backend CORS and cookie configuration.
- CSRF and refresh recovery relies on exact documented error messages because the API does not
  return stable error codes.
- HttpOnly cookies cannot be inspected by the frontend, so cold-start network failures must remain
  indeterminate until the API responds.

## Open questions

- When will session and CSRF failures expose stable machine-readable error codes?
- Should a later account-security feature expose `POST /api/auth/logout-all`?

## Screens

- Global `AuthProvider` bootstrap and session-recovery banner.
- `/login` successful and unsuccessful session creation.
- `/reset-password` successful all-session revocation.
- Protected routes including `/profile`, `/subjects`, `/practice/[id]`, `/bookmarks`, and
  `/dashboard/weak-areas`.
- `/contact` as anonymous or optionally authenticated.
- Desktop and mobile navbar account menus for current-session logout.

## UX states

- Loading: initial `/auth/me`, login, refresh, CSRF acquisition, and logout keep dependent controls
  disabled or protected content pending.
- Empty/indeterminate: a cold-start transport failure shows recovery UI without redirecting to
  login or claiming a valid session.
- Error: actionable `4xx` messages remain visible; unexpected `5xx`, network, timeout, and contract
  failures use safe generic messaging; logout failure keeps the current UI session.
- Success: login exposes the authenticated account, refresh transparently retries the interrupted
  request, logout clears account state and caches, and password reset returns the user to login.

## API usage

- `POST /api/auth/login`
  - Body: `{ email: string, password: string }`.
  - Success data: `{ user: AuthUser, csrfToken: string }`.
  - Sets HttpOnly access and refresh cookies.
- `GET /api/auth/me`
  - Empty body and query.
  - Requires an active `sb_access` cookie.
- `GET /api/auth/csrf`
  - Empty body and query.
  - Accepts an active access cookie or current refresh cookie.
  - Success data: `{ csrfToken: string }`.
- `POST /api/auth/refresh`
  - Empty body and query.
  - Requires the refresh cookie and `X-CSRF-Token`.
  - Success data: `{ csrfToken: string }` and rotated authentication cookies.
- `POST /api/auth/logout`
  - Empty body and query.
  - Requires the refresh cookie and `X-CSRF-Token`.
  - Success data: `{ message: "Logged out successfully" }`.
- Existing protected safe endpoints use cookie authentication.
- Existing protected `POST`, `PATCH`, `PUT`, and `DELETE` endpoints use cookie authentication plus
  `X-CSRF-Token`.
- `POST /api/contact` remains public; a valid cookie session associates the submission and then
  requires `X-CSRF-Token`.

## Validation

- Request payloads remain strict and reject undocumented additional fields.
- Login, CSRF, refresh, logout, and account responses are parsed against their documented shapes.
- Authentication cookies are never represented in frontend types or JavaScript storage.
- Session recovery occurs only for requests marked as requiring authentication.
- Optional authentication never turns an anonymous contact submission into a required-login flow.
- Only `CSRF token missing or invalid` is treated as a recoverable CSRF `403`.
- `Request origin is not allowed`, entitlement failures, and other `403` responses are not retried
  as CSRF failures.

## Tests

- UI: auth bootstrap, indeterminate recovery, login, asynchronous logout feedback, protected-route
  redirects, password-reset invalidation, and keyboard/announcement behavior.
- Integration: credentialed fetches, CSRF headers, deduplicated acquisition and refresh, one-time
  retry limits, terminal invalidation, optional contact authentication, cross-tab synchronization,
  and authenticated practice mutations.
- E2E: cookie session restoration, access expiry and refresh, CSRF-protected mutations, logout
  synchronization, and password-reset session revocation.

## Verification

- `npm test` passed: 45 files and 312 tests.
- `npm run lint` passed without warnings.
- `npm run build` passed with public HTTPS test values.
- `npx tsc --noEmit --incremental false` passed.
- Playwright passed all 10 Chromium scenarios against the production bundle, including cross-tab
  password-reset revocation.
- `npm run dev` confirmed the existing workspace development server on port 3000.
- `npm run start -- -p 3202` reached ready state against the production build.
- Session termination is serialized with refresh work, stale authenticated responses are rejected,
  and required auth success envelopes are validated strictly.
- The contracts submodule is pinned to merged contract commit `4df591a`.
