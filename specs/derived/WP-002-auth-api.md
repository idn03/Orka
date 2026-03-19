# WP-002: Authentication API

> **Assigned to**: implementer
> **Priority**: 2 (depends on WP-001)

---

## Description

Implement authentication API routes for user registration, login, and logout. All subsequent API routes depend on a working auth system.

---

## Requirements

### POST /api/auth/register

Create a new user account.

**Request body:**
```json
{
  "email": "user@example.com",
  "name": "Jane Doe",
  "password": "securepassword"
}
```

**Validation:**
- `email`: required, valid email format, must not already exist
- `name`: required, non-empty
- `password`: required, minimum 8 characters

**Success response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Jane Doe"
}
```

**Error responses:**
- 400: validation error (missing/invalid fields)
- 409: email already registered

**Behavior:**
- Hash password with bcrypt before storing
- Never return the password in any response

### POST /api/auth/login

Authenticate a user and create a session.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Success response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Jane Doe"
}
```

**Error responses:**
- 401: invalid email or password

**Behavior:**
- Verify password against stored bcrypt hash
- Establish a session (cookie-based or JWT — implementer's choice)

### POST /api/auth/logout

End the user's session.

**Success response (200):**
```json
{ "message": "Logged out" }
```

### Auth Middleware

Create a reusable auth middleware/helper that:
- Extracts the current user from the session
- Returns 401 if no valid session exists
- Makes the current user available to route handlers

---

## Context

- Tech stack: Next.js API routes or Server Actions, PostgreSQL.
- Auth method is flexible (NextAuth.js, custom JWT, cookie sessions — implementer's choice).
- All task-related endpoints (WP-003 and beyond) will depend on this auth middleware.

---

## Acceptance Criteria

- [ ] POST /api/auth/register creates a user with hashed password and returns 201
- [ ] POST /api/auth/register returns 409 for duplicate email
- [ ] POST /api/auth/register returns 400 for invalid input
- [ ] POST /api/auth/login returns 200 and establishes a session for valid credentials
- [ ] POST /api/auth/login returns 401 for invalid credentials
- [ ] POST /api/auth/logout ends the session and returns 200
- [ ] Auth middleware rejects unauthenticated requests with 401
- [ ] Passwords are never returned in any API response
