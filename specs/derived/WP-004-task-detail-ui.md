# WP-004: Task Detail UI

> **Assigned to**: implementer
> **Priority**: 4 (depends on WP-002, WP-003)

---

## Description

Build the task detail page at `/tasks/:id` with full task info, subtask list, and inline status change.

---

## Requirements

### Route: /tasks/:id

**Layout:**
- Back link to /tasks (or to parent task if viewing a subtask)
- Task title (large heading)
- Status badge (color-coded, same as list view)
- Inline status change: dropdown to change status directly (calls store updateTask)
- Description (plain text with preserved line breaks)
- Due date (with overdue indicator if applicable)
- Assignee (or "Unassigned")
- Created/updated timestamps (formatted as relative time, e.g., "3 hours ago")
- Edit button (links to /tasks/:id/edit)
- Delete button (with confirmation dialog)

**Subtasks Section (top-level tasks only):**
- Section header: "Subtasks" with count
- List subtasks below main task details
- Each subtask row: title (links to /tasks/:subtask_id), status badge, assignee, due date
- "Add Subtask" button that navigates to /tasks/new?parentId=:id
- If no subtasks: "No subtasks"

**Parent Info (subtasks only):**
- Show "Subtask of: [Parent Title]" with link to /tasks/:parentId

**Delete Behavior:**
- Show confirmation dialog: "Delete this task? This will also delete all subtasks."
- On confirm: delete from store, redirect to /tasks
- For subtasks: "Delete this subtask?"
- On confirm: redirect to /tasks/:parentId

**Status Change:**
- Status can be changed to any of the 4 statuses freely
- When changing to DONE on parent with subtasks: warning "This will mark all subtasks as Done"
- Changing from DONE to another status does NOT affect subtasks

---

## Context

- Tech stack: Next.js (App Router), Shadcn UI, Tailwind CSS
- Data from store functions: getTask(id), getSubtasks(parentId)
- Use Shadcn UI: Card, Badge, Button, AlertDialog for confirmation

---

## Acceptance Criteria

- [x] /tasks/:id displays full task details
- [x] Inline status dropdown changes status immediately
- [x] Status can be changed to any status freely
- [x] DONE status on parent shows warning about subtask cascade
- [x] Subtask list displayed with links and status badges
- [x] "Add Subtask" button navigates to /tasks/new?parentId=:id
- [x] Subtask view shows "Subtask of: [Parent Title]" with link
- [x] Delete button shows confirmation dialog
- [x] After delete, redirect appropriately (to /tasks or parent)
- [x] Back link navigates to /tasks or parent task
- [x] Timestamps shown as relative time
- [x] Overdue indicator on due date
