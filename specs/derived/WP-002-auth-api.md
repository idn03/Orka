# WP-002: Authentication API (NextAuth.js)

> **Assigned to**: implementer
> **Priority**: 2 (depends on WP-001)

---

## Description

Implement authentication using **NextAuth.js** with a Credentials provider backed by PostgreSQL. Provides register, login, logout, and session management.

---

## Requirements

### NextAuth.js Setup

- Use NextAuth.js v5 (Auth.js) with the **Credentials** provider.
- Use **Prisma adapter** for session/user storage if needed, or use JWT strategy.
- Configure in `auth.ts` at the project root or `src/lib/auth.ts`.

### POST /api/auth/register

Custom route (not part of NextAuth — implement as a standard Next.js API route).

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
- `name`: required, non-empty (after trimming whitespace)
- `password`: required, minimum 8 characters

**Success response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Jane Doe"
}
```

**Error responses (per-field format):**
- 400: `{ "errors": { "email": "Invalid email format", "password": "Must be at least 8 characters" } }`
- 409: `{ "errors": { "email": "Email already registered" } }`

**Behavior:**
- Hash password with bcrypt (cost factor 10+) before storing
- Never return the password in any response
- Trim whitespace from `name` and `email`

### Login

Handled by NextAuth.js Credentials provider:
- `POST /api/auth/callback/credentials` (NextAuth route)
- Verify email + password against bcrypt hash in database
- On success: establish a JWT or session cookie via NextAuth
- On failure: return error (handled by NextAuth)

### Logout

Handled by NextAuth.js:
- `POST /api/auth/signout` (NextAuth route)
- Destroys the session/cookie

### Session / Auth Middleware

- Use NextAuth.js `auth()` helper to get the current session in server components and API routes.
- Create a reusable `getSession()` wrapper that:
  - Returns the current user if authenticated
  - Returns `null` if not authenticated
- In API routes, return `401` with `{ "errors": { "auth": "Not authenticated" } }` if no session.

### GET /api/auth/session

Built-in NextAuth route:
- Returns current session data if authenticated
- Returns `null`/empty if not

---

## Context

- Tech stack: Next.js (App Router), NextAuth.js v5, Prisma, PostgreSQL.
- NextAuth.js handles session token management, CSRF protection, and cookie security automatically.
- The register endpoint is custom because NextAuth Credentials provider does not include registration.
- All task-related endpoints (WP-003+) will use the `getSession()` wrapper to enforce auth.

---

## Acceptance Criteria

- [ ] NextAuth.js is configured with Credentials provider
- [ ] POST /api/auth/register creates a user with hashed password and returns 201
- [ ] POST /api/auth/register returns 409 with per-field error for duplicate email
- [ ] POST /api/auth/register returns 400 with per-field errors for invalid input
- [ ] Login via NextAuth establishes a session for valid credentials
- [ ] Login fails with error for invalid credentials
- [ ] Logout destroys the session
- [ ] `getSession()` helper returns current user or null
- [ ] API routes return 401 with per-field error format when not authenticated
- [ ] Passwords are never returned in any API response
- [ ] Whitespace-only names are rejected
