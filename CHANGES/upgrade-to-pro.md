# Upgrade To Pro CTA Contract Alignment

Status: `done`

## Reason
Backend now exposes `POST /api/auth/upgrade-to-pro` and frontend pricing/pro upgrade UX must call this API directly instead of showing a manual support/contact path.

## Change summary
- Added frontend API contract type and function for `upgradeToPro`.
- Reworked pricing page pro CTA to call `upgradeToPro` for authenticated free users.
- Added auth-aware routing behavior:
  - unauthenticated users are redirected to login with return-to-pricing context.
  - authenticated pro users skip upgrade call and continue to target route.
- Added test coverage for API contract invocation and upgrade CTA behavior.

## Impact
- Pro upgrade is now actionable from the pricing UI.
- Existing practice flows that send users to `/pricing?next=...` can complete upgrade and return to intended page.

## Validation
- `npm run lint`
- `npm run test`

## Rollback plan
- Revert the commit that introduces `upgradeToPro` API call and `UpgradeToProButton`.
- Restore static pricing CTA behavior.

## Follow-ups
- Replace temporary in-app upgrade with payment-backed subscription flow when backend payment endpoints are available.
