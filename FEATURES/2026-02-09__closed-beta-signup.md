# Closed Beta Signup

## Summary
Implement frontend signup behavior for the closed beta contract in `project_docs/CONTRACTS/`. Signup continues to use `POST /api/auth/register`; allowlisted users receive an account, while non-allowlisted users have signup interest recorded.

Contract source: `project_docs/CONTRACTS/api.md`

## Screens
- `/signup`
- `/login`

## UX states
- Loading
  - Disable signup fields and submit while `POST /api/auth/register` is in flight.
  - Keep button dimensions stable while showing `Creating account...`.
- Empty
  - Signup form starts with empty name, email, password, school, city, and class fields.
  - Submit remains disabled until class is selected; native required fields gate submit.
- Error
  - Show backend/client validation messages in a form alert.
  - Preserve entered form values except where the browser blocks invalid submission.
- Success
  - `201`: redirect to `/login?registered=true&email=<email>` and show `Registration successful. You can now log in.`
  - `202`: remain on `/signup`, clear password, and show the backend private beta interest-captured message.

## API usage
- Endpoint: `POST /api/auth/register`
- Auth: none
- Source schema: `project_docs/CONTRACTS/schemas/auth.register.post.json`
- Success examples:
  - `project_docs/CONTRACTS/examples/auth.register.post.response.json`
  - `project_docs/CONTRACTS/examples/auth.register.post.response.private-beta.json`
- Required payload fields:
  - `email`
  - `password`
  - `fullName`
  - `school`
  - `city`
  - `studentClass`
- Status handling:
  - `201`: allowlisted beta account created.
  - `202`: signup interest recorded; no account created.

## Validation
- Payload must not include fields outside the contract schema.
- `password` must be at least 8 characters and include uppercase, lowercase, and a number.
- `studentClass` must be an integer.
- `email`, `fullName`, `school`, and `city` are required strings.

## Tests
- UI
  - Signup redirects to login on `201`.
  - Signup shows private beta success in place on `202`.
  - Signup shows API errors and re-enables controls.
  - Signup disables controls while submitting.
  - Login registered copy says the user can now log in.
- Integration
  - `register()` calls `POST /auth/register` with the exact contract payload.
  - Register validation accepts the contract example payload.
  - Register validation rejects weak passwords and extra fields.
