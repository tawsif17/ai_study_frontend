# How It Works Final UI

## Goal
Match the approved How It Works screenshot at `/how-it-works` with a clear, static explanation of the current SSC beta practice journey. The page should help a new student understand subject selection, chapter-based MCQ practice, explanation review, and next-step revision without implying unavailable CQ or Mixed Practice functionality. It remains a public presentational route that directs students to existing signup, subject-selection, and pricing journeys.

## Screens
- `/how-it-works` - public How It Works page.
- `/signup` - existing destination for `Start free` CTAs.
- `/subjects` - existing destination for `Choose a subject` CTA.
- `/pricing` - existing destination if the Board-only Pro status becomes a link.
- Shared navigation and footer through `PageShell`.

## Screenshot Requirements
- Use the approved white and light-blue page treatment, centered hero, active `How it works` navigation state, and the shared Shikkha Buddy visual language.
- Replace the current breadcrumb, five-step vertical timeline, generic practice-mode cards, generic feedback/trust sections, and single CTA with the screenshot-specific information hierarchy.
- Keep all example questions, session values, availability labels, and review values clearly presentational rather than live student data.

Desktop requirements:
- Hero: show the `Simple SSC practice flow` badge, the heading `How SSC practice works on Shikkha Buddy`, supporting copy, `Start free` and `Choose a subject` CTAs, and the three-item availability/trust row.
- Show `From topic to revision` in a single framed four-step flow: Choose subject, Choose chapter, Practice MCQs, Review mistakes. Use connecting arrows between equally weighted steps.
- Show `What happens during an MCQ session` as a two-column layout: static Physics-Light MCQ example on the left, and three vertically connected explanation/review cards on the right.
- Show `What is available now` as a semantic table with MCQ Practice available now, CQ Practice coming soon, Mixed Practice coming soon, and Board-only sets marked Pro.
- Show `After practice` as a framed two-column section with revision guidance and a static session-review summary.
- Finish with the screenshot CTA banner, book illustration/asset, `Start free` action, and `No credit card required.` text.
- Preserve the existing shared footer structure and keep social links hidden until real destinations exist, even though social icons appear in the reference screenshot.

Mobile requirements:
- Keep the existing mobile navigation pattern.
- Stack hero CTAs with comfortable, full-width tap targets where needed.
- Convert the four-step horizontal flow into a readable vertical sequence without losing step order or labels.
- Stack the MCQ example and explanation/review cards while preserving their visual hierarchy.
- Keep availability information understandable at narrow widths by using an accessible responsive table treatment or labelled stacked rows; do not hide status or best-for information.
- Stack the After practice content and retain clear spacing between the checklist and session-review summary.
- Keep all text readable with no horizontal page overflow.

## Components Likely Involved
Existing components to reuse:
- `PageShell`
- `Navbar`
- `Footer`
- `Button`
- `Card` / `CardContent`
- `Badge`
- Existing icon exports from `components/icons`
- Existing table primitives if compatible with the responsive availability section.

Existing components to modify:
- `app/how-it-works/page.tsx`
- Page metadata and visible copy only as needed to align with the approved beta wording.

New components only if necessary:
- Focused static subcomponents or local data definitions for the four-step flow, MCQ example, explanation steps, availability table, session-review summary, and final CTA.
- A lightweight book illustration made from existing assets, CSS, or a small local visual asset only if page-level markup would otherwise become difficult to maintain.

## Data / Backend Dependency
Classification: Static/presentational only

- Hero, steps, MCQ example, explanations, availability rows, and session-review panel:
  - Data needed: approved explanatory copy, example question/options, beta availability labels, and illustrative review counts.
  - Current frontend already has it: the route has static content and existing design primitives, but not the screenshot-specific composition or copy.
  - Placeholder/mock/static data acceptable for now: yes. All values are clearly illustrative and not presented as the current student's result.
  - Tawsif later: confirm beta availability wording remains accurate if MCQ, CQ, Mixed, Board-only, or Pro availability changes.

- CTA destinations:
  - Data needed: none.
  - Current frontend already has it: yes. Existing public routes support signup, subject selection, and pricing navigation.
  - Placeholder/mock/static data acceptable for now: not applicable.
  - Tawsif later: no backend verification is required for the static CTA links.

## API Usage
The current `/how-it-works` route has no API usage and should remain free of API calls. Do not add subject, question, practice-session, entitlement, or progress requests to support screenshot-only examples.

## UX States
Loading:
- No page-level loading state is required because page content is static.

Empty:
- Not applicable. Do not show empty states for the explanatory examples.

Error:
- Not applicable. Do not introduce API-dependent error states.

Success:
- CTA links navigate to their existing public destinations.

Disabled:
- CQ Practice and Mixed Practice are descriptive coming-soon rows, not actionable controls.
- Board-only sets may use a non-interactive Pro status label or the established pricing destination; do not expose unavailable practice controls.

Unauthenticated:
- The entire page remains publicly viewable.
- `Start free` directs to existing signup; `Choose a subject` directs to the existing public subject preview, where the current auth-gated start flow handles authentication.

## Accessibility
- Keep one H1 and a logical H2/H3 sequence across all instructional sections.
- Use semantic ordered/list structures for the practice flow and explanatory steps.
- Use a real table with headers, captions or an equivalent labelled responsive representation for availability data.
- Communicate `Available now`, `Coming soon`, and `Pro` through text, not color, badges, or lock icons alone.
- Ensure decorative icons and the final book illustration are hidden from assistive technology.
- Ensure the static MCQ example communicates option labels, selected/correct state, and explanation text without relying only on green styling.
- Maintain visible keyboard focus and at least 44px touch targets for CTA links.
- Avoid nested interactive elements in cards, rows, or CTA banners.

## Tests
- `/how-it-works` renders the screenshot-specific hero copy, both CTA links, and active navigation state.
- The four-step flow renders all approved steps in the correct order.
- Static MCQ example includes question, labelled options, correct-answer text, and review message.
- Availability section renders accurate text statuses for MCQ, CQ, Mixed, and Board-only sets.
- Page contains no data-fetching hooks or API requests.
- The final CTA points to signup and does not expose an unavailable practice action.
- Footer social links remain absent until production URLs exist.
- Add focused accessibility assertions for headings, availability semantics, and CTA accessible names.

## Out of Scope
- No backend changes.
- No database changes.
- No backend contract changes.
- No `CONTRACTS/` updates.
- No new backend endpoint or public data feed.
- No live practice-question, session, progress, entitlement, or subscription data.
- No changes to practice generation, `/practice/[id]`, subject selection behavior, or billing behavior.
- No unrelated shared navigation or footer redesign.
- No social-link additions without real destinations.
- No unrelated page redesigns.

## Tawsif Follow-Up Notes
- No current backend or contract action is required for this static page.
- Confirm beta messaging remains accurate when availability changes: MCQ available now; CQ and Mixed coming soon; Board-only sets Pro.
- If the page later needs live availability, subject coverage, session metrics, or entitlement information, define a dedicated public-safe response before frontend integration. Do not repurpose protected student APIs for this public page without an explicit product and contract decision.

## Risks / Ambiguities
- The reference is a desktop screenshot; responsive behavior for the wide four-step flow, availability table, and two-column instructional sections must be designed deliberately for mobile.
- The screenshot includes footer social icons, but the agreed product decision is to keep them hidden until real links exist.
- The final CTA illustration can use an existing asset, a small local visual asset, or CSS depending on what best matches the approved screenshot without adding unnecessary complexity.
- The page must not imply that CQ or Mixed Practice can currently be started during beta.
