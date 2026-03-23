# WP-003: Task List UI

> **Assigned to**: implementer
> **Priority**: 3 (depends on WP-002)

---

## Description

Build the main task list page at `/tasks` with search and filtering controls. Primary view after app load.

---

## Requirements

### Route: /tasks

**Layout:**
- Header with app name "Orka Tasks" (left)
- "New Task" button linking to /tasks/new (right)
- Search bar below header
- Filter controls (filter bar)
- Task list below filters

**Task List Items:**
Each task row displays:
- Title (clickable, links to /tasks/:id)
- Status badge (color-coded: TODO=gray, IN_PROGRESS=blue, IN_REVIEW=yellow, DONE=green)
- Assignee name (or "Unassigned")
- Due date (or empty)
- Overdue indicator: if dueDate < today AND status ≠ DONE, show due date in red
- Subtask count (e.g., "3 subtasks") for parent tasks

**Default View:**
- Show only top-level tasks (parentId=null)
- Subtasks visible on task detail page

**Search:**
- Text input filters tasks by title (substring, case-insensitive)
- Debounce input (300ms)
- Clear button to reset search

**Filters:**
- Status: dropdown (All, TODO, IN_PROGRESS, IN_REVIEW, DONE)
- Assignee: dropdown (All, plus each unique assignee name from tasks)
- Due date: dropdown (All, Overdue, Due today, Due this week, No due date)
- Filters update list immediately
- Multiple filters combine with AND logic

**Empty States:**
- No tasks at all: "No tasks yet. Create your first task!"
- No tasks match filters: "No tasks match your filters."

**Loading State:**
- Brief loading indicator during hydration (localStorage unavailable during SSR)

---

## Context

- Tech stack: Next.js (App Router), Shadcn UI, Tailwind CSS
- Data comes from store functions (not API)
- Use Shadcn UI: Table or Card for task items, Select for dropdowns, Input for search, Badge for status

---

## Acceptance Criteria

- [ ] /tasks displays top-level tasks from store
- [ ] Each task shows title, status badge, assignee, due date, subtask count
- [ ] Overdue tasks visually indicated (red text/icon)
- [ ] Search filters by title with 300ms debounce
- [ ] Search has clear button
- [ ] Status filter works (All + 4 statuses)
- [ ] Assignee filter works (All + each assignee)
- [ ] Due date filter works (All, Overdue, Today, This week, None)
- [ ] Multiple filters combine with AND logic
- [ ] Empty state messages shown appropriately
- [ ] Loading state shown during SSR hydration
- [ ] "New Task" button navigates to /tasks/new
