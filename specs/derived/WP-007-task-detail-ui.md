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
- Back link to /tasks
- Task title (large heading)
- Status badge
- Description (rendered as text)
- Due date (with overdue indicator if applicable)
- Assignee name
- Creator name
- Created/updated timestamps
- Edit button (links to /tasks/:id/edit)
- Delete button (with confirmation dialog)

**Subtasks section:**
- List subtasks below the main task details
- Each subtask row: title, status badge, assignee, due date
- Subtask titles link to /tasks/:subtask_id
- "Add Subtask" button that navigates to /tasks/new?parent_id=:id

**Delete behavior:**
- Show a confirmation dialog: "Delete this task? This will also delete all subtasks."
- On confirm: call DELETE /api/tasks/:id, then redirect to /tasks
- For subtasks: "Delete this subtask?" (no cascade mention)

### Create Task Page — /tasks/new

**Form fields:**
- Title (text input, required)
- Description (textarea, optional)
- Due date (date picker, optional)
- Assignee (dropdown from GET /api/users, optional)
- Parent task (hidden, pre-filled from ?parent_id query param if present)

**Behavior:**
- Submit calls POST /api/tasks
- On success: redirect to /tasks/:new_id
- On validation error: display inline errors
- If creating a subtask (parent_id present), show a note: "Creating subtask of: [Parent Title]"

### Edit Task Page — /tasks/:id/edit

**Form fields:**
Same as create, plus:
- Status (dropdown: TODO, IN_PROGRESS, IN_REVIEW, DONE)

**Behavior:**
- Pre-fill all fields with current task data from GET /api/tasks/:id
- Submit calls PATCH /api/tasks/:id with only changed fields
- On success: redirect to /tasks/:id
- If changing status to DONE and task has subtasks, show a note: "This will also mark all subtasks as Done"

---

## Context

- Tech stack: Next.js, Shadcn UI, Tailwind CSS.
- Use Shadcn UI components: Card, Input, Textarea, Select, Button, Dialog (for delete confirmation), Calendar/DatePicker for due dates.
- Task data from GET /api/tasks/:id (includes subtasks array).
- User list from GET /api/users for assignee dropdown.

---

## Acceptance Criteria

- [ ] /tasks/:id displays full task details including subtask list
- [ ] Subtask titles link to their detail pages
- [ ] "Add Subtask" button navigates to /tasks/new?parent_id=:id
- [ ] Delete button shows confirmation dialog and calls DELETE API
- [ ] /tasks/new renders a create form and submits to POST /api/tasks
- [ ] /tasks/new?parent_id=:id pre-fills parent and shows parent title
- [ ] /tasks/:id/edit pre-fills form with current task data
- [ ] /tasks/:id/edit submits changed fields to PATCH /api/tasks/:id
- [ ] Status change to DONE shows warning about subtask cascade
- [ ] Validation errors display inline on both create and edit forms
