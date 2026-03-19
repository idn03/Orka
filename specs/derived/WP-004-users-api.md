# WP-004: Users List API

> **Assigned to**: implementer
> **Priority**: 3 (depends on WP-001, WP-002)

---

## Description

Implement an endpoint to list registered users. This is used by the frontend assignee picker when creating or editing tasks.

---

## Requirements

### GET /api/users

Return a list of all registered users.

**Success response (200):**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane Doe"
  }
]
```

**Behavior:**
- Requires authentication (return 401 if not authenticated)
- Return all users in the system (single-workspace PoC — no filtering by workspace)
- Never include password or other sensitive fields
- Order by name ascending

**Error responses:**
- 401: `{ "errors": { "auth": "Not authenticated" } }`

---

## Context

- Tech stack: Next.js API routes (App Router), Prisma, PostgreSQL.
- This endpoint is consumed by the assignee dropdown in task create/edit forms.
- Keep the response lean — only id, email, name.
- No avatar_url field — UI uses initials-only avatars.

---

## Acceptance Criteria

- [ ] GET /api/users returns all users with id, email, name
- [ ] No avatar_url, password, or other fields are included
- [ ] Returns 401 with per-field error format when not authenticated
- [ ] Users are ordered by name ascending
