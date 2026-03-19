# WP-005: Authentication UI

> **Assigned to**: implementer
> **Priority**: 4 (depends on WP-002)

---

## Description

Build the login and registration pages using NextAuth.js for session management. These are the entry points for unauthenticated users.

---

## Requirements

### Login Page — /login

- Form fields: email, password
- Use NextAuth.js `signIn("credentials", ...)` to authenticate
- On success: redirect to /tasks
- On error: display error message inline (e.g., "Invalid email or password")
- Link to registration page: "Don't have an account? Register"
- Client-side validation: email format, password non-empty

### Register Page — /register

- Form fields: name, email, password
- Submit calls POST /api/auth/register
- On success: automatically sign in via NextAuth.js and redirect to /tasks
- On validation error: display per-field inline error messages from the API response `errors` object
  - Map each key in `errors` to the corresponding form field
- On duplicate email: display "Email already registered" under the email field
- Link to login page: "Already have an account? Log in"
- Client-side validation: name non-empty, email format, password >= 8 chars

### Route Protection

- Use NextAuth.js middleware or server-side session check
- Unauthenticated users visiting /tasks (or any /tasks/* route) are redirected to /login
- Authenticated users visiting /login or /register are redirected to /tasks

### Navigation

- No app header on login/register pages (clean, centered layout)
- After login, user lands on /tasks which has the full app header

---

## Context

- Tech stack: Next.js (App Router), NextAuth.js v5, Shadcn UI, Tailwind CSS.
- Use Shadcn UI form components: Input, Button, Label, Card.
- Form validation should happen both client-side (immediate feedback) and server-side (API error mapping).
- Avatars use initials only (no avatar_url or upload).

---

## Acceptance Criteria

- [ ] /login renders a centered card with email and password fields
- [ ] /login authenticates via NextAuth.js signIn and redirects to /tasks on success
- [ ] /login displays inline error for invalid credentials
- [ ] /register renders a centered card with name, email, and password fields
- [ ] /register calls POST /api/auth/register and auto-signs in on success
- [ ] /register maps API per-field errors to form fields
- [ ] /register shows "Email already registered" under email field for 409
- [ ] Client-side validation runs before API call on both forms
- [ ] Unauthenticated users are redirected from /tasks/* to /login
- [ ] Authenticated users are redirected from /login and /register to /tasks
