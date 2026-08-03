# Change Brief

## Context
The frontend already handles registration `201` and `202` responses, but its synced contracts and tests describe allowlist-based access.

## Goal
Synchronize the capacity-based registration contract and verify the existing signup UI against it.

## In-scope
- Pull the shared registration contract from the backend docs checkout.
- Update signup test descriptions and fixtures to describe capacity-based waitlisting.

## Out-of-scope
- Changing signup production code, API types, or authentication behavior.
- Adding a client-side capacity query or hardcoded capacity decision.

## Affected area
- Frontend
- Synced contracts and signup tests only.

## Contract impact
- Contract sync: `201` means an account was created below capacity; `202` means capacity was reached.

## Data impact
- None.

## Risks
Stale frontend fixtures could conceal a mismatch with the backend waitlist response.

## Tests to update
- Unit: signup and API response handling descriptions/fixtures.
- Integration: None.
- UI: signup `201` verification and `202` waitlist states.
