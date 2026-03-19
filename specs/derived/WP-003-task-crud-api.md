# WP-003: Task CRUD API

> **Assigned to**: implementer
> **Priority**: 3 (depends on WP-001, WP-002)

---

## Description

Implement the core task CRUD (Create, Read, Update, Delete) API routes. All routes require authentication and return structured error responses.

---

## Error Response Format

All validation errors use per-field format:
```json
{
  "errors": {
    "title": "Title is required",
    "parent_id": "Parent task not found"
  }
}
```

Auth errors:
```json
{
  "errors": { "auth": "Not authenticated" }
}
```

---

## Requirements

### POST /api/tasks

Create a new task.

**Request body:**
```json
{
  "title": "Implement login page",
  "description": "Build the login form with email/password fields",
  "due_date": "2026-04-01",
  "assignee_id": "uuid-or-null",
  "parent_id": "uuid-or-null"
}
```

**Validation:**
- `title`: required, non-empty after trimming, max 255 characters. Whitespace-only strings are rejected.
- `description`: optional
- `due_date`: optional, must be a valid date string (YYYY-MM-DD). Past dates are allowed.
- `assignee_id`: optional, must reference an existing user if provided
- `parent_id`: optional, must reference an existing task if provided
- If `parent_id` is set, the referenced task must NOT itself be a subtask (enforce one-level nesting)
- If `parent_id` is set, it must not create a circular reference

**Behavior:**
- `status` is always set to `TODO` on creation (not user-provided)
- `creator_id` is set to the authenticated user's ID
- Trim whitespace from `title`

**Success response (201):** the created task object (see response shape below)

**Error responses:**
- 400: `{ "errors": { "title": "Title is required" } }`
- 401: `{ "errors": { "auth": "Not authenticated" } }`
- 404: `{ "errors": { "parent_id": "Parent task not found" } }`
- 422: `{ "errors": { "parent_id": "Cannot nest subtask under another subtask" } }`

### GET /api/tasks

List tasks with optional filters.

**Query parameters (all optional):**
- `search` — case-insensitive substring match on title (uses ILIKE)
- `status` — exact match on status enum (TODO, IN_PROGRESS, IN_REVIEW, DONE)
- `assignee_id` — exact match on assignee UUID
- `due` — one of: `overdue`, `today`, `this_week`, `none`
  - `overdue`: due_date < today AND status ≠ DONE
  - `today`: due_date = today
  - `this_week`: due_date between today and end of current week (Sunday)
  - `none`: due_date IS NULL
- `parent_id` — filter tasks by parent; use literal string `null` to get only top-level tasks

**Behavior:**
- When no `parent_id` filter is given, return all tasks (top-level and subtasks)
- Multiple filters combine with AND logic
- Return tasks ordered by `created_at` descending

**Response shape** — each task object includes `subtask_count`:
```json
{
  "id": "uuid",
  "title": "...",
  "description": "...",
  "status": "TODO",
  "due_date": "2026-04-01",
  "parent_id": null,
  "assignee_id": "uuid",
  "creator_id": "uuid",
  "created_at": "...",
  "updated_at": "...",
  "subtask_count": 3,
  "assignee": { "id": "uuid", "name": "Alice", "email": "alice@orka.dev" }
}
```

**Notes:**
- `subtask_count` is an integer count of child tasks (computed via subquery or `_count` in Prisma)
- `assignee` is an embedded object (or `null` if unassigned) — avoids separate lookups in the UI
- Success response is an array of task objects

### GET /api/tasks/:id

Get a single task with its subtasks.

**Success response (200):**
```json
{
  "id": "uuid",
  "title": "...",
  "description": "...",
  "status": "TODO",
  "due_date": "2026-04-01",
  "parent_id": null,
  "assignee_id": "uuid",
  "creator_id": "uuid",
  "created_at": "...",
  "updated_at": "...",
  "assignee": { "id": "uuid", "name": "Alice", "email": "alice@orka.dev" },
  "creator": { "id": "uuid", "name": "Bob", "email": "bob@orka.dev" },
  "subtasks": [
    {
      "id": "uuid",
      "title": "...",
      "status": "TODO",
      "due_date": null,
      "assignee_id": "uuid",
      "assignee": { "id": "uuid", "name": "Alice", "email": "alice@orka.dev" }
    }
  ]
}
```

**Notes:**
- Include full `assignee` and `creator` objects (not just IDs)
- Include `subtasks` array with each subtask's assignee
- If the task is a subtask, include a `parent` object with `{ id, title }`

**Error responses:**
- 401: not authenticated
- 404: task not found

### PATCH /api/tasks/:id

Update a task's fields. Only provided fields are updated (partial update).

**Request body (all fields optional):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "due_date": "2026-04-15",
  "assignee_id": "uuid-or-null",
  "parent_id": "uuid-or-null"
}
```

**Validation:**
- Same validation rules as create for each field
- If `parent_id` is changed, enforce one-level nesting
- A task that has subtasks cannot be made a subtask of another task
- Cannot set `parent_id` to self
- Cannot create circular reference (A parent of B, B parent of A)

**Status transition rules:**
- Status can be changed freely in any direction (TODO ↔ IN_PROGRESS ↔ IN_REVIEW ↔ DONE — no forced progression)
- When `status` is changed to `DONE` and the task has subtasks, all subtasks with status ≠ DONE must also be set to `DONE`
- Moving a parent from DONE to another status does NOT change subtask statuses (only forward cascade to DONE)

**Other behavior:**
- `updated_at` is refreshed on every update
- Setting `assignee_id` to `null` unassigns the task

**Success response (200):** the updated task object (same shape as GET detail)

**Error responses:**
- 400: validation error (per-field)
- 401: not authenticated
- 404: task not found
- 422: nesting depth violation (per-field)

### DELETE /api/tasks/:id

Delete a task. If the task has subtasks, they are cascade-deleted by the database.

**Success response (200):**
```json
{ "message": "Task deleted" }
```

**Error responses:**
- 401: not authenticated
- 404: task not found

---

## Context

- Tech stack: Next.js API routes (App Router), Prisma, PostgreSQL.
- All routes require the `getSession()` helper from WP-002.
- Cascade delete of subtasks is handled at the database level (FK ON DELETE CASCADE from WP-001).
- The status enum values are: TODO, IN_PROGRESS, IN_REVIEW, DONE.
- Use Prisma's `include` and `_count` features for related data and subtask counts.

---

## Acceptance Criteria

- [ ] POST /api/tasks creates a task with status=TODO and creator_id from session
- [ ] POST /api/tasks validates title is required, trimmed, and max 255 chars
- [ ] POST /api/tasks rejects whitespace-only titles
- [ ] POST /api/tasks rejects parent_id that is itself a subtask (one-level nesting)
- [ ] POST /api/tasks rejects non-existent parent_id or assignee_id with 404
- [ ] GET /api/tasks returns tasks with subtask_count and assignee object
- [ ] GET /api/tasks filters by search (ILIKE), status, assignee_id, due, parent_id
- [ ] GET /api/tasks combines multiple filters with AND logic
- [ ] GET /api/tasks orders by created_at descending
- [ ] GET /api/tasks/:id returns task with subtasks array, assignee, and creator objects
- [ ] PATCH /api/tasks/:id updates only provided fields
- [ ] PATCH /api/tasks/:id allows free status transitions in any direction
- [ ] PATCH /api/tasks/:id setting status=DONE cascades to subtasks
- [ ] PATCH /api/tasks/:id moving from DONE to another status does NOT cascade to subtasks
- [ ] PATCH /api/tasks/:id enforces nesting constraints on parent_id change
- [ ] DELETE /api/tasks/:id deletes the task (subtasks cascade-deleted by DB)
- [ ] All routes return 401 with per-field error format when not authenticated
- [ ] All validation errors use per-field format `{ "errors": { "field": "message" } }`
