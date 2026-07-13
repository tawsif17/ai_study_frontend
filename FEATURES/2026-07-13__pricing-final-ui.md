# Pricing Final UI and Backend Handoff for Tawsif

## Status

- **Frontend UI:** complete and verified as a frontend-safe implementation.
- **Frontend tests:** complete.
- **Frontend commit readiness:** ready; no unresolved frontend P0/P1 defects remain after the final activation-success guard.
- **Backend integration:** pending.
- **Final end-to-end verification:** pending an aligned backend and a verified beta test account.
- **Branch:** `frontend/marjuck-ui-fixes`.
- **Commit/push:** none performed.

## Problem

The previous Pricing screen advertised a Tk 499 monthly Pro plan, broad CQ/Mixed access, and a trial-oriented upgrade flow. That contradicted the founder-approved beta proposition: free MCQ practice for exactly three subjects, optional no-payment Beta Pro access, Board-only Practice and Weak Area Analysis available only through Beta Pro, and CQ/Mixed still coming soon.

## Scope

- Implement the founder-approved `/pricing` layout and visible product truth.
- Keep the existing frontend API boundary unchanged while making client-side state truthful and accessible.
- Guard direct `/pricing/success` visits so they cannot claim activation without a current-session confirmation and a refreshed account state showing `plan_tier: pro`.
- Remove beta-excluded footer/sitemap/routes for Data Protection, AI Disclaimer, and Data Deletion.
- Document the current backend code and contract gap for Tawsif.

## Out of Scope

- Backend routes, controllers, services, models, migrations, environment, packages, payment, subscriptions, authentication enforcement, or practice generation changes.
- A Board-only practice request/filter, fallback, or UI entry flow.
- A final API contract for Beta Pro activation.
- Any live authenticated activation test without a suitable verified beta account.

## Acceptance Criteria

- The page presents the approved Free and Beta Pro choices with conservative no-payment beta wording.
- Board-only Practice and Weak Area Analysis are visibly Available now only under Beta Pro.
- CQ and Mixed Practice are visibly Coming soon and have no selectable control.
- The page has one logical `h1`, semantic lists/table, visible focus styles, accessible status/error text, and no document-level horizontal overflow at tested widths.
- Direct Pricing Success access does not display a false success confirmation.
- Retired footer links and routes are absent; their direct URLs show the branded global 404.

## Selected Screenshot and Mapping

Selected design reference: `C:\Users\ASUS\.codex\generated_images\019f5bea-e0c9-7603-b387-bbaf32c3f233\exec-d7241ab3-b316-4cfd-a65c-7ed7c83fa746.png`.

The supplied `C:\Users\ASUS\Downloads\PricingFinal.png` is the same approval direction used for visual verification.

| Reference area | Implemented mapping |
| --- | --- |
| Header | Existing shared navbar; Pricing has `aria-current="page"`; shared horizontal lock-up was sized/cropped so it does not render as a tiny square asset. |
| Hero | Compact `Simple beta access` badge, approved `h1`, explanatory copy, and three availability signals. |
| Plan cards | Side-by-side at tablet/desktop; clean stack at mobile; Beta Pro has restrained primary border, badge, and CTA rather than checkout styling. |
| Feature spotlight | Weak Area Analysis panel with conservative explanatory copy, a compact illustrative dashboard, and three next-step labels. |
| Comparison | Semantic captioned table with row/column headers; mobile uses an internal horizontal table scroller without document-level overflow. |
| Footer | Brand, Company, and Trust & Legal destinations only; no retired/broken/legal-placeholder links. |

## Implemented Frontend Structure

- `app/pricing/page.tsx`: Pricing metadata and route entry.
- `app/pricing/pricing-content.tsx`: hero, Free/Beta Pro cards, feature spotlight, and comparison table.
- `components/upgrade-to-pro-button.tsx`: existing activation boundary plus user-facing state handling.
- `app/pricing/success/upgrade-success-content.tsx`: post-activation display only after a one-time confirmation marker and the refreshed in-memory account shows `plan_tier: pro`; direct visits redirect to `/pricing`.
- `components/footer.tsx` and `app/sitemap.ts`: beta footer cleanup.
- `components/brand-logo.tsx`: corrected the existing shared square-canvas logo so the horizontal mark is legible in the Pricing navbar/footer.

## Final Visible Copy and Product Truth

The public page states:

- `Simple beta access`
- `Start free. Activate Beta Pro when revision needs more focus.`
- `Practise free SSC MCQs now. Verified beta users can activate Beta Pro for Board-only practice and Weak Area Analysis, both available now.`
- `MCQ available now`, `No payment during beta`, and `Pro features available now`
- `No trial, subscription, renewal or automatic billing.`

The page does not present a paid price, a checkout, unlimited practice, a guarantee, a score prediction, or a claim that Board-only falls back to general practice.

### Supported Beta Subjects

The exact supported beta catalogue is:

1. General Math
2. Physics
3. Chemistry

### Free versus Beta Pro

| Capability | Free | Beta Pro |
| --- | --- | --- |
| Free MCQ practice | Available now | Available now |
| Board-only Practice | Not included | Available now |
| Weak Area Analysis | Not included | Available now |
| CQ & Mixed Practice | Coming soon | Coming soon |
| Payment during beta | No payment | No payment |

- **Free:** Tk 0; Daily MCQ practice, the exact three subjects, answer explanations, and saved results.
- **Beta Pro:** optional access for verified beta users; more MCQ practice, Board-only Practice, Weak Area Analysis, the exact three subjects, and results/revision tools.
- **Board-only Practice:** marked Available now only under Beta Pro in both the card and comparison table. This is approved UI/product truth; the backend implementation does not yet make it true operationally.
- **Weak Area Analysis:** marked Available now and Pro-only in the page. Its copy says submitted MCQ performance can highlight chapters needing more practice and explicitly does not predict exam results or guarantee improvement.
- **CQ and Mixed Practice:** are Coming soon in both plan columns and are not buttons, links, inputs, or selectable controls.

## Authentication and Activation UI States

`UpgradeToProButton` currently handles these frontend states:

| State | UI behaviour |
| --- | --- |
| Auth loading | Disabled `Loading beta access...` CTA and polite status text. |
| Signed out | `Activate Beta Pro` redirects to login while preserving `/pricing?next=...`. |
| Unverified signed-in account | Disabled `Verify your email` CTA and explanatory status. This is clarity only, not a security boundary. |
| Eligible Free account | Enabled `Activate Beta Pro` CTA. |
| Pending | Disabled `Activating Beta Pro...` CTA. |
| API error | Accessible `role="alert"` error text. |
| 401 | Return to login with the intended destination preserved. |
| Already active | `Continue with Beta Pro` goes to the intended destination without calling activation. |
| Unavailable response | Accessible unavailable message and disabled CTA for the current screen. |
| Activation success | The existing helper must resolve with `plan_tier: pro`, then `refreshUser()` must return an account with `plan_tier: pro`; only then does the client write a one-time `sessionStorage` marker and visit `/pricing/success`. |
| Direct `/pricing/success` visit | Shows `Checking Beta Pro access...`, then redirects to `/pricing`; it does not claim activation. |

The route additionally requires the refreshed in-memory `plan_tier: pro` state before it renders success. This prevents a normal direct visit or stale marker from claiming activation, but it remains a frontend UI guard rather than authoritative entitlement security. The backend must remain the source of truth.

## Responsive and Accessibility Decisions

- Cards use a two-column layout at `md` and stack cleanly below it; the Beta Pro border/badge remains visually distinct.
- The page was manually checked at 1440x900, 1280x800, 768x1024, 390x844, 360x800, and 390x667. Document scroll width did not exceed client width at those sizes.
- The full mobile page is intentionally content-dense because the required cards, spotlight, comparison, and footer stack; it contains no unrelated FAQ/marketing sections.
- One logical `h1`, followed by semantic `h2` section headings; footer labels are `h4` group headings.
- Feature lists, real buttons/links, a captioned comparison table, row headers, column headers, text-plus-icon availability, accessible names, and polite status/error announcements are used.
- Interactive controls are approximately 44px or larger and use the shared visible focus ring. Mobile navigation opens without a focus trap.
- The comparison table may scroll within its own mobile container; the page itself does not horizontally overflow.
- The Pricing page introduces no animation. Browser tooling did not provide direct reduced-motion or 200%-zoom emulation; narrow-width reflow was checked as the available proxy.

## Tests and Verification Results

Focused coverage includes Pricing content, activation states, success-route guarding, footer cleanup, and sitemap/retired-route checks.

Verification was run after the final in-scope fixes:

| Check | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npx tsc --noEmit --incremental false` | Passed |
| `npm test` | Passed |
| `npm run build` | Passed; generated routes exclude the three retired policy routes |
| Browser console | No error or warning entries surfaced on Pricing |
| Broken Pricing/footer links | None found in browser inspection |
| Retired route check | `/data-protection`, `/ai-disclaimer`, and `/data-deletion` each rendered the branded global 404 |

Live browser verification confirmed the loading state, signed-out destination preservation, and direct-success redirect. The other activation states are covered by focused frontend unit tests with mocked auth/API state; they are not represented as live backend verification.

## Intentional Screenshot Deviations

- The Weak Area Analysis graphic is a compact CSS illustration, not a copied image asset from the reference.
- The repository's existing shared brand asset uses an owl mark, whereas the supplied visual reference appears to use an open-book mark. The implementation fixes the lock-up size/crop but does not replace brand identity without an approved asset.
- The mobile comparison remains a semantic table with an internal scroll container rather than becoming a separate card layout.

## Beta Footer Cleanup and Retained Destinations

Removed from the footer, sitemap, and route files:

- Data Protection
- AI Disclaimer
- Data Deletion

Refund Policy remains removed. No Blog, Careers, social links, or Cookie Policy link was introduced; there is no approved working Cookie Policy route to retain.

Retained working destinations:

- Company: `/about`, `/contact`, `/support`, `/faq`
- Trust & Legal: `/privacy`, `/terms`
- Existing navigation: `/`, `/subjects`, `/pricing`, `/how-it-works`, `/login`, `/signup`

## Current Backend Reality: Handoff for Tawsif

This section is a code reading of `C:\Projects\ai_study_backend`, not a proposed final contract.

### Current Activation Boundary

| Item | Current code reality |
| --- | --- |
| Backend endpoint | `POST /api/auth/upgrade-to-pro`, mounted by `src/routes/index.js` and `src/routes/auth.routes.js`. |
| Authentication | `authMiddleware` requires `Authorization: Bearer <JWT>` and populates `req.user.userId`. Missing/malformed or invalid/expired tokens result in 401 errors. |
| Request | Route validation allows an empty body and no query fields. The current frontend sends `{}` through `upgradeToPro()` in `lib/api/index.ts`. |
| Success envelope | Controller calls `res.json({ success: true, data: { message, plan_tier } })`. The current service message is `Upgrade successful. Pro trial is now active.` and `plan_tier` is `pro`. The controller's normal `res.json` path is exercised as HTTP 200 in its existing test. |
| Current mutation | In one transaction, `upgradeUserToProTrial()` ensures a `user_subscriptions` row, updates `users.plan_tier` to `pro`, and sets `user_subscriptions.trial_started_at` if empty. |
| Verified-beta eligibility | **Not enforced by this activation route/service/model.** The route checks a valid JWT but does not read or require `email_verified_at`. |
| Legacy lifecycle | `user_subscriptions` contains `trial_started_at`, `trial_ends_at`, `trial_grace_ends_at`, and `payment_status`. Entitlement code can auto-downgrade a Pro user after trial grace expiry when payment is not successful. This conflicts with the approved no-trial/no-payment Beta Pro model. |

### Board-only Practice

- Current practice generation is `POST /api/practice/generate` and accepts exam type, subject, mode, counts, language, and chapter/full-syllabus selection.
- The request validation and central contract contain **no Board-only field, source filter, board-year selector, or Board-only response state**.
- `questions.source` exists in persistence/results, but the current generator calls the question picker without a Board-only/source constraint.
- Entitlement enforcement distinguishes only plan, mode, and configured free subject IDs. It does not distinguish Board-only from general practice.
- Therefore Board-only generation is **not currently supported or enforced**, and there is no verified implementation that could prevent a Board-only request from falling back to general practice. The frontend intentionally does not create such a request or fallback.

### Weak Area Analysis

- Current endpoint: authenticated `GET /api/profile/progress-dashboard`, served by `progress.routes.js`, `progressController.js`, and `progressService.js`.
- It is protected by authentication, but the route/controller do not call the plan entitlement service.
- Therefore Weak Area Analysis is **not currently enforced as Pro-only** by backend code, even though Pricing correctly presents it as Beta Pro-only.

### CQ and Mixed Practice

- Current backend generation validates `MCQ`, `CQ`, and `MIXED` modes.
- Current entitlement logic allows Pro users to generate all modes and only blocks Free users from non-MCQ modes.
- Therefore the code does **not** currently enforce the approved product outcome that CQ and Mixed remain unavailable for everyone during this beta.

### Pricing Success Authority

- `/pricing/success` is a frontend route, not a backend authority.
- Direct access is now guarded in the frontend and returns to Pricing unless the current browser session has a marker written after the current activation helper resolved with `plan_tier: pro`, `refreshUser()` returned `plan_tier: pro`, and the success route still receives that active account state.
- This is a UI guard only. It is not a server-issued activation receipt and cannot prove final eligibility or entitlement correctness.

### Central Contract Documentation Gap

`C:\Projects\ai_study_docs\CONTRACTS\api.md` documents `/api/auth/register`, `/api/auth/login`, and `/api/auth/me`, but omits `POST /api/auth/upgrade-to-pro` and `GET /api/profile/progress-dashboard`.

The existing auth schemas are also stale relative to current backend/frontend user data: frontend `AuthUser` and current backend user queries expose `email_verified_at`, while the central `auth.login.post.json` and `auth.me.get.json` response schemas do not include it. The central practice-generation schema permits CQ/MIXED and has no Board-only dimension.

The current common error format is message-based. `CONTRACTS/api.md` states that `error.code` is not returned. That leaves the frontend with HTTP status plus human-readable message, not a documented machine-readable distinction between ineligible, not verified, already active, unavailable, or unsupported feature states.

## Required Backend Outcomes for Tawsif

These are required behavioural outcomes, not invented route names, payload fields, or status codes:

1. Only eligible, verified beta users can activate Beta Pro; the server must enforce this independently of frontend UI.
2. Activation must create no paid subscription, trial, renewal, or automatic billing state.
3. Board-only Practice must be genuinely available only to Beta Pro and must never silently use general practice content if Board-only data/filtering is unavailable.
4. Weak Area Analysis must be available only to Beta Pro.
5. CQ and Mixed Practice must remain unavailable to every beta user until formally released.
6. The frontend must receive an authoritative activation/account state sufficient to render truthful current access.
7. Success must be shown only after verified activation, not merely after a navigable client route.
8. Error responses must be distinguishable enough for truthful recovery messaging without parsing ambiguous prose.
9. The central contract documentation must describe the released activation/account/entitlement behaviour before frontend integration is called complete.

## Frontend/Backend Responsibility Boundary

| Responsibility | Current owner | Status |
| --- | --- | --- |
| Render founder-approved Pricing copy, states, and accessibility | Frontend | Complete |
| Preserve the login destination and avoid false direct success | Frontend | Complete |
| Treat `email_verified_at` as a UI hint | Frontend | Complete, not security |
| Verify eligibility, mutate entitlement state, and define authoritative access | Backend | Pending alignment |
| Deliver Board-only practice with no fallback | Backend | Pending |
| Restrict Weak Area Analysis to Beta Pro | Backend | Pending |
| Keep CQ/Mixed unavailable | Backend | Pending |
| Publish accurate API contracts | Backend/docs owner | Pending |
| Verify a real eligible activation path end-to-end | Frontend + backend | Pending |

## Rollback Guidance

If the Pricing UI must be rolled back before backend alignment:

1. Revert only the Pricing/frontend files listed in the implementation diff; do not revert unrelated user work or backend changes.
2. Restore the previous shared logo sizing only if the logo crop change is intentionally included in the rollback decision.
3. Keep the retired legal routes removed unless the product/legal owner explicitly restores approved content and destinations.
4. Do not re-enable a direct success claim. If activation is disabled, show a truthful unavailable/recovery state instead of a paid/trial or automatic-access promise.
5. Do not add Board-only fallback behaviour as part of a rollback.

## Frontend Readiness and Backend Integration Blockers

### Frontend P0/P1

- None remain. The Pricing UI, user-facing activation states, direct-success guard, responsive layout, footer cleanup, branded 404 behaviour, and focused tests are ready to commit as a frontend batch.
- This assessment does not claim that the current backend makes every public Beta Pro capability operational. Those dependencies are explicitly separated below.

### Backend integration blockers (not frontend commit blockers)

- Backend activation still creates/references a legacy trial lifecycle and payment-related state.
- Backend activation does not enforce verified-beta eligibility.
- Board-only Practice has no verified request/filter/entitlement contract and cannot currently be guaranteed to avoid general-practice fallback.
- Weak Area Analysis is authenticated but not Pro-only in backend code.
- CQ/Mixed remain accepted for Pro users in backend code despite approved beta copy.
- Central contracts omit activation and progress-dashboard endpoints and do not document the state/error distinctions the frontend needs.
- No real eligible-user activation end-to-end test has been completed against an aligned backend.

### P2

- The existing shared owl logo asset differs from the reference mark; replacing it needs an approved brand asset.
- Browser tooling did not provide direct reduced-motion or 200%-zoom emulation; responsive narrow-width checks were completed instead.

## Open Questions

1. What authoritative account/entitlement response should the released backend expose after activation and on refresh?
2. What concrete Board-only data/filter capability will prove a generated session contains only the promised source material?
3. What is the final backend rule for eligible verified beta users, and where is eligibility configured?
4. Which machine-readable error distinctions will the released contract expose for not verified, not eligible, already active, unavailable, and unsupported states?
5. When the backend changes, which public copy and footer/FAQ/pricing documentation require a founder re-review?

## Required Change Declaration

This documentation file records the existing implementation and handoff only; it does not alter frontend API contracts, backend behaviour, or central contracts.

- Backend code changed: **No**
- API endpoint changed: **No**
- API request changed: **No**
- API response changed: **No**
- Database changed: **No**
- Authentication behavior changed: **No**
- Verification enforcement changed: **No**
- Payment behavior changed: **No**
- Subscription behavior changed: **No**
- Entitlement behavior changed: **No**
- Environment changed: **No**
- Package/dependency changed: **No**
