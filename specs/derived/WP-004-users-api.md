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
    "name": "Jane Doe",
    "avatar_url": "https://..."
  }
]
```

**Behavior:**
- Requires authentication (return 401 if not authenticated)
- Return all users in the system
- Never include password or other sensitive fields
- Order by name ascending

**Error responses:**
- 401: not authenticated

---

## Context

- Tech stack: Next.js API routes, PostgreSQL.
- This endpoint is consumed by the assignee dropdown in task create/edit forms.
- Keep the response lean — only the fields needed for display and selection.

---

## Acceptance Criteria

- [ ] GET /api/users returns all users with id, email, name, avatar_url
- [ ] Passwords are never included in the response
- [ ] Returns 401 when not authenticated
- [ ] Users are ordered by name ascending
