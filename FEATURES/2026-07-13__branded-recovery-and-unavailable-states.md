# Branded Recovery and Unavailable States

## Status

Partially implemented - the isolated global 404 was approved and implemented on 2026-07-13. Backend-dependent recovery states remain deferred pending coordination with Tawsif.

## Completed batch: global branded 404 and Refund Policy removal

### Purpose and scope

This frontend-only batch replaces the generic Next.js not-found experience with a founder-approved Shikkha Buddy recovery page and removes the Refund Policy from the current no-payment beta. The completed scope is limited to:

- the global App Router `not-found` boundary;
- recovery actions and helpful public destinations;
- removal of the `/refund-policy` route;
- removal of the Refund Policy footer and sitemap links;
- directly related tests, documentation, responsive QA, and accessibility improvements to the reused public shell.

The batch does not implement the general runtime error boundary, loading boundary, unsupported-subject state, invalid-session mapping, verification recovery, offline/timeout handling, or other unavailable states described later in this document.

### Implemented route behavior

The global branded `not-found` boundary is implemented using the existing public-page shell. It covers unknown URLs and routes that deliberately call `notFound()`, including the removed `/refund-policy` route. It has no backend or API dependency.

The page provides:

- `Page not found` status badge;
- `This page took a wrong turn.` heading;
- the approved explanatory and account-safety copy;
- `Choose a subject` linking to `/subjects`;
- `Go to homepage` linking to `/`;
- Practice, How it works, and Contact support destination cards linking to `/subjects`, `/how-it-works`, and `/contact`.

Both an arbitrary unknown URL and direct navigation to `/refund-policy` return HTTP 404 and render this same branded recovery page. `/refund-policy` is not redirected and has no replacement or placeholder route.

### Reusable component structure

- `app/not-found.tsx` follows the Next.js App Router global not-found convention.
- `PageShell` supplies the real shared `Navbar`, mobile navigation, `Footer`, and page landmarks without duplicating shell markup.
- Existing `Badge`, `Button`, and `Card` primitives provide the status, recovery actions, and destination cards.
- Existing design tokens supply the white/light-blue palette, borders, typography, focus color, shadows, and success color.
- Existing Lucide icons provide destination and reassurance icons.
- The open-book recovery artwork is a lightweight code-native inline SVG scoped to the page and hidden from assistive technology.
- `components/navbar.tsx` and `components/footer.tsx` retain their existing structure while adding practical 44-pixel navigation targets and visible keyboard focus rings required by the recovery page QA.

No generalized system-state component was introduced because this approved batch contains one complete state and a new abstraction would not yet reduce duplication.

### Visual reference

The implementation used the founder-approved screenshot `C:\Users\ASUS\Downloads\Generated image 1 (5).png` as the primary visual reference for hierarchy, spacing, typography, white/light-blue balance, recovery-card proportions, borders, shadows, button distinction, illustration balance, destination-card structure, and footer presentation.

The screenshot is not embedded, cropped, or used as a UI asset.

### Responsive decisions

- The recovery card uses a readable capped width on desktop rather than a fixed-size screenshot canvas.
- Primary and secondary recovery actions stack at all sizes and remain quickly discoverable.
- The illustration becomes shorter on mobile while preserving its visual role between the description and actions.
- Destination cards use three columns on tablet/desktop and a single-column stack on mobile.
- Mobile spacing is tightened so both recovery actions remain visible at the 390 by 667 short-height stress viewport.
- Footer groups stack cleanly on mobile and remain aligned as columns on desktop.
- Browser QA at 1440 by 900, 1280 by 800, 768 by 1024, 390 by 844, 360 by 800, and 390 by 667 found no horizontal overflow, text clipping, broken images, or unusually large layout shifts.

### Accessibility decisions

- The page has one semantic `h1` and labelled content sections.
- Recovery actions and destination cards are semantic links with descriptive accessible names.
- Decorative illustration and icons are hidden from assistive technology where adjacent text already conveys their meaning.
- Primary and secondary actions are at least 44 CSS pixels high.
- The mobile navigation trigger and every opened-menu action are 44 CSS pixels high after QA corrections.
- Footer navigation links provide practical 44 CSS-pixel targets without changing their visual text size.
- Header, navigation, recovery actions, destination cards, and footer links have visible keyboard focus treatments.
- All visible interactive elements remain in logical DOM tab order with the default `tabIndex` of `0`.
- Text wraps without clipping at every required viewport, and the page does not rely on color or icons alone to explain the error or recovery choices.

### Refund Policy removal

- Deleted `app/refund-policy/page.tsx`, including its route-specific component, metadata, and payment/refund copy.
- Removed the Refund Policy link from `components/footer.tsx`.
- Removed `/refund-policy` from `app/sitemap.ts`.
- Confirmed there are no remaining public app or component links to `/refund-policy`.
- Confirmed the generated sitemap contains no `/refund-policy` URL.
- Confirmed direct navigation to `/refund-policy` returns HTTP 404 and renders the global branded 404.

The policy was removed because the current beta accepts no payments. Truthful no-payment beta statements elsewhere remain unchanged.

### Files changed for this batch

- Added `app/not-found.tsx`.
- Added `app/not-found.test.tsx`.
- Deleted `app/refund-policy/page.tsx`.
- Updated `app/sitemap.ts`.
- Updated `components/footer.tsx`.
- Updated `components/navbar.tsx`.
- Updated `FEATURES/2026-07-13__branded-recovery-and-unavailable-states.md`.

### Tests and verification

Final verification results:

- `npm run lint` - passed.
- `npx tsc --noEmit --incremental false` - passed.
- `npm test` - passed, 20 test files and 87 tests in the isolated recovery-batch worktree.
- `npm run build` - passed; `/_not-found` is generated as a static App Router route and `/refund-policy` is absent from the route list.
- `git diff --check` - passed with only existing line-ending conversion warnings.
- Unknown production URL - HTTP 404 and branded page confirmed.
- `/refund-policy` - HTTP 404 and branded page confirmed.
- All five recovery actions - destinations confirmed in the production build.
- Desktop and mobile navigation - interaction and destination checks passed.
- Production browser console - no errors, warnings, hydration failures, or broken-resource messages.
- Responsive browser matrix - no horizontal overflow, text overflow, broken images, or measured layout shift.

`app/not-found.test.tsx` covers the required branded content, reassurance, primary and secondary actions, the three real public destination routes, and regression checks that the Refund Policy is absent from both the public footer and sitemap.

### Intentional differences from the screenshot

- The implementation uses the current production `BrandLogo`, navbar, mobile menu, and footer rather than recreating screenshot-only shell markup.
- Screenshot-only social icons were not added.
- The screenshot's Refund Policy footer entry is intentionally absent because the route is removed for beta.
- The book artwork is a simplified code-native SVG rather than a copied image asset.
- Mobile spacing, type wrapping, illustration height, and card stacking are responsive adaptations rather than fixed desktop scaling.
- The current footer content and product description are preserved where they differ from the screenshot.

### Unresolved items

No unresolved item blocks the isolated global 404 or Refund Policy removal.

The runtime-error boundary and the unavailable-state mappings listed later in this document remain separate work. Backend-dependent states must not be inferred from generic errors and still require confirmed API outcomes and coordination with Tawsif.

### Rollback considerations

- Removing `app/not-found.tsx` would restore the generic Next.js not-found experience and should only be done with an approved replacement.
- Restoring `/refund-policy` would also require restoring its footer and sitemap entries, but must not occur unless paid access is returning and founder/legal approval has supplied current policy content.
- The navigation target-size and focus-ring improvements are general accessibility corrections and should normally remain even if the 404 visual design is later replaced.
- A rollback must not restore screenshot-only social links, introduce a redirect for `/refund-policy`, or change backend, authentication, subscription, activation, or payment behavior.

## Tawsif handoff

- No backend code changed.
- No API contracts changed.
- No database changes are required.
- No authentication behavior changed.
- No subscription or activation behavior changed.
- The Refund Policy was removed because beta accepts no payments.
- Future restoration of paid access will require founder/legal approval before restoring a Refund Policy route.
- Runtime error and unavailable-state mappings remain separate frontend/backend integration work unless implemented in another approved batch.

## Deferred recovery-state implementation status

The broader recovery-state implementation described below remains deferred. Its earlier frontend implementation and feature-specific tests were removed after QA, and those states must not be restarted until the listed backend-facing decisions are confirmed.

Do not restart implementation until the following backend-facing decisions are confirmed with Tawsif:

- Canonical subject IDs and catalog names for General Math, Physics, and Chemistry, including how unsupported subjects are rejected.
- The exact login response used when email verification is required.
- The exact response shapes and messages for invalid, expired, and previously used verification links.
- The authoritative entitlement behavior for automatic Pro beta access and the retirement of legacy upgrade/pricing-success behavior.
- The authoritative practice-summary status and error responses for missing, forbidden, conflicting, or otherwise invalid sessions.

No backend, database, `CONTRACTS/`, payment, Board-only practice, CQ, Mixed, entitlement, or answer-save behavior was changed as part of either the completed 404 batch or the earlier rollback.

## Deferred problem statement

Before this batch, the App Router had no global branded `not-found`, route-error, or route-loading boundaries. The global `not-found` boundary is now implemented, but route-error and route-loading boundaries remain deferred. Several product routes still reduce distinct failures to generic text, empty results, or a page that appears functional despite an unavailable capability. This remains risky during beta because unavailable modes, unsupported subjects, verification problems, and invalid legacy payment routes need honest recovery without suggesting that a payment or upgrade will unlock them.

## Deferred recovery-state scope

Create a consistent, calm white/light-blue branded recovery system for the following frontend states. Reuse the existing `PageShell`, brand, button, alert, card, and responsive patterns where they are suitable. Every state must have a page title, concise explanation, clear next action, keyboard-visible focus, screen-reader semantics, mobile layout, and no unsupported interactive control.

### Shared recovery actions

The state set must provide these actions where they are meaningful to the situation:

- Go home (`/`)
- Choose General Math (`/subjects?subject=general-math` through the existing safe subject resolver)
- Choose Physics (`/subjects?subject=physics` through the existing safe subject resolver)
- Choose Chemistry (`/subjects?subject=chemistry` through the existing safe subject resolver)
- Login (`/login` with a safe internal return path only)
- Resend verification (`/resend-verification`, preserving email only when it is already available in the current form state)
- Contact support (`/contact`)

Do not use a recovery action to imply a backend outcome that was not received. In particular, no recovery copy may say or imply that paying, upgrading, starting a trial, or activating a plan will unlock an unavailable beta capability.

### State plan

| State | Trigger and presentation | Recovery | Backend/API dependency |
| --- | --- | --- | --- |
| Global 404 | Unknown public route, malformed non-product URL, or route that deliberately calls `notFound()`. Render a branded `not-found` boundary rather than Next.js default UI. | Go home; choose an approved beta subject; contact support. | None. |
| Route error | Unexpected rendering or data-boundary exception. Render a branded route-error boundary with a retry action only when the boundary can safely retry. | Retry where supported; Go home; contact support. | Do not expose internal error details. |
| Loading | Route-level navigation/loading state for app routes and client data hydration. Use branded skeletons that preserve the target page hierarchy; never show a fake subject list, session, result, or entitlement. | No action required while loading; provide Go home only for a prolonged/error state, not as a substitute for loading. | None. |
| Unsupported subject | A subject ID, query value, or catalog row is outside the approved beta set: General Math, Physics, Chemistry. The route must not render configuration or start practice. | Choose General Math, Physics, or Chemistry; Go home; contact support. | Frontend needs the final canonical subject mapping/IDs. Backend must reject unsupported practice generation. |
| Higher Math coming later | A deliberate Higher Math entry point may show a non-functional, clearly labelled `Coming later` information state. It must never show an enabled practice setup or start button. | Choose General Math, Physics, or Chemistry; Go home; contact support. | None for the presentational state. No practice request. |
| CQ unavailable | Any CQ mode entry point in beta. Show that CQ is not available in the current beta, without a disabled pseudo-form that looks startable. | Choose an approved subject for MCQ practice; Go home; contact support. | Do not call generation. Backend should reject CQ until formally released. |
| Mixed unavailable | Any Mixed mode entry point in beta. Use the same honest MCQ-only framing as CQ, without presenting an upgrade or payment path. | Choose an approved subject for MCQ practice; Go home; contact support. | Do not call generation. Backend should reject MIXED until formally released. |
| Invalid practice mode | An invalid mode in route/query/client state, or a server response that rejects the requested mode. Do not render a session shell as if practice began. | Return to the supported subject's MCQ configuration; Go home; contact support. | Map only verified validation errors; do not infer entitlement or payment status from a generic failure. |
| Invalid practice session | Non-numeric ID, not found, forbidden, submitted-state conflict, or another verified session-summary failure. Differentiate unavailable/not-found from retryable loading/network errors where the API status permits. | Choose an approved subject; Login when unauthenticated; Go home; contact support. | Use existing summary endpoint/status only; do not claim a session expired unless the API explicitly supplies that outcome. |
| Unverified account | A verified backend `401` response with the exact `Email verification required` outcome. Explain that verification is needed before continuing and do not treat it as bad credentials. | Resend verification; Login; Go home; contact support. | Requires backend enforcement of email verification before login. |
| Expired verification link | Verified backend response from `POST /auth/verify-email` indicating an invalid, used, or expired token. Do not distinguish these states unless the backend message safely does so. | Resend verification; Login; Go home; contact support. | Use the backend message; no client-side token-expiry inference. |
| Invalid pricing-success or legacy payment route | Direct access to obsolete activation/success routes, malformed return paths, or legacy payment URLs. Explain that beta access has no checkout, trial, renewal, or payment step; do not show a success confirmation unless a verified current flow supports it. | Go home; choose an approved subject; Login if needed; contact support. | Clarify final beta entitlement handling with Tawsif before replacing the current activation flow. |
| Unauthenticated protected route | Auth hydration completes without a valid user/token for subjects, subject detail, practice, results, or other protected routes. Preserve only a validated same-origin return path. | Login; Go home; contact support. | Existing `/auth/me` and protected-route responses. |
| Offline and timeout | Browser offline event or a fetch failure that is demonstrably a network/timeout failure. Preserve local form input and unsaved practice UI; do not label an unknown server error as offline. | Retry when safe; Go home; contact support. | Timeout classification must be based on an explicit client timeout implementation or a verified fetch failure, not a guessed backend result. |

### Accessibility and responsive requirements

- Use one clear `h1` per full-page state and semantic `role="alert"` or `role="status"` only when appropriate.
- Move focus to an error heading or status region after a failed route transition; retain focus predictably after retry.
- Provide visible focus rings, readable contrast, and controls with a practical 44 by 44 CSS-pixel target.
- Do not rely on color, icons, or disabled styling alone to communicate state.
- Keep actions vertically stackable on narrow screens and prevent long error text or subject labels from overflowing.
- Loading skeletons must be hidden from assistive technology or accompanied by a concise live loading label.

### Tests

- Global `not-found`, route-error, and loading boundaries render the Shikkha Buddy brand and the relevant recovery actions.
- Each unsupported/unavailable state renders no active unsupported practice-generation action and exposes the correct recovery routes.
- Higher Math never starts practice; CQ and Mixed do not expose active beta practice controls.
- Invalid/unsafe `next` parameters resolve to a safe internal destination.
- Unverified and expired-verification views use only verified backend messages and show resend/login recovery.
- Offline/timeout paths preserve entered form data and unsaved answer state where the existing queue supports it.
- Keyboard, focus-management, screen-reader status, mobile layout, and 44px target coverage are included for the shared recovery components.

## Out of Scope

- Backend routes, database queries, migrations, entitlement logic, payment systems, checkout, subscription conversion, or verification-policy changes.
- All Board-only practice work: UI, UX, copy, configuration, request parameters, API wiring, result labels, recovery states, tests, and documentation changes beyond this explicit deferral.
- Inventing request fields, source values, empty-state error codes, timeouts, expiry rules, or account outcomes.
- Enabling Higher Math, CQ, or Mixed practice during beta.
- Replacing the existing answer-save queue or adding analytics.

## Acceptance Criteria

- No user sees a generic Next.js error, 404, or blank utility page for a planned covered route state.
- No unsupported subject, Higher Math, CQ, Mixed, invalid mode, invalid session, or legacy payment route appears functional.
- All covered unavailable states are honest, branded, responsive, accessible, and offer situation-appropriate recovery from the shared action set.
- No unavailable copy claims that payment, a trial, a subscription, or an upgrade will unlock the feature.
- Backend-dependent states use only existing verified endpoint/status/message behavior; unknown outcomes remain generic and retryable where safe.

## Risks

- Current pricing/upgrade flow and some public copy still describe legacy free/pro and activation behavior that conflicts with automatic beta access.
- The current auth service does not yet enforce email verification before login, so the unverified-account state cannot be considered live until backend behavior changes.
- `CONTRACTS/` differs from current code in several areas and cannot be used alone to determine runtime recovery outcomes.

## Open Questions

- How will the backend identify the three canonical beta subject IDs, especially while the current catalog uses `Mathematics` and the product label is `General Math`?
- When will login begin returning the verified `Email verification required` response, and what exact response shapes should the frontend treat as expired/used verification links?
