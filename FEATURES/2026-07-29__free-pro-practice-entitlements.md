# Free and Beta Pro Practice Entitlements

## Status

done

## Problem

Contract commit `8254026` introduced plan-aware practice pools, locked explanations and revision, threshold-gated Weak Areas, and concise Board source badges. Reconciliation commit `f77d5a8` closes active-session downgrade gaps, makes Weak Areas qualification explicit, and removes CQ review references from public question details.

## Scope

- Add Standard and Board-only MCQ pool selection to subject practice setup.
- Preserve Free access to scores and correct answers while gating explanations and revision with contract-provided access metadata.
- Gate bookmarks, mistakes, and saved-question practice for Free accounts without issuing known-forbidden requests.
- Render Weak Areas according to plan access and the contract-provided minimum-attempt threshold.
- Display contract-provided Board source badges in active practice and submitted results.
- Clear entitlement-sensitive client caches after confirmed Beta Pro activation.
- Treat current-plan `403` responses as terminal for active practice instead of retrying a session that can no longer continue.
- Accept only prompt-safe CQ parts from the public question-detail endpoint.

## Out of scope

- CQ or Mixed practice UI.
- Arbitrary Pro question-count controls.
- Billing, checkout, payment, subscription lifecycle, or backend work.
- New authentication behavior, endpoints, environment variables, or architectural layers.
- Dedicated frontend handling for the backend Free-count entitlement message.

## Screens

- `/subjects/[slug]`: Standard and Board-only MCQ configuration and saved-practice access.
- `/practice/[id]`: practice-pool identity, Board badges, locked or unlocked explanations, and revision actions.
- `/bookmarks`: Beta Pro lock for Free accounts and existing revision UI for Pro accounts.
- `/dashboard/weak-areas`: Free proficiency, Beta Pro lock, threshold state, and qualified rankings.
- `/pricing`: existing upgrade destination and return path.

## UX states

- Loading: authentication, practice generation, results, revision, dashboard, and post-upgrade cache refresh.
- Empty: no submitted data, no threshold-qualified chapters, no revision items, or no generated results.
- Error: contract failure, network recovery, generation entitlement, retryable data loading, or stale Pro access.
- Success: Standard or Board-only generation, scored Free results, unlocked Pro content, and refreshed entitlements after upgrade.

## API usage

- `POST /api/practice/generate`
  - Required: `exam_type_id`, `subject_id`, `mode`, `selection`.
  - `question_pool`: `STANDARD | BOARD_ONLY`; omitted for `BOOKMARKED`.
- `GET /api/practice/:id/summary`
- `GET /api/practice/:id/results`
- `GET /api/practice/:id/results/jump`
- `GET /api/profile/progress-dashboard`
- `GET /api/questions`
- `GET /api/questions/:id`
- Existing `/api/revision/*` endpoints for Beta Pro accounts only.

All authenticated requests continue to use the existing credentialed cookie-session transport and CSRF handling for unsafe methods.

## Validation

- `BOARD_ONLY` requires MCQ mode and `CHAPTERS` selection.
- `BOOKMARKED` forbids question counts, language, chapter IDs, and `question_pool`.
- Free-facing controls expose only 10, 20, and 25 MCQs.
- A `source_badge` is displayed only when supplied; it is never derived from `source`.
- Result and Weak Areas locks are driven by response access metadata, not inferred from missing content.
- Weak Areas accepts exactly the Free lock, Pro below-threshold, and Pro threshold-qualified metadata states.
- A result aggregation fails if paginated explanation-access metadata is inconsistent.

## Tests

- API and contract tests for new request fields, strict response fields, envelopes, and pagination consistency.
- UI tests for Free and Pro pool selection, result locks, Board badges, revision gates, Weak Areas access, cache invalidation, loading, empty, error, success, keyboard, and announcement states.
- Chromium E2E coverage for Standard generation, Board-only upgrade handoff, Pro generation, mix warnings, locked Free results, and post-upgrade unlocking.

## Verification

- `npm test`: 48 files and 370 tests passed.
- `npm run test:coverage`: passed with 88.86% statements, 81.84% branches, 85.16% functions, and 91.17% lines.
- `npm run lint`: passed with no warnings or errors.
- `npx tsc --noEmit --incremental false`: passed.
- `npm run build`: passed with the documented production public URLs supplied to the process environment.
- `npm run test:e2e`: 17 Chromium tests passed, including all three supported Free counts, mix-warning display, Board-only handoff, exact Pro payload, Board badges, locked scored results, and authenticated public CTAs.
- `npm run dev` and `npm run start`: the existing repository development server and a fresh production server both returned HTTP 200 in smoke checks.
- `git diff --check`: passed; the remaining notices are Git's existing LF-to-CRLF working-copy warnings.
- Contract submodule HEAD and working-tree gitlink: `f77d5a8086ef6601c2ea857265e7c1176954a6c5`.

## Acceptance criteria

- The submodule gitlink targets `f77d5a8086ef6601c2ea857265e7c1176954a6c5`.
- Free students can generate only supported Standard counts and retain scoring/correct answers.
- Board-only generation is available only to Beta Pro and sends the exact contract payload.
- Free explanations and revision are visibly locked without forbidden revision calls.
- Weak Areas retains Free proficiency and follows contract access/threshold metadata.
- Board badges and generation warnings are rendered exactly from server data.
- Unit, coverage, lint, strict TypeScript, build, Chromium E2E, and dev/start smoke checks pass.
- All work remains unstaged and uncommitted for review.

## Risks

- Entitlement state can change while cached protected data remains mounted; successful activation must invalidate all affected caches.
- Result pages can disagree about access metadata; partial or mixed-access reviews must not render.
- A stale Pro account can still receive a legitimate non-entitlement `403`; unsafe-request failures must preserve their original classification.

## Open questions

None.
