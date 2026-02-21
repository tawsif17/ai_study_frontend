# ARCHITECTURE

## Stack
- Next.js `16.0.3` (App Router)
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

## Build/Config Facts
- NPM scripts in `package.json`: `dev`, `lint`, `build`, `start`.
- Import alias in `tsconfig.json`: `@/*` -> `./*`.
- `next.config.mjs` sets:
  - `typescript.ignoreBuildErrors = true`
  - `images.unoptimized = true`