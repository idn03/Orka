# WP-011: UI Integration Tests

> **Assigned to**: tester
> **Priority**: 6 (test after WP-005, WP-006, WP-007 are implemented)

---

## Description

Write end-to-end integration tests for the frontend: auth flows, task list interactions, task CRUD forms, filtering, and navigation.

---

## Test Cases

### Auth UI

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Visit /tasks while logged out | Redirected to /login |
| 2 | Visit /login while logged in | Redirected to /tasks |
| 3 | Visit /register while logged in | Redirected to /tasks |
| 4 | Login with valid credentials | Redirected to /tasks, header shows user name |
| 5 | Login with invalid credentials | Stays on /login, error message shown inline |
| 6 | Register with valid data | Auto-logged in, redirected to /tasks |
| 7 | Register with duplicate email | Error shown under email field |
| 8 | Register with invalid fields | Per-field errors shown inline |
| 9 | Click "Don't have an account?" link | Navigates to /register |
| 10 | Click "Already have an account?" link | Navigates to /login |
| 11 | Click logout button | Session ended, redirected to /login |

### Task List UI

| # | Test case | Expected |
|---|-----------|----------|
| 1 | /tasks shows top-level tasks only | No subtasks in list |
| 2 | Each task shows status badge, assignee, due date | All fields visible |
| 3 | Subtask count shown on parent tasks | Correct count displayed |
| 4 | Overdue task has red/warning indicator | Visual distinction |
| 5 | Type in search box | List filters after 300ms debounce |
| 6 | Clear search | Full list restored |
| 7 | Select status filter | Only matching tasks shown |
| 8 | Select "Assigned to me" | Only current user's tasks shown |
| 9 | Select due date filter "Overdue" | Only overdue tasks shown |
| 10 | Combine multiple filters | AND logic applied |
| 11 | No results | Empty state message shown |
| 12 | Click task title | Navigates to /tasks/:id |
| 13 | Click "New Task" button | Navigates to /tasks/new |

### Task Detail UI

| # | Test case | Expected |
|---|-----------|----------|
| 1 | /tasks/:id shows full task details | Title, description, status, assignee, creator, dates |
| 2 | Status change via inline control | PATCH called, status updated, page refreshes |
| 3 | Status change to DONE with subtasks | Warning shown before confirming |
| 4 | Subtasks listed with links | Clicking subtask navigates to subtask detail |
| 5 | Click "Add Subtask" | Navigates to /tasks/new?parent_id=:id |
| 6 | Subtask detail shows parent link | "Subtask of: [title]" with link |
| 7 | Click "Edit" | Navigates to /tasks/:id/edit |
| 8 | Click "Delete" | Confirmation dialog appears |
| 9 | Confirm delete | Task deleted, redirected to /tasks |
| 10 | Delete subtask | Redirected to parent task |
| 11 | Back link goes to /tasks | Or to parent task for subtasks |

### Create Task UI

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Submit with title | Task created, redirected to detail |
| 2 | Submit without title | Inline error on title field |
| 3 | Submit with all fields | All fields saved correctly |
| 4 | Create subtask via ?parent_id | Parent title shown, parent_id sent |
| 5 | Assignee dropdown lists all users | Users from GET /api/users |

### Edit Task UI

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Form pre-filled with current data | All fields match task |
| 2 | Change title and submit | Only title sent in PATCH |
| 3 | Change status to DONE (parent) | Warning about subtask cascade |
| 4 | Status dropdown allows any transition | All 4 options available |
| 5 | Cancel button | Returns to /tasks/:id, no changes |
| 6 | Validation error from API | Per-field errors shown inline |

---

## Context

- Use a browser testing framework (Playwright or Cypress recommended).
- Tests run against a local dev server with a test database.
- Seed test data before each test suite (users + tasks with subtasks).
- Clean up after test runs.
- Avatars are initials-only (no image assertions).

---

## Acceptance Criteria

- [ ] All auth UI test cases pass
- [ ] All task list UI test cases pass (including filters, search, empty states)
- [ ] All task detail UI test cases pass (including inline status change)
- [ ] All create task UI test cases pass (including subtask creation)
- [ ] All edit task UI test cases pass (including status cascade warning)
- [ ] Navigation flows are correct (redirects, back links, cancel)
