# Practice Page Final UI

## Goal
Match the approved Practice Page screenshot on `/subjects` while retaining the current subject-detail and practice-generation flow. The page must be publicly viewable during beta with a static, three-subject SSC preview, then route a signed-in student to their selected subject's existing chapter-selection screen. Unauthenticated students must be taken to login when they select `Start Practice` and resume directly at that selected subject after authentication.

## Screens
- `/subjects` - public Practice Page / subject chooser.
- `/login?next=...` - existing authentication handoff for an unauthenticated selected subject.
- `/subjects/[slug]` - existing authenticated chapter and practice-mode configuration screen.
- Shared navigation and footer as rendered through `PageShell`.

## Screenshot Requirements
- Display a clean white/light-blue Practice Page with the `Practice` navigation item visibly active.
- Show an `MCQ practice available now` badge, the heading `Choose a subject to practice`, introductory copy, and an `Available subjects` heading.
- Render exactly three beta subject cards in this order: General Math, Physics, Chemistry.
- Each card must include a distinct subject icon/tone, `SSC` badge, approved topic summary, `MCQ practice available` row, and a full-width `Start Practice` action.
- Show the centered copy `More SSC subjects will be added as practice content becomes ready.`
- Replace the current large lower marketing section with the compact `New here?` help strip and its `How practice works` action.

Desktop requirements:
- Keep the existing shared desktop navigation, including its active `Practice` state.
- Use a three-column, equally sized subject-card grid.
- Use the screenshot's card hierarchy: icon and text header, topic description, divider, availability row, and primary action.
- `How practice works` links to the existing `/how-it-works` route.
- Preserve the shared footer structure and keep social links hidden until real destinations are available, even though social icons appear in the reference screenshot.

Mobile requirements:
- Keep the existing mobile navigation pattern.
- Stack the subject cards into a single column with full-width `Start Practice` controls.
- Keep the subject icon, badge, title, and topic copy readable without horizontal overflow.
- Stack the help-strip content and its action where necessary; its button must remain easy to tap.
- Preserve clear loading, empty, error, and unauthenticated states at narrow widths.

## Components Likely Involved
Existing components to reuse:
- `PageShell`
- `Navbar`
- `Footer`
- `Button`
- `Badge`
- `Card` / `CardContent`
- `Skeleton`
- Existing subject icons and `AuthGatedLink` pattern where compatible with the final resume behavior.

Existing components to modify:
- `app/subjects/subjects-content.tsx`
- `components/subject-card-detailed.tsx`
- Subject-selection/auth redirect handling on `/subjects`, limited to the approved public-preview and direct-resume behavior.
- Existing `/subjects` page metadata only if its visible subject wording needs alignment with `General Math`.

New components only if necessary:
- A small subject presentation/configuration helper for approved order, icon, topic summary, and display label.
- A focused subject-start link/helper that preserves the chosen public-preview subject through login and resolves the signed-in subject ID before navigating to `/subjects/[id]`.
- A lightweight `New here?` help-strip component if inline page markup would make `SubjectsContent` harder to maintain.

## Data / Backend Dependency
Classification: Uses existing frontend data/API

- Public preview cards:
  - Data needed: approved display name, topic summary, icon/tone, display order, and static beta MCQ availability copy.
  - Current frontend already has it: visual/icon handling exists, but the screenshot-specific topic summaries and order do not.
  - Placeholder/mock/static data acceptable for now: yes. These are approved presentation values for the three closed-beta subjects.
  - Tawsif later: confirm that the active beta catalog still represents General Math, Physics, and Chemistry and that the MCQ availability statement remains accurate.

- Signed-in card actions:
  - Data needed: backend `subject.id` and `subject.name` to navigate to the existing `/subjects/[id]` route.
  - Current frontend already has it: yes, through the authenticated subject catalog.
  - Placeholder/mock/static data acceptable for now: no for the destination ID. Do not hardcode IDs.
  - Tawsif later: confirm active catalog names for the approved three subjects. The frontend may need a deliberate display mapping while backend naming is aligned to `General Math`.

- Unauthenticated direct resume:
  - Data needed: the selected presentation key before login, then authenticated subject catalog data after login to resolve its real ID.
  - Current frontend already has it: the protected catalog and login `next` handling exist; selected-subject resume behavior does not yet exist.
  - Placeholder/mock/static data acceptable for now: only the presentation key and public card copy. The authenticated ID must still come from the catalog.
  - Tawsif later: no new endpoint is needed for the approved frontend flow; verify the three beta subjects' catalog names remain distinguishable for the frontend mapping.

- Subject-specific topic summaries and visual availability are not fields returned by the existing catalog response. They remain frontend presentation data for this beta page.

## API Usage
Current page API behavior:
- The existing frontend calls `GET /api/subjects?exam_type=SSC` through `useSubjects("SSC", isAuthenticated)` only after authentication.
- The current backend route protects `GET /api/subjects` with auth middleware and returns subject IDs and names used for the signed-in destination.
- `/subjects/[id]` already owns its own downstream catalog, chapter, and question requests; do not add them to the subject chooser.

Required frontend behavior:
- Do not make the protected catalog request for an unauthenticated public preview.
- After login, use the existing catalog response to resolve the selected subject and navigate directly to `/subjects/[id]`.
- Do not invent endpoint paths, query fields, request payloads, response fields, or subject IDs.
- Do not update `CONTRACTS/`.

## UX States
Loading:
- Unauthenticated visitors see the static public preview without a catalog-loading state.
- Authenticated catalog loading keeps an accessible three-card skeleton layout.
- While a selected subject is being resolved after login, show a concise loading state and avoid a second user click.

Empty:
- For an authenticated empty catalog, show the existing explicit empty state; do not silently manufacture live subjects.

Error:
- Preserve the existing protected-catalog error and re-authentication states.
- If the saved public-preview selection cannot be resolved from the authenticated catalog, show a clear recovery action back to `/subjects` rather than navigating to an invented ID.

Success:
- A signed-in `Start Practice` action opens the matched `/subjects/[id]` chapter-selection screen.
- An unauthenticated `Start Practice` action sends the selected intent through login, then resumes at that matched subject screen.

Disabled:
- No subject card is disabled in the approved beta screenshot.
- Do not expose CQ or Mixed Practice controls on this screen; those belong to the existing next step.

Unauthenticated:
- `/subjects` remains viewable as the static three-subject beta preview.
- Catalog-backed subject IDs remain protected and are resolved only after login.

## Accessibility
- Keep one H1 and a logical heading sequence for `Available subjects` and the helper strip.
- Render each subject as a semantic article with a meaningful H3 and a real link/button action.
- Do not make the full card and its nested action independently clickable.
- Communicate `MCQ practice available` in text as well as with the success icon/color.
- Use a success text/background combination that meets contrast requirements for small text.
- Keep `aria-current="page"` on the active shared navigation item.
- Mark decorative subject and help-strip icons as `aria-hidden`.
- Maintain visible keyboard focus, full-width mobile tap targets, and concise loading/error announcements.

## Tests
- Public `/subjects` renders the approved static three-subject preview without requesting the protected subject catalog.
- Cards render General Math, Physics, Chemistry in the approved order with their topic copy and MCQ availability text.
- The page renders its screenshot-specific hero, helper strip, and `/how-it-works` link.
- An unauthenticated `Start Practice` action sends the selected subject intent through login.
- A signed-in `Start Practice` action uses the authenticated catalog ID and navigates to `/subjects/[id]`.
- A post-login selected subject resumes directly at the matched `/subjects/[id]` route.
- Loading, empty, protected-catalog error, unresolved-subject recovery, and mobile layout states remain covered.
- Footer social links remain absent until production URLs exist.

## Out of Scope
- No backend changes.
- No database changes.
- No backend contract changes.
- No `CONTRACTS/` updates.
- No new public catalog endpoint.
- No hardcoded backend subject IDs.
- No changes to practice generation, plan entitlements, or `/practice/[id]`.
- No unrelated shared-footer redesign or social-link additions.
- No unrelated page redesigns.

## Tawsif Follow-Up Notes
- `CONTRACTS/api.md` currently describes `GET /api/subjects` as unauthenticated, but the current backend route protects it. Contracts/docs should be reconciled later; this does not block the approved static public preview.
- Confirm the active beta subject names returned by the authenticated catalog, particularly the approved `General Math` display name.
- Confirm that General Math, Physics, and Chemistry are the intended beta subjects and that their MCQ availability statement remains correct.
- No new backend endpoint is required for public preview or direct post-login resume under this frontend approach.

## Risks / Ambiguities
- The public screenshot shows subjects before login, but the live catalog is protected. The implementation must keep public cards presentation-only and resolve actual IDs only after authentication.
- The authenticated backend model orders subjects alphabetically, while the approved visual order is General Math, Physics, Chemistry. The frontend needs an explicit beta presentation order.
- Current backend naming may differ from the approved `General Math` label. Do not assume a fixed backend ID; resolve the selected subject from the authenticated catalog and provide a recovery state if it cannot be matched.
- The screenshot shows social icons, but the agreed product decision is to keep them hidden until real links are supplied.
