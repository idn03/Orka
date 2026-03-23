# WP-006: Edit Task UI

> **Assigned to**: implementer
> **Priority**: 6 (depends on WP-002, WP-004)

---

## Description

Build the task edit page at `/tasks/:id/edit` with pre-filled form and validation.

---

## Requirements

### Route: /tasks/:id/edit

**Form Fields:**
- Title (text input, required)
- Description (textarea, optional)
- Due date (date input, optional)
- Assignee (dropdown with autocomplete, optional)
- Status (dropdown: To Do, In Progress, In Review, Done)

**Behavior:**
- Pre-fill all fields with current task data from store
- Submit calls store.updateTask() with changed fields only
- On success: redirect to /tasks/:id
- On validation error: display inline error messages per-field

**Status Change:**
- When changing status to DONE and task has subtasks:
  - Show warning note: "This will also mark all subtasks as Done"
- Status can be changed freely to any status

**Cancel Button:**
- Navigate back to /tasks/:id without saving

---

## Context

- Tech stack: Next.js (App Router), Shadcn UI, Tailwind CSS
- Data from store: getTask(id), updateTask(), getSubtasks(), getAllAssignees()
- Use Shadcn UI: Input, Textarea, Select, Button, Label

---

## Acceptance Criteria

- [ ] /tasks/:id/edit pre-fills form with current task data
- [ ] Status dropdown shows all 4 options
- [ ] Status can be changed to any status
- [ ] Changing status to DONE on parent shows subtask cascade warning
- [ ] Submit calls updateTask with changed fields only
- [ ] Validation errors display inline per-field
- [ ] Cancel button returns to detail page without saving
