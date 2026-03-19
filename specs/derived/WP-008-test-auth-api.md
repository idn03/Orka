# WP-008: Auth API Tests

> **Assigned to**: tester
> **Priority**: 3 (test after WP-002 is implemented)

---

## Description

Write integration tests for the authentication endpoints (register, NextAuth login, NextAuth logout, auth middleware).

---

## Test Cases

### Registration — POST /api/auth/register

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Register with valid email, name, password | 201, returns `{ id, email, name }` without password |
| 2 | Register with missing email | 400, `{ "errors": { "email": "..." } }` |
| 3 | Register with missing name | 400, `{ "errors": { "name": "..." } }` |
| 4 | Register with missing password | 400, `{ "errors": { "password": "..." } }` |
| 5 | Register with password < 8 characters | 400, `{ "errors": { "password": "..." } }` |
| 6 | Register with invalid email format | 400, `{ "errors": { "email": "..." } }` |
| 7 | Register with already-used email | 409, `{ "errors": { "email": "Email already registered" } }` |
| 8 | Register and verify password is hashed in DB | DB stores bcrypt hash, not plaintext |
| 9 | Register with whitespace-only name | 400, `{ "errors": { "name": "..." } }` |
| 10 | Register with email containing leading/trailing spaces | Email is trimmed and accepted |
| 11 | Register with multiple invalid fields | 400, multiple keys in `errors` object |

### Login — NextAuth Credentials

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Login with valid credentials | Session cookie set, user data returned |
| 2 | Login with wrong password | Error, no session |
| 3 | Login with non-existent email | Error, no session |
| 4 | Login with missing email | Error |
| 5 | Login with missing password | Error |

### Logout — NextAuth signOut

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Logout while authenticated | Session cookie cleared |
| 2 | Subsequent request after logout | 401, not authenticated |

### Auth Middleware / getSession()

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Access protected route without session | 401, `{ "errors": { "auth": "Not authenticated" } }` |
| 2 | Access protected route with valid session | 200, request proceeds |
| 3 | Access protected route with expired/invalid cookie | 401 |

---

## Context

- Tests should run against a real PostgreSQL test database.
- Clean up test data between test runs (use Prisma's reset or transaction rollback).
- Use a test framework compatible with Next.js (Vitest recommended).
- Auth tests must account for NextAuth.js cookie-based sessions.

---

## Acceptance Criteria

- [ ] All registration test cases pass (including per-field error format)
- [ ] All login test cases pass
- [ ] All logout test cases pass
- [ ] Auth middleware test cases pass (including error format)
- [ ] No test data leaks between test runs
