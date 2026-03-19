# WP-010: Users List API Tests

> **Assigned to**: tester
> **Priority**: 4 (test after WP-004 is implemented)

---

## Description

Write integration tests for the users list endpoint.

---

## Test Cases

### List Users — GET /api/users

| # | Test case                                      | Expected                                    |
|---|------------------------------------------------|---------------------------------------------|
| 1 | List users when authenticated                  | 200, array of user objects                  |
| 2 | Verify response includes id, email, name, avatar_url | All required fields present            |
| 3 | Verify password is NOT in response             | No password field in any user object        |
| 4 | Verify users are ordered by name ascending     | Alphabetical order by name                  |
| 5 | List users without authentication              | 401                                         |

---

## Context

- Tests should run against a real PostgreSQL database (test database).
- Create multiple test users before running these tests.
- Clean up test data between test runs.

---

## Acceptance Criteria

- [ ] All list users test cases pass
- [ ] Password is never exposed
- [ ] Ordering is correct
