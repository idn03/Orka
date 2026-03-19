# WP-001: Database Schema & Migrations

> **Assigned to**: implementer
> **Priority**: 1 (foundational — all other work packages depend on this)

---

## Description

Set up the PostgreSQL database schema for the task management app. Create migration files that define all tables, enums, indexes, and constraints.

---

## Requirements

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
| password   | VARCHAR(255)            | NOT NULL (hashed)                |
| avatar_url | TEXT                    | NULL                             |
| created_at | TIMESTAMP WITH TIME ZONE| NOT NULL, default NOW()          |
| updated_at | TIMESTAMP WITH TIME ZONE| NOT NULL, default NOW()          |

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
| updated_at  | TIMESTAMP WITH TIME ZONE| NOT NULL, default NOW()                  |

### Indexes

- `idx_tasks_status` on tasks(status)
- `idx_tasks_assignee_id` on tasks(assignee_id)
- `idx_tasks_parent_id` on tasks(parent_id)
- `idx_tasks_due_date` on tasks(due_date)
- `idx_tasks_title_search` — GIN index on tasks(title) using pg_trgm for substring search (or a functional index for ILIKE queries)

### Constraints

- A task's `parent_id` must reference an existing task.
- Cascade delete: when a parent task is deleted, all subtasks are deleted.
- When an assignee user is deleted, tasks are unassigned (SET NULL).
- When a creator user is deleted, their tasks are deleted (CASCADE).

---

## Context

- Tech stack: Next.js with PostgreSQL.
- Use a migration tool compatible with Next.js (e.g., Prisma, Drizzle ORM, or raw SQL migrations).
- The `password` column stores bcrypt-hashed passwords, never plaintext.
- The `pg_trgm` extension may be needed for substring search indexes.

---

## Acceptance Criteria

- [ ] Migration creates `task_status` enum with 4 values
- [ ] Migration creates `users` table with all columns and constraints
- [ ] Migration creates `tasks` table with all columns, foreign keys, and cascade rules
- [ ] All indexes are created
- [ ] Migration can run on a fresh PostgreSQL database without errors
- [ ] Migration can be rolled back cleanly
