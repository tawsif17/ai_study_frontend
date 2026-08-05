# Change Brief

## Status
Done

## Context
Signup collects class but not academic group or curriculum version, Profile cannot display those values, and the authenticated Subjects screen renders the entire hardcoded beta presentation list even when the API catalog is narrower.

## Goal
Collect the two required learning-context values, enforce the shared API contract, display them on Profile, and render only compatible authenticated subjects with a Bangla coming-soon state.

## In-scope
- Registration types, runtime validation, payload wiring, and accessible signup controls.
- Authenticated user response validation and Profile display.
- Authenticated subject-card filtering and the Bangla empty state.
- Shared-contract synchronization and automated-test updates.

## Out-of-scope
- Bengali questions or translated UI/catalog content.
- Profile editing, learner-enrollment flows, or new exam types.
- Changes to the unauthenticated subject preview, pricing, or practice behavior.
- Expansion of the frontend class options beyond Classes 9 and 10.

## Affected area
- Frontend
- Shared API types/contracts, signup, Profile, Subjects, fixtures, and tests.

## Contract impact
- Contract change: registration requires `academicGroup` and `curriculumVersion`; authenticated user objects require `academic_group` and `curriculum_version`; subject-list behavior is personalized by the backend.

## Data impact
- None in the frontend; it consumes and submits the backend data shape.

## Risks
- Strict user fixtures and response parsing can fail if not updated consistently.
- The hardcoded beta presentation list can accidentally reintroduce subjects omitted by the backend.
- New controls can regress signup validation, loading, retry, or accessibility behavior.

## Tests to update
- Unit: strict request/response parsing and display formatting.
- Integration: registration payload and authenticated catalog behavior.
- UI: required selects, disabled/error states, Profile fields, group filtering, Bangla empty state, accessibility.

## Grounding summary
- Signup currently submits identity, school, district, and a Class 9 or 10 selection through a strict registration contract.
- The frontend `AuthUser` shape currently includes `student_class` but no group or curriculum version.
- Profile currently displays email, school, class, and city as read-only account details.
- The unauthenticated Subjects page intentionally shows a static preview of Mathematics, Physics, and Chemistry.
- The authenticated Subjects page loads `/api/subjects` but currently renders every beta presentation card instead of intersecting with the returned catalog.
- The change must require canonical group and version selections, submit them, validate returned values, and display them on Profile.
- Authenticated cards must follow the backend catalog, while Bangla users with an empty catalog receive the agreed English-only coming-soon message.
- The public preview, existing class options, district recovery, auth/session behavior, pricing, practice flows, and Bengali content must not change.
