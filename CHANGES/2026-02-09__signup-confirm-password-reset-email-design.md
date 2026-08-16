# Change Brief

## Status
Done

## Context
Signup currently collects a password once, so a typing mistake is only discovered after registration or login fails.

## Goal
Require users to confirm their password locally before submitting the existing registration request.

## In-scope
- Add and validate an accessible Confirm Password field.
- Preserve the current registration request payload.
- Update focused signup UI tests.

## Out-of-scope
- Backend registration behavior or validation.
- API contracts, shared request types, database changes, and unrelated signup redesigns.

## Affected area
- Frontend
- Signup form and signup page tests.

## Contract impact
- No contract change.
- Confirm Password is client-only and is not included in `RegisterRequest`.

## Data impact
- None.

## Risks
- A confirmation value could accidentally be included in the API payload.
- Validation, disabled state, clearing behavior, or accessibility could regress.

## Tests to update
- Unit: empty and mismatched confirmation validation, matching submission, and payload exclusion.
- Integration: loading and success-state field behavior.
- UI: accessible errors and responsive signup layout.

## Grounding summary
- Signup currently collects and validates one password before sending the existing registration payload.
- The current password rule requires at least eight characters with uppercase, lowercase, and a number.
- The confirmation value must remain frontend-only and must never enter `RegisterRequest`.
- An empty confirmation must block registration with an accessible field error.
- A mismatched confirmation must block registration with an accessible field error.
- Both password controls must be disabled during submission and cleared after `201` or `202`.
- Existing registration statuses, API errors, district recovery, and verification guidance must remain unchanged.
- Backend code, contracts, migrations, architecture, and unrelated frontend behavior must not change.
