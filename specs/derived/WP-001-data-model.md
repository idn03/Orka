# WP-001: Data Model & TypeScript Types

> **Assigned to**: implementer
> **Priority**: 1 (foundational — all other work packages depend on this)

---

## Description

Define the TypeScript types and interfaces for the task management app. No database or API — all data is stored in browser localStorage.

---

## Requirements

### TypeScript Types

```typescript
type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

interface Task {
  id: string;          // UUID (crypto.randomUUID)
  title: string;       // Required, max 255 chars
  description: string; // Optional
  status: TaskStatus;  // Required, default 'TODO'
  dueDate: string | null;    // Optional (YYYY-MM-DD)
  parentId: string | null;   // Optional, references Task.id
  assignee: string | null;   // Optional (free-text name)
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
}
```

### Hierarchy Rules

- A task with `parentId = null` is a top-level task
- A task with a `parentId` is a subtask of that parent
- Nesting is limited to **one level** (subtasks cannot have their own subtasks)
- A task that has subtasks cannot be made into a subtask

### Storage Key

- All tasks stored as JSON array in localStorage under key `"orka-tasks"`

### Seed Data

On first visit (empty storage), load seed data to demonstrate the app.

---

## Context

- Tech stack: Next.js (App Router), TypeScript
- UUIDs generated via `crypto.randomUUID()`
- Dates stored as ISO 8601 strings

---

## Acceptance Criteria

- [ ] Task interface defined with all fields
- [ ] TaskStatus type defined with 4 enum values
- [ ] TypeScript types match core.md data model exactly
- [ ] Hierarchy rules are documented in code comments
