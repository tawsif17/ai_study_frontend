# Practice Page Backend / Contract Follow-Up for Tawsif

## Frontend Change Summary
- Updated the public `/subjects` Practice Page to show the approved closed-beta subject preview: General Math, Physics, and Chemistry.
- Added static subject presentation data for the approved labels, topic summaries, visual treatments, order, and `MCQ practice available` copy.
- Kept public visitors out of the protected subject-catalog request.
- Preserved the selected subject through the existing login `next` flow, then resolves the authenticated catalog subject ID before navigating to the existing `/subjects/[id]` chapter-selection route.
- Added loading, protected-catalog error, empty-catalog, and unmatched-selection recovery states.

## Current UI Behavior
- Unauthenticated visitors can view the complete three-card Practice Page without a backend request for subjects.
- The three subject cards, topic summaries, visual styles, and MCQ-availability statement are static approved beta presentation data, not backend data.
- Selecting `Start Practice` while signed out uses the existing frontend auth-gated link and takes the user to login with the selected subject encoded in the local `next` path.
- After login, the frontend calls its existing authenticated `GET /api/subjects?exam_type=SSC` usage through `useSubjects("SSC", true)`, matches the selected subject from the returned catalog, and redirects to `/subjects/[id]`.
- A signed-in visitor who opens `/subjects` without a saved selection sees the same approved static cards after the authenticated catalog state resolves.
- No public subject-catalog endpoint, subject IDs, or new backend behavior was added.

## Backend Data Needed Later
| Field name | Description | Example value | Required or optional | Screen/component |
| --- | --- | --- | --- | --- |
| `data.subjects[].id` | Existing catalog identifier used to navigate to the selected subject's chapter-selection route. | `12` | Required for post-login resume. | `SubjectsContent` redirect to `/subjects/[id]`. |
| `data.subjects[].name` | Existing catalog name used to match the saved public-preview selection to an authenticated subject. | `"Physics"` or the confirmed General Math name. | Required for post-login resume. | `findCatalogSubjectForBetaKey` in `lib/beta-subjects.ts`. |

No new response fields are required for the approved beta UI. Subject topic summaries, visual treatments, display order, and `MCQ practice available` copy are intentionally static frontend presentation data for now.

## Current Assumptions
- The authenticated `GET /api/subjects?exam_type=SSC` response contains the existing `data.subjects` list with stable `id` and `name` values.
- The three approved beta subjects remain General Math, Physics, and Chemistry.
- The backend's General Math catalog name remains distinguishable from other math subjects. The temporary resolver currently treats a catalog name containing `math` as the General Math match, while Physics and Chemistry use exact normalized names.
- The existing login flow preserves the local `next` path and query string through authentication.
- The backend continues to protect the subject catalog; public visitors use static preview cards rather than a live public catalog.
- MCQ availability for the three approved beta subjects remains accurate while this statement is static.

## CONTRACTS/ Status
**CONTRACTS/ likely stale; needs Tawsif review.**

The current backend route applies `authMiddleware` to `GET /api/subjects?exam_type=SSC`, but the existing contract documentation describes this endpoint as unauthenticated. The response envelope currently contains `success` and `data`, with `data.exam_type` and `data.subjects`.

## Backend Questions for Tawsif
- Should `GET /api/subjects?exam_type=SSC` remain authenticated for beta and production? If so, please correct the contract documentation accordingly.
- What exact active catalog `name` values should the frontend expect for General Math, Physics, and Chemistry?
- Can the backend confirm that all three approved subjects have active MCQ content for beta, so the static availability statement remains valid?
- If another math subject is active later, should the catalog expose a stable subject code/slug that the frontend can use instead of matching a display name?
- Is any per-subject availability or entitlement field planned for the catalog response after beta? It is not required for the current static three-card preview.

## Risk if Not Updated
- If the catalog name for a selected beta subject changes or another math subject is introduced, the post-login resolver can show its recovery state instead of opening the intended subject.
- If the endpoint's authentication requirement remains undocumented, future frontend work can accidentally attempt to load the catalog for public visitors.
- If MCQ content availability changes without a frontend update, the static `MCQ practice available` statement can become inaccurate.
- The page remains visually usable without changes, but it cannot safely derive post-login destinations from invented or hardcoded subject IDs.

## Recommended Backend/Docs Action
- **Update CONTRACTS/** to mark `GET /api/subjects?exam_type=SSC` as authenticated and document its existing response envelope and subject fields.
- **Confirm existing endpoint** behavior, especially the active SSC subject names and IDs for the three beta subjects.
- **Needs discussion** only if the catalog will support multiple math subjects or dynamic per-subject availability after beta; a stable subject code/slug would remove display-name matching ambiguity.
- **No backend action needed** for the current public static preview or the approved login-resume flow.
