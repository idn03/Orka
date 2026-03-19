# WP-007: Task Detail, Create & Edit UI

> **Assigned to**: implementer
> **Priority**: 5 (depends on WP-003, WP-004, WP-005)

---

## Description

Build the task detail view, create form, and edit form pages.

---

## Requirements

### Task Detail Page — /tasks/:id

**Layout:**
- Back link to /tasks (or to parent task if viewing a subtask)
- Task title (large heading)
- Status badge (color-coded, same as list view)
- Description (rendered as plain text, preserving line breaks)
- Due date (with overdue indicator if due_date < today AND status ≠ DONE)
- Assignee: initials avatar + name (or "Unassigned")
- Creator: name
- Created/updated timestamps (formatted as relative time, e.g., "3 hours ago")
- Edit button (links to /tasks/:id/edit)
- Delete button (with confirmation dialog)
- Inline status change: dropdown or button group to change status directly from the detail page (calls PATCH /api/tasks/:id)

**Subtasks section (only for top-level tasks):**
- Section header: "Subtasks" with count
- List subtasks below the main task details
- Each subtask row: title (links to /tasks/:subtask_id), status badge, assignee (initials + name), due date
- "Add Subtask" button that navigates to /tasks/new?parent_id=:id
- If no subtasks: "No subtasks"

**Parent info (only for subtasks):**
- Show "Subtask of: [Parent Title]" with a link to /tasks/:parent_id

**Delete behavior:**
- Show a confirmation dialog: "Delete this task? This will also delete all subtasks."
- On confirm: call DELETE /api/tasks/:id, then redirect to /tasks
- For subtasks (no children): "Delete this subtask?"
- On confirm: redirect to /tasks/:parent_id (back to parent)

### Create Task Page — /tasks/new

**Form fields:**
- Title (text input, required)
- Description (textarea, optional)
- Due date (date picker, optional)
- Assignee (dropdown from GET /api/users, optional — includes "Unassigned" option)
- Parent task (hidden, pre-filled from ?parent_id query param if present)

**Behavior:**
- Submit calls POST /api/tasks
- On success: redirect to /tasks/:new_id
- On validation error: map API per-field errors to form fields (same pattern as register form in WP-005)
- If creating a subtask (parent_id present):
  - Fetch parent task title via GET /api/tasks/:parent_id
  - Show a note: "Creating subtask of: [Parent Title]"
  - If parent is not found, show error and disable form

**Client-side validation:**
- Title: required, non-empty
- Due date: valid date if provided

### Edit Task Page — /tasks/:id/edit

**Form fields:**
Same as create, plus:
- Status (dropdown: To Do, In Progress, In Review, Done)

**Behavior:**
- Pre-fill all fields with current task data from GET /api/tasks/:id
- Submit calls PATCH /api/tasks/:id with only changed fields
- On success: redirect to /tasks/:id
- On validation error: map API per-field errors to form fields
- If changing status to DONE and task has subtasks:
  - Show a warning note: "This will also mark all subtasks as Done"
- Status can be changed freely in any direction (no restriction)

**Cancel button:**
- Navigates back to /tasks/:id without saving

---

## Context

- Tech stack: Next.js (App Router), Shadcn UI, Tailwind CSS.
- Use Shadcn UI components: Card, Input, Textarea, Select, Button, AlertDialog (for delete confirmation), Popover + Calendar for due date picker.
- Task data from GET /api/tasks/:id (includes subtasks array, assignee, and creator objects).
- User list from GET /api/users for assignee dropdown.
- Per-field error format: `{ "errors": { "title": "...", "parent_id": "..." } }`.
- Avatars use initials only (no image).

---

## Acceptance Criteria

- [ ] /tasks/:id displays full task details with assignee/creator as initials + name
- [ ] /tasks/:id shows inline status change control (dropdown or buttons)
- [ ] Status can be changed directly from detail page to any status
- [ ] Subtask list displayed with links and status badges
- [ ] "Add Subtask" button navigates to /tasks/new?parent_id=:id
- [ ] Subtask view shows "Subtask of: [Parent Title]" with link
- [ ] Delete button shows confirmation dialog and calls DELETE API
- [ ] After deleting a subtask, redirect to parent task
- [ ] /tasks/new renders a create form and submits to POST /api/tasks
- [ ] /tasks/new?parent_id=:id shows parent title and pre-fills parent_id
- [ ] /tasks/:id/edit pre-fills form with current task data
- [ ] /tasks/:id/edit submits only changed fields to PATCH /api/tasks/:id
- [ ] Status change to DONE shows warning about subtask cascade
- [ ] Validation errors display inline per-field on both create and edit forms
- [ ] Cancel button returns to task detail without saving
- [ ] Timestamps shown as relative time
