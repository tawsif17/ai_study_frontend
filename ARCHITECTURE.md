# ARCHITECTURE

## Stack
- Next.js `16.2.11` (App Router)
- React `19.2.0`
- TypeScript (`strict: true`)
- Tailwind CSS v4 toolchain (`tailwindcss`, `@tailwindcss/postcss`)

## Repo Layout
- `app/`: route entries and top-level app layout
- `components/`: feature components + shared `components/ui/*`
- `hooks/`: shared hooks
- `lib/`: utilities, auth context, API client/hooks/types
- `styles/`: global styles
- `public/`: static assets

## Routing (from `app/`)
- `/` -> `app/page.tsx`
- `/how-it-works` -> `app/how-it-works/page.tsx`
- `/subjects` -> `app/subjects/page.tsx`
- `/subjects/[slug]` -> `app/subjects/[slug]/page.tsx`
- `/practice/[id]` -> `app/practice/[id]/page.tsx`
- `/dashboard/weak-areas` -> `app/dashboard/weak-areas/page.tsx`
- `/pricing` -> `app/pricing/page.tsx`
- `/login` -> `app/login/page.tsx`
- `/signup` -> `app/signup/page.tsx`

## API Surface In This Repo
- Client-side API layer exists in `lib/api/*`.
- No Next.js route handlers found under `app/api`.
- Protected API calls use credentialed HttpOnly cookie sessions; bearer authentication is not used.
- `lib/api/client.ts` keeps session-bound CSRF tokens in memory, deduplicates refresh work, and
  performs bounded retry for expired access sessions and exact CSRF failures.
- `lib/auth-context.tsx` restores the current account through `/api/auth/me`, owns cross-tab session
  synchronization, and clears authenticated SWR caches when a session ends.

## Build/Config Facts
- NPM scripts in `package.json`: `dev`, `lint`, `build`, `start`, `test`, `test:coverage`, `test:e2e`.
- Import alias in `tsconfig.json`: `@/*` -> `./*`.
- `next.config.mjs` sets:
  - `typescript.ignoreBuildErrors = true`
  - `images.unoptimized = true`
