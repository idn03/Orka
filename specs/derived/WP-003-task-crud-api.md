# WP-003: Task CRUD API

> **Assigned to**: implementer
> **Priority**: 3 (depends on WP-001, WP-002)

---

## Description

Implement the core task CRUD (Create, Read, Update, Delete) API routes. All routes require authentication.

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
- `title`: required, non-empty, max 255 characters
- `description`: optional
- `due_date`: optional, must be a valid date string (YYYY-MM-DD)
- `assignee_id`: optional, must reference an existing user if provided
- `parent_id`: optional, must reference an existing task if provided
- If `parent_id` is set, the referenced task must NOT itself be a subtask (enforce one-level nesting)

**Behavior:**
- `status` is always set to `TODO` on creation (not user-provided)
- `creator_id` is set to the authenticated user's ID

**Success response (201):** the created task object

**Error responses:**
- 400: validation error
- 401: not authenticated
- 404: referenced parent_id or assignee_id not found
- 422: parent_id references a subtask (nesting depth violation)

### GET /api/tasks

List tasks with optional filters.

**Query parameters (all optional):**
- `search` — case-insensitive substring match on title
- `status` — exact match on status enum (TODO, IN_PROGRESS, IN_REVIEW, DONE)
- `assignee_id` — exact match on assignee UUID
- `due` — one of: `overdue`, `today`, `this_week`, `none`
  - `overdue`: due_date < today AND status ≠ DONE
  - `today`: due_date = today
  - `this_week`: due_date between today and end of current week (Sunday)
  - `none`: due_date IS NULL
- `parent_id` — filter tasks by parent; use `null` to get only top-level tasks

**Behavior:**
- When no `parent_id` filter is given, return all tasks (top-level and subtasks)
- Multiple filters combine with AND logic
- Return tasks ordered by `created_at` descending

**Success response (200):** array of task objects

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
  "subtasks": [
    { "id": "uuid", "title": "...", "status": "TODO", ... }
  ]
}
```

**Error responses:**
- 401: not authenticated
- 404: task not found

### PATCH /api/tasks/:id

Update a task's fields. Only provided fields are updated.

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

**Special behavior:**
- When `status` is changed to `DONE` and the task has subtasks, all subtasks with status ≠ DONE must also be set to `DONE`
- `updated_at` is refreshed on every update

**Success response (200):** the updated task object

**Error responses:**
- 400: validation error
- 401: not authenticated
- 404: task not found
- 422: nesting depth violation

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

- Tech stack: Next.js API routes, PostgreSQL.
- All routes require the auth middleware from WP-002.
- Cascade delete of subtasks is handled at the database level (FK ON DELETE CASCADE from WP-001).
- The status enum values are: TODO, IN_PROGRESS, IN_REVIEW, DONE.

---

## Acceptance Criteria

- [ ] POST /api/tasks creates a task with status=TODO and creator_id from session
- [ ] POST /api/tasks validates title is required and max 255 chars
- [ ] POST /api/tasks rejects parent_id that is itself a subtask (one-level nesting)
- [ ] GET /api/tasks returns all tasks ordered by created_at desc
- [ ] GET /api/tasks filters by search, status, assignee_id, due, parent_id
- [ ] GET /api/tasks combines multiple filters with AND logic
- [ ] GET /api/tasks/:id returns task with subtasks array
- [ ] PATCH /api/tasks/:id updates only provided fields
- [ ] PATCH /api/tasks/:id setting status=DONE cascades to subtasks
- [ ] PATCH /api/tasks/:id enforces nesting constraints on parent_id change
- [ ] DELETE /api/tasks/:id deletes the task (subtasks cascade-deleted by DB)
- [ ] All routes return 401 when not authenticated
