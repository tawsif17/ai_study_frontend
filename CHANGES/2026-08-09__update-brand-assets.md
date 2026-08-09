# Change Brief

## Context
The frontend uses an outdated horizontal Shikkha Buddy logo through the shared `BrandLogo` component. The generated Open Graph image also uses a text-only `SB` placeholder instead of an approved brand asset. Updated production wordmark and monogram assets are available in the workspace.

## Goal
Use the approved primary Shikkha Buddy wordmark across existing shared logo placements and the approved blue monogram in generated social previews.

## In-scope
- Replace the shared production wordmark asset.
- Update the shared logo's intrinsic dimensions for the new asset.
- Replace the Open Graph placeholder mark with the approved monogram.
- Update or add focused tests for the shared logo and Open Graph image.
- Verify responsive navbar, footer, and social-preview rendering.

## Out-of-scope
- Changing browser favicons, shortcut icons, Apple home-screen icons, or app icons.
- Changing backend code, APIs, contracts, database behavior, or architecture.
- Refactoring unrelated frontend code or changing existing Open Graph copy.
- Reusing or modifying the stale `origin/Logo_update` branch.

## Affected area
- Frontend
- Files/modules involved: shared brand assets, `BrandLogo`, generated Open Graph image, and focused tests.

## Contract impact
- No contract change

## Data impact
- None

## Risks
The new wordmark has a taller intrinsic aspect ratio and could cause navigation or footer layout regressions at narrow widths. The Open Graph renderer must load the local monogram reliably during builds and preserve the existing 1200 x 630 card layout.

## Tests to update
- Unit: Update `BrandLogo` asset and intrinsic-dimension assertions.
- Integration: Verify the generated Open Graph image embeds the approved monogram.
- UI: Visually verify navbar, footer, and Open Graph rendering at representative viewport sizes.
