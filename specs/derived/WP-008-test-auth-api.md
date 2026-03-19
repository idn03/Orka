# WP-008: Auth API Tests

> **Assigned to**: tester
> **Priority**: 3 (test after WP-002 is implemented)

---

## Description

Write integration tests for the authentication API endpoints (register, login, logout, auth middleware).

---

## Test Cases

### Registration — POST /api/auth/register

| # | Test case                                      | Expected                                    |
|---|------------------------------------------------|---------------------------------------------|
| 1 | Register with valid email, name, password      | 201, returns user object without password    |
| 2 | Register with missing email                    | 400, validation error                       |
| 3 | Register with missing name                     | 400, validation error                       |
| 4 | Register with missing password                 | 400, validation error                       |
| 5 | Register with password < 8 characters          | 400, validation error                       |
| 6 | Register with invalid email format             | 400, validation error                       |
| 7 | Register with already-used email               | 409, duplicate email error                  |
| 8 | Register and verify password is hashed in DB   | DB stores bcrypt hash, not plaintext        |

### Login — POST /api/auth/login

| # | Test case                                      | Expected                                    |
|---|------------------------------------------------|---------------------------------------------|
| 1 | Login with valid credentials                   | 200, returns user object, sets session      |
| 2 | Login with wrong password                      | 401, invalid credentials                    |
| 3 | Login with non-existent email                  | 401, invalid credentials                    |
| 4 | Login with missing email                       | 400 or 401                                  |
| 5 | Login with missing password                    | 400 or 401                                  |

### Logout — POST /api/auth/logout

| # | Test case                                      | Expected                                    |
|---|------------------------------------------------|---------------------------------------------|
| 1 | Logout while authenticated                     | 200, session is ended                       |
| 2 | Subsequent request after logout                | 401, not authenticated                      |

### Auth Middleware

| # | Test case                                      | Expected                                    |
|---|------------------------------------------------|---------------------------------------------|
| 1 | Access protected route without session          | 401                                         |
| 2 | Access protected route with valid session       | 200, request proceeds                       |

---

## Context

- Tests should run against a real PostgreSQL database (test database).
- Clean up test data between test runs.
- Use a test framework compatible with Next.js (e.g., Jest, Vitest).
- Tests make HTTP requests to the API routes.

---

## Acceptance Criteria

- [ ] All registration test cases pass
- [ ] All login test cases pass
- [ ] All logout test cases pass
- [ ] Auth middleware test cases pass
- [ ] No test data leaks between test runs
