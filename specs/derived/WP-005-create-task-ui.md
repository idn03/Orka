# WP-005: Create Task UI

> **Assigned to**: implementer
> **Priority**: 5 (depends on WP-002)

---

## Description

Build the task creation page at `/tasks/new` with form validation and subtask creation support.

---

## Requirements

### Route: /tasks/new

**Form Fields:**
- Title (text input, required)
- Description (textarea, optional)
- Due date (date input, optional)
- Assignee (dropdown with autocomplete, optional — includes "Unassigned")
- Parent task (pre-filled from ?parentId query param if present)

**Behavior:**
- Submit calls store.createTask()
- On success: redirect to /tasks/:newId
- On validation error: display inline error messages per-field

**Creating Subtask:**
- If ?parentId query param present:
  - Fetch parent task to display title
  - Show note: "Creating subtask of: [Parent Title]"
  - Pre-fill parentId in submission

**Client-Side Validation:**
- Title: required, non-empty after trim, max 255 chars
- Due date: valid date string (YYYY-MM-DD) if provided
- Display errors inline below each field

**Cancel Button:**
- If creating subtask (parentId present): navigate to /tasks/:parentId
- If creating top-level task: navigate to /tasks

---

## Context

- Tech stack: Next.js (App Router), Shadcn UI, Tailwind CSS
- Data operations via store functions: createTask(), getTask(id), getAllAssignees()
- Assignee dropdown populates from getAllAssignees() with "Unassigned" option
- Use Shadcn UI: Input, Textarea, Select, Button, Label

---

## Acceptance Criteria

- [x] /tasks/new renders create form with all fields
- [x] Title field is required with validation
- [x] Whitespace-only title rejected
- [x] Title > 255 chars rejected
- [x] Validation errors display inline per-field
- [x] Submit creates task and redirects to detail page
- [x] ?parentId pre-fills parentId and shows parent title
- [x] Assignee dropdown shows all existing assignees + "Unassigned"
- [x] Cancel button navigates back appropriately
