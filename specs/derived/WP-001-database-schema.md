# WP-001: Database Schema & Migrations

> **Assigned to**: implementer
> **Priority**: 1 (foundational — all other work packages depend on this)

---

## Description

Set up the PostgreSQL database schema for the task management app. Create migration files that define all tables, enums, indexes, and constraints. Use Prisma as the ORM.

---

## Requirements

### ORM Setup

- Use **Prisma** with PostgreSQL.
- Define models in `prisma/schema.prisma`.
- Generate migrations via `npx prisma migrate dev`.

### Enum: task_status

Define a PostgreSQL enum with values:
- `TODO`
- `IN_PROGRESS`
- `IN_REVIEW`
- `DONE`

### Table: users

| Column     | Type                    | Constraints                      |
|------------|-------------------------|----------------------------------|
| id         | UUID                    | PK, default gen_random_uuid()    |
| email      | VARCHAR(255)            | UNIQUE, NOT NULL                 |
| name       | VARCHAR(255)            | NOT NULL                         |
| password   | VARCHAR(255)            | NOT NULL (bcrypt hash)           |
| created_at | TIMESTAMP WITH TIME ZONE| NOT NULL, default NOW()          |
| updated_at | TIMESTAMP WITH TIME ZONE| NOT NULL, auto-updated           |

**Notes:**
- No `avatar_url` column — avatars use initials only in UI.
- The `password` column stores bcrypt-hashed passwords, never plaintext.

### Table: tasks

| Column      | Type                    | Constraints                              |
|-------------|-------------------------|------------------------------------------|
| id          | UUID                    | PK, default gen_random_uuid()            |
| title       | VARCHAR(255)            | NOT NULL                                 |
| description | TEXT                    | NULL                                     |
| status      | task_status             | NOT NULL, default 'TODO'                 |
| due_date    | DATE                    | NULL                                     |
| parent_id   | UUID                    | NULL, FK → tasks(id) ON DELETE CASCADE   |
| assignee_id | UUID                    | NULL, FK → users(id) ON DELETE SET NULL  |
| creator_id  | UUID                    | NOT NULL, FK → users(id) ON DELETE CASCADE |
| created_at  | TIMESTAMP WITH TIME ZONE| NOT NULL, default NOW()                  |
| updated_at  | TIMESTAMP WITH TIME ZONE| NOT NULL, auto-updated                   |

### Indexes

- `idx_tasks_status` on tasks(status)
- `idx_tasks_assignee_id` on tasks(assignee_id)
- `idx_tasks_parent_id` on tasks(parent_id)
- `idx_tasks_due_date` on tasks(due_date)

### Constraints & Cascade Rules

| Trigger | Behavior |
|---------|----------|
| Delete parent task | Cascade-delete all subtasks |
| Delete assignee user | Set `assignee_id` to NULL on their tasks |
| Delete creator user | Cascade-delete all tasks they created |
| `parent_id` reference | Must reference an existing task |

### Nesting Constraint (enforced in application layer)

- A task with `parent_id = null` is a top-level task.
- A task with a `parent_id` is a subtask.
- **One-level nesting only**: subtasks cannot have their own subtasks.
- A task that already has subtasks cannot be made into a subtask.

---

## Context

- Tech stack: Next.js with PostgreSQL, Prisma ORM.
- Run `npx prisma generate` after schema changes to update the client.
- Run `npx prisma migrate dev` to create and apply migrations.
- Substring search on `title` will use `ILIKE` (no pg_trgm extension needed for PoC).

---

## Acceptance Criteria

- [ ] Prisma schema defines User and Task models with all columns
- [ ] Prisma schema defines TaskStatus enum with 4 values
- [ ] Foreign keys and cascade rules are correctly configured
- [ ] Indexes are defined on status, assignee_id, parent_id, due_date
- [ ] `npx prisma migrate dev` runs on a fresh PostgreSQL database without errors
- [ ] `npx prisma migrate reset` cleanly resets the database
