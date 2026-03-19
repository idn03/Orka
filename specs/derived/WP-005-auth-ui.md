# WP-005: Authentication UI

> **Assigned to**: implementer
> **Priority**: 4 (depends on WP-002)

---

## Description

Build the login and registration pages. These are the entry points for unauthenticated users.

---

## Requirements

### Login Page — /login

- Form fields: email, password
- Submit calls POST /api/auth/login
- On success: redirect to /tasks
- On error: display error message inline (e.g., "Invalid email or password")
- Link to registration page: "Don't have an account? Register"

### Register Page — /register

- Form fields: name, email, password
- Submit calls POST /api/auth/register
- On success: automatically log the user in and redirect to /tasks
- On validation error: display inline error messages per field
- On duplicate email: display "Email already registered"
- Link to login page: "Already have an account? Log in"

### Route Protection

- Unauthenticated users visiting /tasks (or any task route) are redirected to /login
- Authenticated users visiting /login or /register are redirected to /tasks

---

## Context

- Tech stack: Next.js, Shadcn UI, Tailwind CSS.
- Use Shadcn UI form components (Input, Button, Label, Card).
- Form validation should happen both client-side (immediate feedback) and server-side (API validation).
- Auth session mechanism is whatever WP-002 implemented (cookie, JWT, etc).

---

## Acceptance Criteria

- [ ] /login renders a form with email and password fields
- [ ] /login submits to POST /api/auth/login and redirects to /tasks on success
- [ ] /login displays error messages for invalid credentials
- [ ] /register renders a form with name, email, and password fields
- [ ] /register submits to POST /api/auth/register and auto-logs in on success
- [ ] /register displays validation errors and duplicate email errors
- [ ] Unauthenticated users are redirected from /tasks to /login
- [ ] Authenticated users are redirected from /login and /register to /tasks
