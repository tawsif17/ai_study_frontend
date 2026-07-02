# Change Brief

## Context
The practice UI exposes internal database identifiers and currently presents Bangla, CQ, and Mixed practice as active options. For the current release, users should only be able to start English MCQ practice while seeing that other options are planned.

## Goal
Hide internal question/session IDs, make English the only active language, and render Bangla, CQ, and Mixed as polished responsive coming-soon states.

## In-scope
- Remove visible database question ID from the active practice screen.
- Remove visible practice session ID from the results screen.
- Submit MCQ practice generation with English language only.
- Show Bangla as coming soon and disabled.
- Show CQ and Mixed cards as visible but non-interactive coming-soon options.
- Add focused tests for the behavior.

## Out-of-scope
- Backend enforcement for unavailable modes/languages.
- API contract changes.
- Data model or migration changes.
- Refactoring unrelated practice/session flows.

## Affected area
- Frontend
- Components involved: practice session content, practice results content, practice config cards, subject detail card wiring.

## Contract impact
- No contract change

## Data impact
- None

## Risks
Users may expect CQ, Mixed, or Bangla to be available because the cards remain visible. The coming-soon state needs to be visually clear and non-clickable on all viewport sizes.

## Tests to update
- Unit: practice config card interactions and payload.
- Integration/UI: hidden internal IDs in practice and results views.
