# How It Works Backend / Contract Follow-Up for Tawsif

## Frontend Change Summary
- Rebuilt the public `/how-it-works` page to match the approved SSC beta walkthrough.
- Added static hero, four-step journey, MCQ example, explanation/review cards, availability table, session-review summary, and final CTA presentation.
- Added navigation to existing `/signup`, `/subjects`, and `/pricing` routes only.
- Added focused frontend coverage for the static walkthrough, CTA targets, availability labels, and MCQ example.

## Current UI Behavior
- Any visitor can read the full How It Works page without signing in or making a backend request.
- All content is static, approved beta presentation data: the Physics-Light MCQ example, explanation flow, session-review counts, and availability labels are illustrative and do not represent a live student session.
- `Start free` navigates to the existing signup route, `Choose a subject` navigates to the existing public subject preview, and the Board-only Pro label links to the existing pricing route.
- The page does not read live subjects, questions, practice sessions, entitlements, subscriptions, or progress data.

## Backend Data Needed Later
No backend-supported data is required for the current production beta page.

| Field name | Description | Example value | Required or optional | Screen/component |
| --- | --- | --- | --- | --- |
| Not applicable | The current walkthrough intentionally uses static explanatory values rather than live API data. | `MCQ Practice - Available now` | Not required | All How It Works sections |

If a future version needs dynamic availability or real examples, define a dedicated public-safe response before frontend integration. Do not expose protected student or practice-session data on this page.

## Current Assumptions
- Beta availability is accurately described as MCQ Practice available now, CQ Practice coming soon, Mixed Practice coming soon, and Board-only sets as Pro.
- The example Physics-Light question and session values are illustrative only.
- `/signup`, `/subjects`, and `/pricing` remain valid public navigation destinations.
- Footer social links remain hidden until real destination URLs exist.

## CONTRACTS/ Status
**Not needed for this page.**

The page has no API request, response, validation, authentication, or backend-data dependency. No contract changes are required for the static implementation.

## Backend Questions for Tawsif
- No backend question blocks the current static beta page.
- If availability is expected to change during beta, should the public walkthrough remain manually maintained or eventually receive a dedicated public availability response?
- If real session examples are desired later, what public-safe, non-student-specific data may be shown without requiring authentication?

## Risk if Not Updated
- Nothing breaks in the current implementation because it has no backend dependency.
- The explanatory availability labels can become stale if product availability changes without a frontend copy update.
- Adding live practice, entitlement, or student-session data later without a dedicated contract could accidentally expose protected information or make the public page auth-dependent.

## Recommended Backend/Docs Action
- **No backend action needed** for the current static beta walkthrough.
- **Needs discussion** only if the team wants live availability, content coverage, or real session data on this public page in the future.
- Do not update `CONTRACTS/` unless a future public endpoint or response contract is explicitly introduced.
