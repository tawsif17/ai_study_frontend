# Homepage Backend / Contract Follow-Up for Tawsif

## Frontend Change Summary
- Updated the `/` homepage to match the approved SSC practice design.
- Added a static MCQ preview, free-practice and Pro/coming-soon option cards, subject cards, how-it-works steps, and final CTA.
- Updated shared homepage navigation so `Practice` links to `/subjects`; the board-only option links to `/pricing`.
- Changed homepage subject copy to `General Math`, `Physics`, and `Chemistry`.
- Kept footer social links hidden because no production social URLs are available.
- Added homepage coverage for primary copy, navigation targets, static states, and hidden social links.

## Current UI Behavior
- The homepage is static/presentational and makes no direct API request.
- The hero MCQ question, answer state, feature copy, availability badges, subject cards, and coming-soon cards are static UI content.
- `Start free practice` and `View topics` use the existing frontend auth-gated route behavior before entering `/subjects`.
- `Board-only practice` is a static link to `/pricing`; the existing pricing screen owns beta Pro activation through its current API client.
- CQ Practice and Mixed Practice are visible but non-interactive placeholders marked `Coming soon`.

## Backend Data Needed Later

The current homepage does not require backend data to render. The following verified data can support a future dynamic version; do not add homepage API usage unless the product requires it.

| Field name | Description | Example value | Required or optional | Screen/component |
| --- | --- | --- | --- | --- |
| `data.exam_type` | Returned by the existing subject catalog response to identify the selected exam type. | `SSC` | Required when a homepage catalog is scoped to SSC. | Future dynamic subject-card section. |
| `data.subjects[].id` | Stable subject identifier returned by the existing subject catalog. | `5` (numeric subject ID) | Required to route a card to a subject-specific destination. | Future dynamic subject-card action. |
| `data.subjects[].name` | Backend subject display name returned by the existing subject catalog. | `General Math` | Required if subject-card titles stop being static. | Future dynamic subject-card title. |
| `data.user.plan_tier` | Authenticated user's current plan tier in the existing frontend auth model. | `free` or `pro` | Required by the existing pricing activation flow, not by the homepage. | Pricing upgrade button reached from the homepage's board-only link. |
| `data.plan_tier` | Plan tier returned after the protected beta upgrade action. | `pro` | Required by the existing pricing activation flow, not by the homepage. | Pricing upgrade success flow reached from the homepage's board-only link. |

No verified backend field currently identifies board-only questions or provides a board-only practice filter. That is a future product requirement, not a frontend contract assumption.

## Current Assumptions
- Homepage subject names and descriptions are intentionally static and do not claim live catalog availability.
- The `General Math` homepage label is the intended student-facing name; the active backend seed data still needs confirmation before making catalog-driven UI depend on it.
- `/api/subjects` is protected by authentication in current backend code, so the homepage does not fetch it publicly.
- Beta Pro activation is owned by the existing pricing flow, not the homepage. The homepage only sends the user to `/pricing`.
- CQ Practice and Mixed Practice have no implemented practice flow and remain disabled placeholders.
- Board-only practice does not yet have a verified backend selection/filter contract, so the homepage does not promise that the current practice generator can enforce it.

## CONTRACTS/ Status

Classification: `CONTRACTS/ likely stale` and `Needs Tawsif review`.

The homepage has no direct endpoint contract. However, related current backend behavior should be reconciled with docs before a dynamic subject catalog or board-only practice entry point is implemented:

- `GET /api/subjects` is protected by auth middleware in current backend code.
- `POST /api/auth/upgrade-to-pro` is protected and returns `data.message` plus `data.plan_tier`.
- No verified board-only practice request field or response field was found for the homepage to consume.

## Backend Questions for Tawsif
- Does the active SSC subject catalog return `General Math` as `data.subjects[].name`? If not, should the data be renamed at the source or should the frontend maintain an explicit display-name mapping?
- Is there a released or planned backend contract that can reliably limit generated practice to past board questions only? If yes, what route and validated request field should the frontend use?
- Should board-only availability depend on plan tier, question-source coverage, or both?
- Is `POST /api/auth/upgrade-to-pro` intentionally the closed-beta activation flow, with no payment step, and should its response be formally documented as `{ message, plan_tier }` under `data`?
- Should `GET /api/subjects` documentation be updated to show its existing authentication requirement and its current response shape?

## Risk if Not Updated
- The homepage will remain visually correct but static; it will not reflect future subject additions, removals, or catalog availability.
- A backend/frontend name mismatch could show `General Math` on the homepage while catalog-driven pages show a different label.
- The board-only card will continue routing users to pricing rather than starting board-only practice until a verified selection contract exists.
- If API documentation continues to omit the current auth requirement or beta activation response, later frontend work may use stale assumptions and fail for unauthenticated users.

## Recommended Backend/Docs Action
- `Update CONTRACTS/`: document the protected `POST /api/auth/upgrade-to-pro` beta activation response and confirm its intended closed-beta lifecycle.
- `Update CONTRACTS/`: correct `GET /api/subjects` authentication and response documentation to match current backend behavior.
- `Confirm existing endpoint`: verify the production subject catalog's actual `data.subjects[].name` values, especially `General Math`.
- `Needs discussion`: decide whether board-only practice needs a first-class backend filter/source contract before it becomes an active practice CTA.
- `No backend action needed`: the approved static homepage can ship without a homepage endpoint.
