# Core Specification: Team Task Management App

> **Version**: 1.0
> **Status**: Final
> **Purpose**: PoC to validate the Orka multi-agent delivery pipeline

---

## 1. Overview

A web-based team task management application where users can create, assign, and track tasks through a defined workflow. Tasks support hierarchical grouping (parent/child), due dates, and status progression. Multiple users collaborate within the same workspace.

---

## 2. Tech Stack

| Layer          | Technology                  |
|----------------|-----------------------------|
| Frontend       | Next.js + Shadcn UI + Tailwind CSS |
| Backend        | Next.js API routes (or Server Actions) |
| Database       | PostgreSQL                  |
| Authentication | Multi-user (method open to implementer — e.g., NextAuth.js, email/password, OAuth) |

---

## 3. Data Model

### 3.1 User

| Field        | Type      | Constraints              |
|--------------|-----------|--------------------------|
| id           | UUID      | Primary key              |
| email        | string    | Unique, required         |
| name         | string    | Required                 |
| avatar_url   | string    | Optional                 |
| created_at   | timestamp | Auto-generated           |
| updated_at   | timestamp | Auto-generated           |

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
- Deleting a parent task deletes all its subtasks (cascade).

---

## 4. Status Workflow

Tasks progress through these statuses in order:

```
To Do → In Progress → In Review → Done
```

| Status      | Description                              |
|-------------|------------------------------------------|
| TODO        | Newly created, not yet started           |
| IN_PROGRESS | Actively being worked on                 |
| IN_REVIEW   | Work complete, awaiting review           |
| DONE        | Accepted and closed                      |

**Rules:**
- REQ-WF-01: Default status on creation is `TODO`.
- REQ-WF-02: Status can be moved forward or backward freely (no forced linear progression).
- REQ-WF-03: When a parent task moves to `DONE`, all its subtasks that are not already `DONE` must also be moved to `DONE`.

---

## 5. Functional Requirements

### 5.1 Authentication

- REQ-AUTH-01: Users can register and log in.
- REQ-AUTH-02: All task operations require authentication.
- REQ-AUTH-03: Users can only see tasks within their workspace (all authenticated users share one workspace in this PoC).

### 5.2 Task CRUD

- REQ-TASK-01: Authenticated users can create a task with title, optional description, optional due date, and optional assignee.
- REQ-TASK-02: Authenticated users can view a list of all tasks.
- REQ-TASK-03: Authenticated users can view a single task and its subtasks.
- REQ-TASK-04: Authenticated users can update a task's title, description, status, due date, and assignee.
- REQ-TASK-05: Authenticated users can delete a task. Deleting a parent cascades to subtasks.

### 5.3 Assignment

- REQ-ASSIGN-01: A task can be assigned to any registered user.
- REQ-ASSIGN-02: A task can be unassigned (assignee set to null).
- REQ-ASSIGN-03: Users can filter tasks assigned to themselves.

### 5.4 Hierarchical Grouping

- REQ-HIER-01: A task can be created as a subtask of an existing task by setting `parent_id`.
- REQ-HIER-02: Subtasks are displayed under their parent task.
- REQ-HIER-03: Nesting depth is limited to one level.
- REQ-HIER-04: A subtask cannot be moved to become a top-level task's parent (no circular references).

### 5.5 Due Dates

- REQ-DUE-01: Tasks can have an optional due date.
- REQ-DUE-02: Overdue tasks (due date in the past, status not `DONE`) are visually indicated in the task list.

### 5.6 Search & Filtering

- REQ-SEARCH-01: Users can search tasks by title (substring match, case-insensitive).
- REQ-FILTER-01: Users can filter tasks by status.
- REQ-FILTER-02: Users can filter tasks by assignee.
- REQ-FILTER-03: Users can filter tasks by due date (overdue, due today, due this week, no due date).
- REQ-FILTER-04: Filters can be combined (AND logic).

---

## 6. API Endpoints

| Method | Path                    | Description                |
|--------|-------------------------|----------------------------|
| POST   | /api/auth/register      | Register a new user        |
| POST   | /api/auth/login         | Log in                     |
| POST   | /api/auth/logout        | Log out                    |
| GET    | /api/tasks              | List tasks (with filters)  |
| POST   | /api/tasks              | Create a task              |
| GET    | /api/tasks/:id          | Get task detail + subtasks |
| PATCH  | /api/tasks/:id          | Update a task              |
| DELETE | /api/tasks/:id          | Delete a task              |
| GET    | /api/users              | List users (for assignee picker) |

**Query parameters for GET /api/tasks:**
- `search` — title substring search
- `status` — filter by status enum
- `assignee_id` — filter by assignee
- `due` — overdue | today | this_week | none
- `parent_id` — filter subtasks of a parent (null for top-level only)

---

## 7. UI Pages

| Page             | Route            | Description                          |
|------------------|------------------|--------------------------------------|
| Login            | /login           | Login form                           |
| Register         | /register        | Registration form                    |
| Task List        | /tasks           | Main view: task list with filters    |
| Task Detail      | /tasks/:id       | Single task view with subtask list   |
| Create Task      | /tasks/new       | Task creation form                   |
| Edit Task        | /tasks/:id/edit  | Task editing form                    |

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

---

## 9. Acceptance Criteria Summary

| ID           | Criterion                                                        |
|--------------|------------------------------------------------------------------|
| AC-01        | User can register, log in, and log out                           |
| AC-02        | User can create a task with title                                |
| AC-03        | User can view all tasks in a list                                |
| AC-04        | User can view a single task and its subtasks                     |
| AC-05        | User can update task title, description, status, due date, assignee |
| AC-06        | User can delete a task; subtasks are cascade-deleted             |
| AC-07        | User can assign/unassign a task to any user                      |
| AC-08        | User can create a subtask under a parent task                    |
| AC-09        | Subtask nesting is enforced to one level                         |
| AC-10        | Marking a parent as DONE marks all non-DONE subtasks as DONE     |
| AC-11        | User can search tasks by title                                   |
| AC-12        | User can filter tasks by status, assignee, and due date          |
| AC-13        | Overdue tasks are visually indicated                             |
| AC-14        | All task operations require authentication                       |
