# Core Specification: Team Task Management App

> **Version**: 1.1
> **Status**: Final
> **Purpose**: PoC to validate the Orka multi-agent delivery pipeline

---

## 1. Overview

A web-based team task management application where users can create, assign, and track tasks through a defined workflow. Tasks support hierarchical grouping (parent/child), due dates, and status progression. Multiple users collaborate within the same workspace.

---

## 2. Tech Stack

| Layer          | Technology                              |
|----------------|------------------------------------------|
| Frontend       | Next.js (App Router) + Shadcn UI + Tailwind CSS |
| Backend        | Next.js API routes                       |
| Database       | PostgreSQL + Prisma ORM                  |
| Authentication | NextAuth.js v5 (Credentials provider)   |

---

## 3. Data Model

### 3.1 User

| Field        | Type      | Constraints              |
|--------------|-----------|--------------------------|
| id           | UUID      | Primary key              |
| email        | string    | Unique, required         |
| name         | string    | Required                 |
| password     | string    | Required (bcrypt hash)   |
| created_at   | timestamp | Auto-generated           |
| updated_at   | timestamp | Auto-generated           |

**Notes:**
- No avatar_url — UI displays initials only.
- Passwords are never returned in API responses.

### 3.2 Task

| Field        | Type      | Constraints              |
|--------------|-----------|--------------------------|
| id           | UUID      | Primary key              |
| title        | string    | Required, max 255 chars  |
| description  | text      | Optional                 |
| status       | enum      | Required, see §4         |
| due_date     | date      | Optional                 |
| parent_id    | UUID      | Optional, FK → Task.id   |
| assignee_id  | UUID      | Optional, FK → User.id   |
| creator_id   | UUID      | Required, FK → User.id   |
| created_at   | timestamp | Auto-generated           |
| updated_at   | timestamp | Auto-generated           |

**Hierarchy rules:**
- A task with `parent_id = null` is a top-level task.
- A task with a `parent_id` is a subtask of that parent.
- Nesting is limited to **one level** (subtasks cannot have their own subtasks).
- A task that has subtasks cannot be made into a subtask.
- Deleting a parent task deletes all its subtasks (cascade).

**Cascade rules:**
- Delete parent task → cascade-delete subtasks
- Delete assignee user → set assignee_id to NULL
- Delete creator user → cascade-delete their tasks

---

## 4. Status Workflow

Four statuses, freely interchangeable:

| Status      | Description                              |
|-------------|------------------------------------------|
| TODO        | Newly created, not yet started           |
| IN_PROGRESS | Actively being worked on                 |
| IN_REVIEW   | Work complete, awaiting review           |
| DONE        | Accepted and closed                      |

**Rules:**
- REQ-WF-01: Default status on creation is `TODO`.
- REQ-WF-02: Status can be changed freely in any direction (no forced linear progression).
- REQ-WF-03: When a parent task moves to `DONE`, all its subtasks that are not already `DONE` must also be moved to `DONE`.
- REQ-WF-04: Moving a parent from `DONE` to another status does NOT affect subtask statuses (forward cascade only).

---

## 5. Functional Requirements

### 5.1 Authentication

- REQ-AUTH-01: Users can register and log in via NextAuth.js Credentials provider.
- REQ-AUTH-02: All task operations require authentication.
- REQ-AUTH-03: Users can only see tasks within their workspace (all authenticated users share one workspace in this PoC).

### 5.2 Task CRUD

- REQ-TASK-01: Authenticated users can create a task with title, optional description, optional due date, and optional assignee.
- REQ-TASK-02: Authenticated users can view a list of all tasks with subtask counts and assignee info.
- REQ-TASK-03: Authenticated users can view a single task with its subtasks, assignee, and creator.
- REQ-TASK-04: Authenticated users can update a task's title, description, status, due date, and assignee.
- REQ-TASK-05: Authenticated users can delete a task. Deleting a parent cascades to subtasks.

### 5.3 Assignment

- REQ-ASSIGN-01: A task can be assigned to any registered user (including self).
- REQ-ASSIGN-02: A task can be unassigned (assignee set to null).
- REQ-ASSIGN-03: Users can filter tasks assigned to themselves.

### 5.4 Hierarchical Grouping

- REQ-HIER-01: A task can be created as a subtask of an existing task by setting `parent_id`.
- REQ-HIER-02: Subtasks are displayed under their parent task.
- REQ-HIER-03: Nesting depth is limited to one level.
- REQ-HIER-04: Circular references are prevented.
- REQ-HIER-05: A task with subtasks cannot become a subtask itself.

### 5.5 Due Dates

- REQ-DUE-01: Tasks can have an optional due date. Past dates are allowed on creation.
- REQ-DUE-02: Overdue tasks (due date in the past, status not `DONE`) are visually indicated in the task list.

### 5.6 Search & Filtering

- REQ-SEARCH-01: Users can search tasks by title (ILIKE substring match, case-insensitive).
- REQ-FILTER-01: Users can filter tasks by status.
- REQ-FILTER-02: Users can filter tasks by assignee.
- REQ-FILTER-03: Users can filter tasks by due date (overdue, due today, due this week, no due date).
- REQ-FILTER-04: Filters can be combined (AND logic).

### 5.7 Validation & Error Handling

- REQ-ERR-01: All API validation errors use per-field format: `{ "errors": { "field": "message" } }`.
- REQ-ERR-02: Auth errors use: `{ "errors": { "auth": "Not authenticated" } }`.
- REQ-ERR-03: Input strings (title, name, email) are trimmed. Whitespace-only values are rejected.

---

## 6. API Endpoints

| Method | Path                    | Description                    |
|--------|-------------------------|--------------------------------|
| POST   | /api/auth/register      | Register a new user (custom)   |
| *      | /api/auth/*             | NextAuth.js routes (login, logout, session) |
| GET    | /api/tasks              | List tasks (with filters)      |
| POST   | /api/tasks              | Create a task                  |
| GET    | /api/tasks/:id          | Get task detail + subtasks     |
| PATCH  | /api/tasks/:id          | Update a task                  |
| DELETE | /api/tasks/:id          | Delete a task                  |
| GET    | /api/users              | List users (for assignee picker) |

**Query parameters for GET /api/tasks:**
- `search` — title ILIKE substring search
- `status` — filter by status enum
- `assignee_id` — filter by assignee
- `due` — overdue | today | this_week | none
- `parent_id` — filter subtasks of a parent (null for top-level only)

**Response enrichment for GET /api/tasks:**
- Each task includes `subtask_count` (integer) and `assignee` object (or null)

---

## 7. UI Pages

| Page             | Route            | Description                          |
|------------------|------------------|--------------------------------------|
| Login            | /login           | Login form (NextAuth)                |
| Register         | /register        | Registration form (custom)           |
| Task List        | /tasks           | Main view: task list with filters    |
| Task Detail      | /tasks/:id       | Single task view with subtask list + inline status change |
| Create Task      | /tasks/new       | Task creation form                   |
| Edit Task        | /tasks/:id/edit  | Task editing form                    |

**UI conventions:**
- Avatars are initials-only (no images).
- Per-field API errors are mapped to form fields.
- Timestamps displayed as relative time.

---

## 8. Out of Scope

- Drag-and-drop Kanban board
- Copyable/shareable task URLs
- Real-time collaboration (WebSocket)
- Email notifications
- File attachments
- Comments or activity history
- Multiple workspaces or teams
- Role-based permissions (admin vs member)
- Avatar upload/Gravatar

---

## 9. Acceptance Criteria Summary

| ID           | Criterion                                                        |
|--------------|------------------------------------------------------------------|
| AC-01        | User can register, log in, and log out                           |
| AC-02        | User can create a task with title                                |
| AC-03        | User can view all tasks in a list with subtask counts            |
| AC-04        | User can view a single task and its subtasks                     |
| AC-05        | User can update task title, description, status, due date, assignee |
| AC-06        | User can delete a task; subtasks are cascade-deleted             |
| AC-07        | User can assign/unassign a task to any user                      |
| AC-08        | User can create a subtask under a parent task                    |
| AC-09        | Subtask nesting is enforced to one level                         |
| AC-10        | Marking a parent as DONE marks all non-DONE subtasks as DONE     |
| AC-11        | Moving a parent from DONE does NOT cascade to subtasks           |
| AC-12        | User can search tasks by title                                   |
| AC-13        | User can filter tasks by status, assignee, and due date          |
| AC-14        | Overdue tasks are visually indicated                             |
| AC-15        | All task operations require authentication                       |
| AC-16        | All API errors use per-field format                              |
| AC-17        | Status can be changed freely in any direction                    |
