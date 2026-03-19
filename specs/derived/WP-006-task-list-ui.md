# WP-006: Task List UI

> **Assigned to**: implementer
> **Priority**: 5 (depends on WP-003, WP-005)

---

## Description

Build the main task list page with search and filtering controls. This is the primary view users interact with after logging in.

---

## Requirements

### Task List Page — /tasks

**Layout:**
- Header with app name and logout button
- Search bar at the top
- Filter controls (can be a filter bar or sidebar)
- Task list below filters
- "New Task" button linking to /tasks/new

**Task list items:**
Each task row displays:
- Title (links to /tasks/:id)
- Status badge (color-coded: TODO=gray, IN_PROGRESS=blue, IN_REVIEW=yellow, DONE=green)
- Assignee name (or "Unassigned")
- Due date (or empty)
- Overdue indicator: if due_date < today AND status ≠ DONE, show the due date in red or with a warning icon
- If a task has subtasks, show a count (e.g., "3 subtasks")

**Search:**
- Text input that filters tasks by title (substring, case-insensitive)
- Calls GET /api/tasks?search=...
- Debounce input (300ms recommended)

**Filters:**
- Status: dropdown or button group to select one status (or "All")
- Assignee: dropdown with user list from GET /api/users (or "All" / "Assigned to me")
- Due date: dropdown with options: All, Overdue, Due today, Due this week, No due date
- Filters update the task list immediately via API query parameters
- Multiple active filters combine with AND logic

**Default view:**
- Show only top-level tasks (parent_id = null) by default
- Subtasks are visible on the task detail page

**Empty state:**
- When no tasks match: show "No tasks found" message

---

## Context

- Tech stack: Next.js, Shadcn UI, Tailwind CSS.
- Use Shadcn UI components: Table or Card for task items, Select for dropdowns, Input for search, Badge for status.
- Data comes from GET /api/tasks with query parameters.
- User list for assignee filter comes from GET /api/users.

---

## Acceptance Criteria

- [ ] /tasks displays a list of top-level tasks
- [ ] Each task shows title, status badge, assignee, due date, and subtask count
- [ ] Overdue tasks are visually indicated (red text or warning icon)
- [ ] Search input filters tasks by title with debounce
- [ ] Status filter works (All, TODO, IN_PROGRESS, IN_REVIEW, DONE)
- [ ] Assignee filter works (All, Assigned to me, specific user)
- [ ] Due date filter works (All, Overdue, Due today, Due this week, No due date)
- [ ] Multiple filters combine correctly
- [ ] Empty state message shown when no tasks match
- [ ] "New Task" button navigates to /tasks/new
- [ ] Logout button ends session and redirects to /login
