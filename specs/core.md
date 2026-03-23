# Core Specification: Personal Task Management App

> **Version**: 2.0
> **Status**: Final
> **Purpose**: PoC to validate the Orka multi-agent delivery pipeline

---

## 1. Overview

A web-based personal task management application where a single user can create, organize, and track tasks through a defined workflow. Tasks support hierarchical grouping (parent/child), due dates, assignee labels, and status progression. All data is persisted in the browser via localStorage — no backend server or database is required.

---

## 2. Tech Stack

| Layer          | Technology                              |
|----------------|------------------------------------------|
| Frontend       | Next.js (App Router) + Shadcn UI + Tailwind CSS |
| Persistence    | Browser localStorage (JSON)              |

**Removed from v1.1:**
- ~~Backend API routes~~ — all logic runs client-side
- ~~PostgreSQL + Prisma ORM~~ — replaced by localStorage
- ~~NextAuth.js authentication~~ — no auth required (single-user personal app)

---

## 3. Data Model

### 3.1 Task

| Field        | Type      | Constraints              |
|--------------|-----------|--------------------------|
| id           | UUID      | Primary key (crypto.randomUUID) |
| title        | string    | Required, max 255 chars  |
| description  | string    | Optional                 |
| status       | enum      | Required, see §4         |
| dueDate      | string    | Optional (YYYY-MM-DD)    |
| parentId     | string    | Optional, references another Task.id |
| assignee     | string    | Optional (free-text name, e.g. "Alice") |
| createdAt    | string    | Auto-generated (ISO 8601) |
| updatedAt    | string    | Auto-generated (ISO 8601) |

**Hierarchy rules:**
- A task with `parentId = null` is a top-level task.
- A task with a `parentId` is a subtask of that parent.
- Nesting is limited to **one level** (subtasks cannot have their own subtasks).
- A task that has subtasks cannot be made into a subtask.
- Deleting a parent task deletes all its subtasks (cascade).

**Storage:**
- All tasks are stored as a flat JSON array in localStorage under the key `"orka-tasks"`.
- Subtask relationships are expressed via `parentId` references.
- On first visit (empty storage), seed data is loaded to demonstrate the app.

**Removed from v1.1:**
- ~~User model~~ — no authentication, no user accounts
- ~~assignee_id / creator_id (FK → User)~~ — assignee is now a free-text string
- ~~Cascade rules for user deletion~~ — no users

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

### 5.1 Task CRUD

- REQ-TASK-01: User can create a task with title, optional description, optional due date, and optional assignee name.
- REQ-TASK-02: User can view a list of all tasks with subtask counts and assignee info.
- REQ-TASK-03: User can view a single task with its subtasks and assignee.
- REQ-TASK-04: User can update a task's title, description, status, due date, and assignee.
- REQ-TASK-05: User can delete a task. Deleting a parent cascades to subtasks.

### 5.2 Assignment

- REQ-ASSIGN-01: A task can be assigned to anyone by typing a name (free-text input).
- REQ-ASSIGN-02: A task can be unassigned (assignee set to null/empty).
- REQ-ASSIGN-03: The assignee dropdown suggests names already used in existing tasks (autocomplete from existing assignees).

### 5.3 Hierarchical Grouping

- REQ-HIER-01: A task can be created as a subtask of an existing task by setting `parentId`.
- REQ-HIER-02: Subtasks are displayed under their parent task.
- REQ-HIER-03: Nesting depth is limited to one level.
- REQ-HIER-04: Circular references are prevented.
- REQ-HIER-05: A task with subtasks cannot become a subtask itself.

### 5.4 Due Dates

- REQ-DUE-01: Tasks can have an optional due date. Past dates are allowed on creation.
- REQ-DUE-02: Overdue tasks (due date in the past, status not `DONE`) are visually indicated in the task list.

### 5.5 Search & Filtering

- REQ-SEARCH-01: User can search tasks by title (substring match, case-insensitive).
- REQ-FILTER-01: User can filter tasks by status.
- REQ-FILTER-02: User can filter tasks by assignee (dropdown of existing assignee names, plus "All").
- REQ-FILTER-03: User can filter tasks by due date (overdue, due today, due this week, no due date).
- REQ-FILTER-04: Filters can be combined (AND logic).

### 5.6 Validation & Error Handling

- REQ-ERR-01: Validation errors are displayed inline per-field on forms.
- REQ-ERR-02: Input strings (title) are trimmed. Whitespace-only values are rejected.

### 5.7 Persistence

- REQ-PERSIST-01: All task data is stored in browser localStorage.
- REQ-PERSIST-02: Data survives page refreshes and browser restarts.
- REQ-PERSIST-03: On first visit (no data in localStorage), seed data is loaded automatically.

**Removed from v1.1:**
- ~~REQ-AUTH-01 through REQ-AUTH-03~~ — no authentication
- ~~REQ-ERR-02 (auth error format)~~ — no auth errors
- ~~API error format requirement~~ — no API; validation is client-side

---

## 6. Client-Side Store

All data operations happen in a localStorage-backed store module. There are no API routes.

### Store Operations

| Operation      | Description                                      |
|----------------|--------------------------------------------------|
| getAllTasks()   | Return all tasks from localStorage               |
| getTask(id)    | Return a single task by ID                       |
| createTask()   | Add a new task with status=TODO, generated ID    |
| updateTask()   | Update provided fields, refresh updatedAt        |
| deleteTask()   | Delete task and cascade-delete subtasks           |
| queryTasks()   | Filter tasks by search, status, assignee, due, parentId |
| getSubtasks()  | Return subtasks for a given parentId             |

### Query Filters

- `search` — case-insensitive substring match on title
- `status` — exact match on status enum
- `assignee` — exact match on assignee name
- `due` — overdue | today | this_week | none
- `parentId` — filter subtasks of a parent; `null` for top-level only

**Removed from v1.1:**
- ~~API endpoints (GET/POST/PATCH/DELETE /api/tasks)~~ — replaced by store functions
- ~~GET /api/users~~ — no user model
- ~~POST /api/auth/register, NextAuth routes~~ — no auth

---

## 7. UI Pages

| Page             | Route            | Description                          |
|------------------|------------------|--------------------------------------|
| Task List        | /tasks           | Main view: task list with search and filters |
| Task Detail      | /tasks/:id       | Single task view with subtask list + inline status change |
| Create Task      | /tasks/new       | Task creation form                   |
| Edit Task        | /tasks/:id/edit  | Task editing form                    |

**Route `/` redirects to `/tasks`.**

**UI conventions:**
- All pages are client components (data comes from localStorage).
- Assignee displayed as name text (no avatars in v2.0).
- Per-field validation errors displayed inline on forms.
- Timestamps displayed as relative time.
- Loading state shown briefly on initial hydration (localStorage not available during SSR).

**Removed from v1.1:**
- ~~/login, /register pages~~ — no authentication
- ~~User avatars (initials)~~ — simplified; just display assignee name
- ~~Logout button, user info in header~~ — no auth

---

## 8. Out of Scope

- Server-side backend or API routes
- Database (PostgreSQL, SQLite, or any other)
- Authentication or user accounts
- Drag-and-drop Kanban board
- Real-time collaboration (WebSocket)
- Email notifications
- File attachments
- Comments or activity history
- Multiple workspaces or teams
- Role-based permissions
- Data export/import (potential future enhancement)

---

## 9. Acceptance Criteria Summary

| ID           | Criterion                                                        |
|--------------|------------------------------------------------------------------|
| AC-01        | User can create a task with title                                |
| AC-02        | User can view all tasks in a list with subtask counts            |
| AC-03        | User can view a single task and its subtasks                     |
| AC-04        | User can update task title, description, status, due date, assignee |
| AC-05        | User can delete a task; subtasks are cascade-deleted             |
| AC-06        | User can assign/unassign a task using free-text name             |
| AC-07        | User can create a subtask under a parent task                    |
| AC-08        | Subtask nesting is enforced to one level                         |
| AC-09        | Marking a parent as DONE marks all non-DONE subtasks as DONE     |
| AC-10        | Moving a parent from DONE does NOT cascade to subtasks           |
| AC-11        | User can search tasks by title                                   |
| AC-12        | User can filter tasks by status, assignee, and due date          |
| AC-13        | Overdue tasks are visually indicated                             |
| AC-14        | Status can be changed freely in any direction                    |
| AC-15        | Task data persists in localStorage across page refreshes         |
| AC-16        | Seed data loads on first visit                                   |
| AC-17        | Validation errors display inline per-field on forms              |
