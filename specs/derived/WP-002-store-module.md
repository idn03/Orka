# WP-002: Client-Side Store Module

> **Assigned to**: implementer
> **Priority**: 2 (depends on WP-001)

---

## Description

Implement a localStorage-backed store module that handles all task data operations. No API routes — all logic runs client-side.

---

## Requirements

### Storage Key

- localStorage key: `"orka-tasks"`

### Store Interface

```typescript
interface StoreOperations {
  getAllTasks(): Task[];
  getTask(id: string): Task | undefined;
  createTask(data: CreateTaskInput): Task;
  updateTask(id: string, data: Partial<UpdateTaskInput>): Task;
  deleteTask(id: string): void;
  queryTasks(filters: QueryFilters): Task[];
  getSubtasks(parentId: string): Task[];
  getAllAssignees(): string[];
}
```

### Store Operations

| Operation | Description |
|-----------|-------------|
| `getAllTasks()` | Return all tasks from localStorage |
| `getTask(id)` | Return a single task by ID |
| `createTask(data)` | Add new task with status=TODO, generated ID, timestamps |
| `updateTask(id, data)` | Update provided fields, refresh updatedAt |
| `deleteTask(id)` | Delete task and cascade-delete subtasks |
| `queryTasks(filters)` | Filter tasks by search, status, assignee, due, parentId |
| `getSubtasks(parentId)` | Return subtasks for a given parentId |
| `getAllAssignees()` | Return unique assignee names (for autocomplete) |

### Query Filters

```typescript
interface QueryFilters {
  search?: string;       // Case-insensitive substring match on title
  status?: TaskStatus;  // Exact match on status
  assignee?: string;    // Exact match on assignee name
  due?: 'overdue' | 'today' | 'this_week' | 'none';
  parentId?: string | null;  // Filter by parent; null = top-level only
}
```

### Due Date Filter Logic

- `overdue`: dueDate < today AND status ≠ DONE
- `today`: dueDate = today
- `this_week`: dueDate between today and end of current week (Sunday)
- `none`: dueDate is null

### Status Cascade Logic

- When updating a task's status to `DONE`, all subtasks with status ≠ DONE must also be set to `DONE`
- Moving from `DONE` to another status does NOT affect subtask statuses (forward cascade only)

### Validation Rules

- Title: required, trimmed, max 255 chars, whitespace-only rejected
- parentId: must reference existing task, cannot be subtask (one-level nesting)
- A task with subtasks cannot be made into a subtask

### Seed Data

On first visit (empty storage), load seed data:
- 2-3 top-level tasks with different statuses
- At least one task with subtasks
- Mix of assigned and unassigned tasks
- Some with due dates (including overdue)

---

## Context

- Tech stack: Next.js (App Router), TypeScript
- Store module lives in `src/lib/store.ts` or similar
- Components import store functions directly (no API layer)
- SSR consideration: localStorage not available during SSR — handle gracefully

---

## Acceptance Criteria

- [x] Store module exports all 8 operations
- [x] getAllTasks returns all tasks from localStorage
- [x] createTask generates UUID, sets status=TODO, sets timestamps
- [x] updateTask updates only provided fields and refreshes updatedAt
- [x] deleteTask cascades to subtasks
- [x] queryTasks supports search (case-insensitive substring), status, assignee, due, parentId
- [x] queryTasks due filter works for overdue, today, this_week, none
- [x] Multiple filters combine with AND logic
- [x] Status cascade to DONE updates subtasks; reverse does not
- [x] Title validation rejects empty, whitespace-only, >255 chars
- [x] parentId validation prevents nesting subtasks under subtasks
- [x] parentId validation prevents making parent-with-children into subtask
- [x] Seed data loads on first visit (empty localStorage)
- [x] getAllAssignees returns unique names for autocomplete
