# WP-006: Task List UI

> **Assigned to**: implementer
> **Priority**: 5 (depends on WP-003, WP-004, WP-005)

---

## Description

Build the main task list page with search and filtering controls. This is the primary view users interact with after logging in.

---

## Requirements

### Task List Page — /tasks

**Layout:**
- Header bar with:
  - App name "Orka Tasks" (left)
  - Current user name + initials avatar (right)
  - Logout button (right, uses NextAuth.js `signOut()`)
- Search bar below header
- Filter controls (filter bar)
- Task list below filters
- "New Task" button linking to /tasks/new

**Task list items:**
Each task row displays:
- Title (clickable, links to /tasks/:id)
- Status badge (color-coded: TODO=gray, IN_PROGRESS=blue, IN_REVIEW=yellow, DONE=green)
- Assignee name with initials avatar (or "Unassigned")
- Due date (or empty)
- Overdue indicator: if due_date < today AND status ≠ DONE, show the due date in red with a warning style
- Subtask count from API response `subtask_count` field (e.g., "3 subtasks")

**Search:**
- Text input that filters tasks by title (substring, case-insensitive)
- Calls GET /api/tasks?search=...
- Debounce input (300ms)
- Clear button to reset search

**Filters:**
- Status: dropdown or button group to select one status (or "All")
- Assignee: dropdown populated from GET /api/users
  - Options: "All", "Assigned to me", each user by name
  - "Assigned to me" uses the current session user's ID
- Due date: dropdown with options: All, Overdue, Due today, Due this week, No due date
- Filters update the task list immediately via API query parameters
- Multiple active filters combine with AND logic
- Active filters are visually indicated (e.g., different style on active filter)

**Default view:**
- Show only top-level tasks (parent_id=null) by default
- Subtasks are visible on the task detail page

**Empty states:**
- No tasks at all: "No tasks yet. Create your first task!"
- No tasks match filters: "No tasks match your filters."

**Loading state:**
- Show a loading indicator while fetching tasks

---

## Context

- Tech stack: Next.js (App Router), Shadcn UI, Tailwind CSS.
- Use Shadcn UI components: Table or Card for task items, Select for dropdowns, Input for search, Badge for status.
- Data comes from GET /api/tasks with query parameters (returns subtask_count and assignee object).
- User list for assignee filter comes from GET /api/users.
- Current user from NextAuth.js session.

---

## Acceptance Criteria

- [ ] /tasks displays a list of top-level tasks fetched from GET /api/tasks?parent_id=null
- [ ] Each task shows title, status badge, assignee (initials avatar + name), due date, and subtask count
- [ ] Overdue tasks are visually indicated (red text/icon)
- [ ] Search input filters tasks by title with 300ms debounce
- [ ] Search has a clear button
- [ ] Status filter works (All, TODO, IN_PROGRESS, IN_REVIEW, DONE)
- [ ] Assignee filter works (All, Assigned to me, specific user)
- [ ] Due date filter works (All, Overdue, Due today, Due this week, No due date)
- [ ] Multiple filters combine correctly (AND logic)
- [ ] Active filters are visually indicated
- [ ] Empty state messages shown appropriately
- [ ] Loading indicator shown during fetch
- [ ] "New Task" button navigates to /tasks/new
- [ ] Logout button calls NextAuth signOut and redirects to /login
- [ ] Header shows current user name with initials avatar
