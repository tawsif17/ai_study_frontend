# Change Brief

## Context
The authenticated subject catalogue already receives authoritative subject names and IDs from `GET /api/subjects`, but the subject grid uses those rows only to filter a fixed presentation list. As a result, the database value `Mathematics` is displayed as the hardcoded label `General Math`. Public product copy repeats the outdated label.

## Goal
Display database-provided subject names verbatim in authenticated catalogue cards and use `Mathematics` consistently in static public copy.

## In-scope
- Render every authenticated catalogue subject in API order.
- Use database IDs and names for authenticated subject cards and destinations.
- Retain frontend-only icons, colors, and topic summaries for known subjects.
- Provide a generic presentation for future database subjects.
- Update public Mathematics wording and focused tests.

## Out-of-scope
- Changing the subject API, authentication, response contracts, or backend queries.
- Changing database rows or adding a migration.
- Making the personalized subject catalogue public.
- Rewriting historical feature documentation.

## Affected area
- Frontend
- Files/modules involved: subject presentation helpers, subject cards, subject selection, public subject copy, and focused tests.

## Contract impact
- No contract change

## Data impact
- None

## Risks
Future subjects may not have dedicated visual treatment. Existing unauthenticated login-return links must continue resolving Mathematics and legacy math-name variants safely after authentication.

## Tests to update
- Unit: Authenticated catalogue names, ordering, ID destinations, generic subject presentation, and public preview.
- Integration: Selected-subject resume using the authenticated catalogue.
- UI: Public wording and responsive subject cards.
