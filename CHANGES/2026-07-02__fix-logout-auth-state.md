# Change Brief

## Context
Logging out from protected pages can leave client components rendering with cleared auth state while protected data is unavailable. On the chapter selection route, that can call the not-found path before the login redirect completes. Practice pages can also make authenticated SWR requests after logout and show misleading missing-session states.

## Goal
Protected pages should redirect or hold an unauthenticated interim state after logout instead of rendering 404/not-found states or stale authenticated data.

## In-scope
- Fix protected route guards for subject detail and practice session pages.
- Gate authenticated practice SWR hooks with an enabled flag.
- Clear auth-scoped SWR cache entries on logout.
- Add focused tests for logout/auth-state behavior.

## Out-of-scope
- Adding backend logout/session revocation.
- Changing API endpoints, payloads, or backend contracts.
- Refactoring unrelated routing, data fetching, or UI.

## Affected area
- Frontend
- Files/modules involved: auth context, protected route pages, practice API hooks, focused tests.

## Contract impact
- No contract change

## Data impact
- None

## Risks
Protected routes could show a loading/interim state too long if auth state is not resolved correctly. SWR cache clearing must avoid clearing public data unnecessarily.

## Tests to update
- Unit: Auth logout cache cleanup.
- Integration: Protected route unauthenticated states for subject detail and practice pages.
- UI: Not configured separately.
