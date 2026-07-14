# FAQ Final UI

## Status

`done`

## Problem

The previous `/faq` route used a generic trust-page layout and contained outdated beta information, including Higher Math as an available subject and ambiguous Pro/payment wording. The public FAQ needed the founder-approved visual hierarchy, accurate beta product copy, accessible accordion interactions, responsive behavior, and production-safe links without making the page dependent on a backend response.

## Scope

### Purpose and approved reference

The FAQ is a public, static help page that answers common questions about beta access, supported subjects, current practice modes, Beta Pro, Board-only intent, AI-generated content, data use, and support. It does not read account, entitlement, practice, or payment data.

The primary desktop visual reference is `C:\Users\ASUS\Downloads\FAQ Final.png`. The implementation translates that 1536-by-1024 concept into responsive HTML and CSS rather than embedding or positioning the screenshot.

### Page hierarchy

1. Shared public navbar.
2. Centered introduction with the `Help centre` eyebrow.
3. `Frequently asked` accordion group.
4. `Using Shikkha Buddy` accordion group.
5. Compact support CTA with `Start free` as the dominant action.
6. Shared public footer.

The route remains a Server Component in `app/faq/page.tsx` for metadata. Interactive content is isolated in `app/faq/faq-content.tsx`.

### Final visible copy and product truths

Hero:

- Eyebrow: `Help centre`
- Heading: `Questions about practising with Shikkha Buddy?`
- Supporting text: `Clear answers about beta access, subjects, practice modes, AI content, and support.`

`Frequently asked`:

- `Which subjects are available during the beta?`
  - `General Math, Physics, and Chemistry are available during the beta.`
- `What can I practise right now?`
  - `MCQ practice is available during the beta. CQ and Mixed Practice are coming soon and are not currently selectable.`
- `What is Beta Pro?`
  - `Beta Pro is optional access for verified beta users. It is intended to include Board-only practice and does not create a paid subscription.`
- `Is payment required during the beta?`
  - `No. Activating Beta Pro during the beta does not require payment and does not start a trial, renewal, or automatic billing.`
- `How does Board-only practice work?`
  - `Board-only practice is intended to be available through Beta Pro. Its availability will depend on the completed beta integration.`

`Using Shikkha Buddy`:

- `Can AI-generated content contain mistakes?`
  - `Yes. AI-generated questions, feedback, and explanations may contain mistakes. Check important answers against textbooks, teachers, or other trusted learning materials.`
- `How is my data used?`
  - `Account and practice information is used to provide and support the learning experience. Read the Privacy Policy for more information.`
- `How do I contact support?`
  - `Use the Contact page for help with your account, practice sessions, or learning content.`

Final CTA:

- Heading: `Still have a question?`
- Supporting text: `Contact us for help with your account, practice sessions, or learning content.`
- Contextual link: `Contact support`
- Primary action: `Start free`

These statements intentionally establish that supported beta subjects are exactly General Math, Physics, and Chemistry; MCQ is available; CQ and Mixed Practice are coming soon and not selectable; Beta Pro does not create payment, checkout, trial, subscription, renewal, or automatic billing; and Board-only is intended through Beta Pro but is not represented as a completed integration. The copy does not imply a silent fallback to General practice or guarantee AI accuracy or academic outcomes.

### Accordion behavior and accessibility

- Reuses the existing Radix accordion primitive rather than custom disclosure state.
- Only `Which subjects are available during the beta?` is expanded initially.
- Uses semantic buttons with accessible names, `aria-expanded`, `aria-controls`, and controlled regions supplied by Radix.
- Supports mouse, Enter, Space, Tab, and Shift+Tab interaction.
- Retains focus when an item opens or closes and provides a visible focus ring.
- Uses rotating chevrons plus exposed ARIA state, so state is not communicated by color alone.
- Accordion controls have a 48 CSS-pixel minimum target height.
- Questions and answers wrap naturally at narrow widths.
- Accordion animation respects `prefers-reduced-motion` through `motion-reduce:animate-none` in the shared primitive.
- Heading order is one H1, group H2 headings, accordion H3 headings, and an H2 for the final CTA.
- Decorative CTA icon and section-divider lines are hidden from assistive technology.
- Privacy and contact links are descriptive, underlined, keyboard reachable, and distinguishable without color alone.

### Responsive and visual decisions

- Desktop uses a centered editorial composition and a restrained `max-w-3xl` FAQ column rather than stretching the accordion across the page.
- Tablet reduces effective density and uses the shared mobile navigation through 768 pixels; desktop navigation now begins at the `lg` breakpoint to prevent auth controls from clipping.
- Mobile uses a single reading column, tighter hero spacing, full-width accordion controls, naturally wrapping questions, and stacked CTA actions.
- At mobile sizes, `Start free` remains the primary filled button while `Contact support` remains visually quieter.
- White/light-blue surfaces, dark navy typography, royal-blue accents, thin blue borders, and restrained shadows follow the approved design language. No decorative green was added because the page has no confirmation state that needs it.
- The existing shared footer remains unchanged and follows its established Product, Company, and Trust & Legal grouping.

### Intentional screenshot deviations

- `Frequently asked` replaces the screenshot's `Most asked` label as approved copy.
- The existing accordion chevron is retained instead of recreating screenshot-only plus/minus icons.
- Blog and Careers are omitted because those routes do not exist; no placeholders or dead links were introduced.
- The shared footer retains additional valid Product, Company, and Trust & Legal links instead of reducing every public page to the screenshot's exact link list.
- Social icons are omitted because the repository has no approved destinations.
- Mobile and tablet spacing, wrapping, navigation, and CTA stacking are responsive interpretations rather than fixed desktop coordinates.

### Valid links and metadata

- `Privacy Policy` -> `/privacy`
- `Contact page` and `Contact support` -> `/contact`
- `Start free` -> `/signup`

FAQ metadata stays in `app/faq/page.tsx` and uses the title `FAQ | Shikkha Buddy` with a conservative description covering beta access, available subjects, practice modes, AI-generated content, and support. No unavailable feature or outcome claim is included. The project does not currently configure a FAQ-specific canonical URL.

### Footer and Refund Policy decision

Refund Policy is removed from beta scope because beta collects no payment. It must not appear in the footer, sitemap, FAQ, or other current public navigation. No replacement page or redirect is required. Direct visits to `/refund-policy` use the existing branded global 404. A Refund Policy page must not be recreated during beta.

The FAQ task did not change recovery or unavailable-state behavior and therefore does not update `FEATURES/2026-07-13__branded-recovery-and-unavailable-states.md`.

### Tests and verification

`app/faq/page.test.tsx` covers:

- approved hero copy and exact subject list;
- absence of Higher Math and Refund Policy;
- first-item initial expansion and collapsed states;
- mouse expansion behavior;
- Enter and Space activation for every FAQ item;
- Tab and Shift+Tab order and retained focus;
- CQ and Mixed Practice coming-soon wording;
- Beta Pro payment, subscription, trial, renewal, and billing wording;
- AI-content limitation wording;
- valid Privacy, Contact, and signup destinations;
- absence of unsupported guarantee wording.

Final verification results:

- `npm run lint` - passed.
- `npx tsc --noEmit --incremental false` - passed.
- `npm test` - passed; 21 test files and 91 tests.
- `npm run build` - passed.
- Focused FAQ/homepage/How It Works/not-found regression suite - passed; 11 tests.
- Browser console, React warning, hydration warning, broken-image, duplicate-ID, and nested-interactive checks - passed with no FAQ-caused findings.
- No horizontal overflow was found at any required viewport.

Browser sizes tested:

- 1440 x 900
- 1280 x 800
- 768 x 1024
- 390 x 844
- 360 x 800
- 390 x 667

### Change-boundary confirmation

| Area | Changed? | Notes |
| --- | --- | --- |
| Backend code | No | FAQ is static frontend content. |
| API contracts | No | No request or response contract was added or changed. |
| Database schema | No | No database files were touched. |
| Authentication | No | Existing navbar/auth behavior is reused. |
| Verification enforcement | No | `verified beta users` is approved copy, not new enforcement. |
| Payment logic | No | Copy states the beta truth; no payment behavior changed. |
| Subscription logic | No | No subscription behavior changed. |
| Entitlement logic | No | No entitlement check or state was added. |
| Practice generation | No | No practice request, mode, or fallback behavior changed. |
| Environment configuration | No | No environment file or setting changed. |
| Package dependencies | No | Existing dependencies and primitives were reused. |

### Tawsif handoff — backend and integration notes

#### Frontend work completed now

- `/faq` is complete as a static public frontend route.
- It makes no API request and requires no new backend endpoint.
- It states current approved beta truths conservatively and routes only to existing public pages.
- Nothing in the current FAQ implementation blocks it from shipping.

#### Existing repository implementation, not a final Board-only contract

The repository already contains a frontend `upgradeToPro()` helper in `lib/api/index.ts`. It sends an authenticated `POST` request with an empty body to `/auth/upgrade-to-pro`. `lib/api/types.ts` defines the current frontend expectation as `UpgradeToProResponse` with `message` and `plan_tier: "pro"`; the same file represents a user plan as `plan_tier: "free" | "pro"` and exposes `email_verified_at`.

These files document what the current frontend code expects today. They do **not** define verified beta eligibility, Board-only availability, Board-only request behavior, or the final integration contract. The FAQ does not call this helper and must not be treated as approval of the legacy/current activation flow. Existing entitlement-error strings in `lib/api/contracts.ts` also contain older upgrade/trial language and are not a contract for this FAQ or for the final no-payment beta model.

#### Backend and integration work owned by Tawsif

Outside this FAQ task, backend/integration work still needs to establish:

- how verified beta access is represented authoritatively;
- how Beta Pro activation status is exposed to the frontend;
- how Board-only availability is communicated;
- how unavailable, unverified, and unauthorised states are distinguished;
- how the frontend should handle final Board-only integration without silently falling back to General practice.

This document deliberately does not propose field names, endpoint paths, HTTP status codes, response bodies, or fallback behavior for that future work. Tawsif should reconcile the final design with the implemented helper and types above rather than assuming they are the final contract.

#### Copy requiring future revalidation

Revalidate these FAQ statements when Board-only integration becomes live:

- Beta Pro is optional access for verified beta users.
- Beta Pro is intended to include Board-only practice.
- Board-only availability depends on completed beta integration.
- Beta Pro activation requires no payment and creates no subscription, trial, renewal, or automatic billing.

If product or backend behavior changes, update public copy only after the authoritative integration behavior is documented. Do not silently change the FAQ to imply fallback, payment, or guaranteed availability.

#### Shipping status

No unresolved backend item blocks the static FAQ page from shipping. The unresolved items block only a future live Board-only/eligibility integration. The current dependency is copy freshness: the static wording must be reviewed when that integration changes state.

## Out of scope

- Backend implementation or backend documentation changes.
- New API endpoints, response fields, status codes, or error bodies.
- Database migrations or seed changes.
- Authentication or verification enforcement.
- Payment, checkout, subscription, trial, renewal, or billing behavior.
- Entitlement decisions or plan-state changes.
- Board-only practice generation or filtering.
- CQ or Mixed Practice implementation.
- Practice-session, dashboard, or progress behavior.
- Environment, dependency, package, or lockfile changes.
- Recreating a Refund Policy route or redirect.
- Creating Blog, Careers, or social-link destinations.
- Updating `FEATURES/2026-07-13__branded-recovery-and-unavailable-states.md`.

## Acceptance criteria

- `/faq` renders the approved hierarchy and exact public copy.
- Supported beta subjects are exactly General Math, Physics, and Chemistry.
- MCQ is available; CQ and Mixed Practice are coming soon and not selectable.
- Beta Pro and Board-only wording remains conservative and makes no unsupported contract claim.
- No payment, subscription, trial, renewal, automatic-billing, accuracy, or academic-outcome guarantee is introduced.
- The first FAQ item is expanded initially and every item works with mouse, Enter, and Space.
- Focus order, focus visibility, ARIA state, heading hierarchy, link purpose, target sizing, and reduced-motion behavior are accessible.
- Layout has no horizontal overflow at desktop, tablet, and mobile widths.
- Privacy, Contact, and signup links use valid existing routes.
- Footer and sitemap contain no Refund Policy; `/refund-policy` reaches the branded 404.
- Blog, Careers, and social links remain absent without valid destinations.
- Metadata remains server-rendered and conservative.
- Focused and full verification commands pass.
- The change remains frontend-only and no commit or push is made as part of this documentation task.

## Risks

- Static Beta Pro and Board-only copy can become stale when eligibility or availability behavior changes.
- The implemented `/auth/upgrade-to-pro` frontend helper and older entitlement messages may be mistaken for the final beta contract unless Tawsif explicitly reconciles or replaces them.
- Restoring payment behavior later would require founder/legal review and a separate decision before restoring Refund Policy content.
- The shared navbar breakpoint and accordion reduced-motion improvements affect other pages, although required public-page regression checks passed.

## Open questions

- What is the authoritative definition of a verified beta user?
- What is the final source of truth for Beta Pro activation and Board-only availability?
- Which distinct unavailable, unverified, and unauthorised states must the frontend present?
- Will public availability copy remain manually maintained, or will a documented public-safe availability source be introduced later?
- When Board-only becomes live, which FAQ statements need founder/product approval before publication?
