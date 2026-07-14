# Homepage Final UI

## Goal
Match the approved final homepage screenshot with a frontend-only implementation that preserves the current Shikkha Buddy architecture, routing, and design system. The homepage should present a polished, mobile-first SSC practice landing experience with a static MCQ preview, clear free MCQ entry point, beta Pro framing, subject cards, how-it-works steps, and a final practice CTA. The implementation must avoid backend, database, contract, and unrelated page changes.

## Screens
- `/`
- Shared navigation shown on the homepage
- Shared footer shown on the homepage

## Screenshot Requirements
- The homepage should use a calm white and light-blue visual system with blue primary actions, green success accents, and restrained card shadows.
- The first viewport should clearly show the Shikkha Buddy brand, navigation, hero promise, primary CTA, secondary CTA, and an MCQ practice preview card.
- The page should communicate that SSC MCQ practice is available now, with board-only practice positioned as a Pro/beta option and CQ/Mixed practice marked as coming soon.
- The page should include these sections in order:
  - Header/navigation
  - Hero with MCQ preview
  - Three-benefit feature strip
  - Start practicing plan/options section
  - Practice by subject cards
  - How it works steps
  - Final CTA
  - Footer

Desktop requirements:
- Header layout: logo left, `Practice`, `How it works`, `Pricing` centered, `Login` and `Start free` on the right.
- `Practice` must link to `/subjects`.
- Hero should be a two-column layout with copy and CTAs on the left and a static MCQ preview card on the right.
- MCQ preview should include subject/topic chips, progress text, answer choices, selected correct answer state, feedback, bookmark label, and a `Try 5 more MCQs` action.
- Feature strip should show three compact feature items: topic-wise MCQs, answer explanations, and mistake review.
- Start practicing should show a large Free MCQ practice card and a more-practice-options card.
- Board-only practice should link to `/pricing` until the user activates beta Pro access.
- CQ Practice and Mixed Practice should be visibly disabled/locked and labeled coming soon.
- Subject cards should show General Math, Physics, and Chemistry with SSC badges and `View topics` actions.
- Footer social icons should remain hidden until real social links exist.

Mobile requirements:
- Header must stay compact and usable, with existing mobile navigation patterns preserved unless implementation requires a small label/content adjustment.
- Hero should stack with copy and CTAs before the MCQ preview card.
- CTA buttons should fit without text clipping.
- Feature strip should stack or wrap into readable full-width rows.
- Start practicing cards should collapse into a single column.
- Subject cards should render as a single-column list.
- How-it-works steps should remain readable without cramped connector lines.
- Footer groups should stack cleanly.

## Components Likely Involved
Existing components to reuse:
- `PageShell`
- `Navbar`
- `Footer`
- `BrandLogo`
- `AuthGatedLink`
- `Button`
- `Card`
- `Badge`
- Existing icon exports from `components/icons.tsx` where suitable

Existing components to modify:
- `app/page.tsx`
- `components/hero-section.tsx`
- `components/features-section.tsx`
- `components/navbar.tsx`
- `components/footer.tsx`
- Subject and mode card components only if reuse is cleaner than homepage-specific markup
- Pricing/Pro activation copy components only for the wording shift to `Activate beta Pro access`, if included in the implementation batch

New components only if necessary:
- Static MCQ preview card component
- Homepage free-practice/pro-options section component
- Homepage subject card component
- Homepage how-it-works step component
- Lightweight final CTA illustration component or inline SVG/CSS treatment

## Data / Backend Dependency
Classification: Static/presentational only

Backend-dependent UI to document:
- Subject cards imply available subjects and topic entry points.
  - Data needed: subject names, subject availability, topic/chapter availability.
  - Current frontend already has it: yes, on `/subjects` and `/subjects/[slug]` through existing catalog APIs.
  - Placeholder/mock/static data acceptable for now: yes, homepage can remain static and link into `/subjects`.
  - Tawsif later: verify backend seed/content naming uses the intended `General Math` label or confirm frontend should keep a display-name mapping from backend-provided `Higher Math` to `General Math`.
- Board-only practice option implies a distinct Pro practice path.
  - Data needed: a way to identify board-only question sets or filter generated practice by board-only content.
  - Current frontend already has it: no dedicated board-only practice flow is visible in the current homepage implementation.
  - Placeholder/mock/static data acceptable for now: yes, link to `/pricing` until beta Pro access is activated.
  - Tawsif later: verify whether backend already has a reliable board-only source/filter contract or whether this remains future work.
- Beta Pro activation uses the existing `POST /api/auth/upgrade-to-pro` flow from the frontend pricing surface.
  - Data needed: authenticated user plan state and activation result.
  - Current frontend already has it: yes, through `upgradeToPro()` and auth refresh.
  - Placeholder/mock/static data acceptable for now: no for the pricing activation button, but homepage can link statically to `/pricing`.
  - Tawsif later: document the implemented beta Pro activation endpoint in contracts/docs.

## API Usage
The current homepage should not make direct API calls.

Existing indirect frontend behavior:
- Auth-gated links may read local auth state and redirect unauthenticated users to login before practice.
- `/subjects`, `/subjects/[slug]`, `/pricing`, and practice routes already own their backend API calls.

Do not add new homepage API calls for the screenshot implementation.
Do not invent endpoints.
Do not invent payload fields.
Do not update `CONTRACTS/`.

## UX States
Loading:
- Not required for static homepage content.
- Navigation/auth controls may keep the current auth-loading behavior.

Empty:
- Not required for static homepage content.

Error:
- Not required for static homepage content.

Success:
- Static CTAs should navigate to existing routes.

Disabled:
- CQ Practice and Mixed Practice should be clearly disabled/locked and labeled coming soon.
- Disabled-looking options must not appear clickable unless a route is intentionally assigned.

Unauthenticated:
- `Start free`, `Start free practice`, `View topics`, and practice-related CTAs can use existing auth-gated behavior where appropriate.
- Board-only practice should route to `/pricing`; pricing handles login/activation flow.

## Accessibility
- Keep a single clear `h1` in the hero.
- Preserve logical heading order for all sections.
- Do not rely on color alone for the correct MCQ answer; include text such as `Correct. Review: Refraction`.
- Static MCQ preview controls should not be keyboard-focusable if they are decorative/non-interactive.
- Clickable cards must have accessible names and visible focus states.
- Disabled/locked options must communicate state in text, not only through a lock icon.
- Icons used as decoration should be `aria-hidden`.
- CTA text must remain readable and unclipped on mobile.
- Maintain sufficient contrast for muted text, chips, and outlines.

## Tests
Required UI/integration tests:
- Homepage renders the approved primary sections in order.
- Header shows `Practice`, `How it works`, `Pricing`, `Login`, and `Start free`.
- `Practice` navigation points to `/subjects`.
- Hero renders the final headline/copy and MCQ preview content.
- Free MCQ practice CTA points into the existing practice entry flow.
- Board-only practice points to `/pricing`.
- CQ and Mixed options render as coming soon/disabled.
- Subject cards render General Math, Physics, and Chemistry.
- Footer does not render social links/icons until real links exist.
- Mobile-oriented assertions should verify key CTA text remains visible and section content is not omitted.

## Out of Scope
- No backend changes.
- No database changes.
- No backend contract changes.
- No `CONTRACTS/` updates.
- No new API endpoints.
- No invented request or response fields.
- No unrelated redesigns.
- No changes to practice session behavior.
- No changes to auth behavior beyond preserving existing auth-gated navigation.
- No payment gateway or billing integration.

## Tawsif Follow-Up Notes
- Current backend implements `POST /api/auth/upgrade-to-pro`, but docs/contracts do not document it. This should be reviewed and documented for closed beta Pro activation.
- Confirm whether `General Math` should be returned by backend data directly or mapped in the frontend when backend still returns `Higher Math`.
- Confirm whether board-only practice has or needs a backend contract, such as a source/filter field for generated practice.
- Confirm whether `GET /api/subjects` and `GET /api/questions` docs should be updated to show current auth requirements from backend code.
- Confirm whether contact, question reporting, verify email, resend verification, and progress dashboard contracts should be added to docs because these endpoints exist in current backend/frontend behavior.
- Confirm whether beta login intentionally continues to allow unverified accounts while the frontend keeps the unverified-email CTA.

## Risks / Ambiguities
- Screenshot says `General Math`, while current frontend copy and likely backend data have used `Higher Math`; implementation must decide whether to map display names frontend-side until backend/docs are updated.
- Screenshot presents board-only practice as Pro, but the current frontend entry point is pricing/beta activation rather than a distinct board-only generation flow.
- The MCQ preview should stay static to avoid creating fake homepage API behavior.
- Social icons are visible in the screenshot, but the decision is to keep them hidden until real links exist.
- The final CTA illustration can be implemented with lightweight inline SVG/CSS or an asset; implementation should choose the option that best preserves performance and maintainability.
