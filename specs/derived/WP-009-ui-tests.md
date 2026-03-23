# WP-009: UI Integration Tests

> **Assigned to**: tester
> **Priority**: 6 (test after WP-003 through WP-007 are implemented)

---

## Description

Write end-to-end integration tests for the frontend covering task list, detail, create, edit, and filtering.

---

## Test Cases

### Task List UI (/tasks)

| # | Test case | Expected |
|---|-----------|----------|
| 1 | /tasks shows top-level tasks only | No subtasks in list |
| 2 | Each task shows status badge, assignee, due date | All fields visible |
| 3 | Subtask count shown on parent tasks | Correct count |
| 4 | Overdue task has red indicator | Visual distinction |
| 5 | Type in search box | List filters after 300ms |
| 6 | Clear search | Full list restored |
| 7 | Select status filter | Only matching tasks |
| 8 | Select assignee filter | Only matching tasks |
| 9 | Select due date filter "Overdue" | Only overdue tasks |
| 10 | Combine multiple filters | AND logic applied |
| 11 | No results | Empty state message |
| 12 | Click task title | Navigates to /tasks/:id |
| 13 | Click "New Task" button | Navigates to /tasks/new |

### Task Detail UI (/tasks/:id)

| # | Test case | Expected |
|---|-----------|----------|
| 1 | /tasks/:id shows full task details | All fields visible |
| 2 | Inline status dropdown changes status | Status updated immediately |
| 3 | Status change to DONE with subtasks | Warning shown |
| 4 | Subtasks listed with links | Clicking navigates to subtask |
| 5 | Click "Add Subtask" | Navigates to /tasks/new?parentId=:id |
| 6 | Subtask detail shows parent link | "Subtask of: [title]" with link |
| 7 | Click "Edit" | Navigates to /tasks/:id/edit |
| 8 | Click "Delete" | Confirmation dialog |
| 9 | Confirm delete | Task deleted, redirected |
| 10 | Back link | Navigates to /tasks or parent |

### Create Task UI (/tasks/new)

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Submit with title only | Task created, redirected to detail |
| 2 | Submit without title | Inline error on title field |
| 3 | Submit whitespace-only title | Inline error |
| 4 | Submit with all fields | All fields saved |
| 5 | Create subtask via ?parentId | Parent title shown |
| 6 | Assignee dropdown | Shows all assignees + "Unassigned" |
| 7 | Cancel button | Navigates back |

### Edit Task UI (/tasks/:id/edit)

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Form pre-filled | All fields match task |
| 2 | Change title and submit | Title updated |
| 3 | Change status to DONE (parent) | Warning about subtask cascade |
| 4 | Status dropdown | All 4 options available |
| 5 | Cancel button | Returns to detail, no changes |
| 6 | Validation error | Per-field errors shown |

### Home Route

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Visit / | Redirected to /tasks |

### Navigation

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Click "Orka Tasks" in header | Navigates to /tasks |
| 2 | Click "New Task" | Navigates to /tasks/new |

---

## Context

- Use Playwright or Cypress for E2E testing
- Run against local dev server
- Seed test data before each test suite
- Clear localStorage before each test

---

## Acceptance Criteria

- [ ] All task list UI tests pass (including filters, search, empty states)
- [ ] All task detail UI tests pass (including inline status change)
- [ ] All create task UI tests pass (including subtask creation)
- [ ] All edit task UI tests pass (including status cascade warning)
- [ ] All home route tests pass
- [ ] All navigation tests pass
