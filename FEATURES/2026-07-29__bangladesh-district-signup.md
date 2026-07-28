# Searchable Bangladesh District Signup

## Status

done

## Problem

Registration previously accepted free-text `city` values. The backend contract now requires an
exact canonical Bangladesh district returned by `GET /api/locations/districts`.

## Scope

- Load and strictly validate the canonical 64-district response.
- Replace signup city free text with an accessible searchable, scrollable district combobox.
- Submit the selected district unchanged through the existing `city` registration field.
- Recover from district-list failures and stale invalid-district registration responses.

## Out of scope

- Editing the canonical district set independently of `CONTRACTS/`.
- Adding server-side location search or pagination.
- Changing registration success, verification, or private-beta behavior.
- Changing profile city display or adding profile location editing.

## Screens

- `/signup`

## UX states

- Loading: district selection and form submission are disabled while districts load; other fields
  remain editable.
- Empty: a local search with no matches displays `No district found`.
- Error: a district-load failure shows retry guidance without discarding other form values.
- Success: the combobox closes after selection, restores focus to its trigger, and submits the
  exact selected district as `city`.
- Stale data: the exact invalid-district registration error clears the selection, refreshes the
  list, and associates the error with the district field.

## API usage

- `GET /api/locations/districts`
  - Public request with no query or body.
  - Required success envelope: `{ success: true, data: { districts: DistrictName[] } }`.
  - `districts` contains exactly 64 unique canonical English names in ascending order.
- `POST /api/auth/register`
  - Existing payload is unchanged.
  - Required fields: `email`, `password`, `fullName`, `school`, `city`, and `studentClass`.
  - `city` must exactly match one returned canonical district.
  - Invalid district response: `400` with `City must be a valid Bangladesh district`.

## Validation

- Mirror the contract enum in the frontend district type and runtime schema.
- Reject missing, unknown, duplicate, reordered, or additional district response data.
- Do not normalize, case-fold, or alter the selected district before registration.
- Search is trimmed and case-insensitive but selection always resolves to the canonical value.

## Tests

- API: exact endpoint/options, strict response parsing, and canonical registration validation.
- UI: loading, retry, filtering, scrolling, empty search, pointer and keyboard selection, focus,
  exact payload, stale-district recovery, and accessibility.
- E2E: load all districts, search and select `Chattogram`, verify the registration request, and
  retry district loading without losing form values.

## Risks

- Duplicating the contract enum is intentional for runtime drift detection and must be updated only
  when `CONTRACTS/` changes.
- A large popup must remain bounded on small viewports and fully keyboard operable.

## Acceptance criteria

- Users never need to scan 64 simultaneously visible options.
- Search filters locally without issuing additional requests.
- Results scroll within a bounded popup.
- Only a canonical district can be submitted.
- District loading and stale-data failures are recoverable and accessible.
- Unit, integration, accessibility, build, lint, and browser checks pass.

## Verification

- `npm test` passed: 47 files and 328 tests.
- `npm run test:coverage` passed: 87.87% statements, 80.78% branches, 83.85% functions,
  and 90.14% lines.
- `npm run lint` passed without warnings.
- `npx tsc --noEmit --incremental false` passed.
- `npm run build` passed with public HTTPS test values.
- Playwright passed all 11 Chromium scenarios, including scroll containment, local district search,
  exact registration payload, and district-load retry with preserved form input.
- The existing workspace development server remains available on port 3000; a second dev invocation
  reached ready state before detecting that existing instance.
- `npm run start -- -p 3202` reached ready state against the production build.
- A failed stale-district refresh keeps the obsolete combobox closed until fresh data is available.
- The contracts submodule is pinned to `77f43ae`.
