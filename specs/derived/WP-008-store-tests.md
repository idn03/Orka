# WP-008: Store Tests

> **Assigned to**: tester
> **Priority**: 2 (test after WP-002 is implemented)

---

## Description

Write unit tests for the client-side store module covering all operations and validation logic.

---

## Test Cases

### Task Interface

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Task has all required fields | id, title, status present |
| 2 | UUID format for id | Valid UUID format |
| 3 | ISO 8601 format for timestamps | Valid date string |

### getAllTasks / getTask

| # | Test case | Expected |
|---|-----------|----------|
| 1 | getAllTasks returns all tasks | Array of all tasks |
| 2 | getTask with valid id | Returns task object |
| 3 | getTask with invalid id | Returns undefined |
| 4 | Empty storage returns empty array | [] |

### createTask

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Create with title only | Status=TODO, generated ID |
| 2 | Create with all fields | All fields saved |
| 3 | Create without title | Throws validation error |
| 4 | Create with whitespace-only title | Throws validation error |
| 5 | Create with title > 255 chars | Throws validation error |
| 6 | Create with valid parentId | Sets parentId correctly |
| 7 | Create with invalid parentId | Throws error |
| 8 | Create subtask of subtask | Throws error (one-level nesting) |
| 9 | Title is trimmed | Leading/trailing whitespace removed |

### updateTask

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Update title | Title changed, other fields unchanged |
| 2 | Update status TODO → IN_PROGRESS | Status changed |
| 3 | Update status IN_PROGRESS → TODO | Free backward transition allowed |
| 4 | Update status DONE → IN_PROGRESS | Subtasks NOT affected |
| 5 | Update status to DONE on parent | All non-DONE subtasks set to DONE |
| 6 | Update with invalid parentId | Throws error |
| 7 | Make parent-with-children into subtask | Throws error |
| 8 | Verify updatedAt changes | Timestamp refreshed |

### deleteTask

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Delete task without subtasks | Task removed |
| 2 | Delete parent task | Parent and all subtasks removed |
| 3 | Delete subtask | Subtask removed, parent unaffected |

### queryTasks

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Filter by status | Only matching status |
| 2 | Filter by assignee | Only matching assignee |
| 3 | Filter by search | Case-insensitive substring match |
| 4 | Filter by due=overdue | dueDate < today AND status ≠ DONE |
| 5 | Filter by due=today | dueDate = today |
| 6 | Filter by due=this_week | Due within current week |
| 7 | Filter by due=none | Tasks with no dueDate |
| 8 | Filter by parentId=null | Only top-level tasks |
| 9 | Combine filters | AND logic applied |
| 10 | Empty storage | Empty array |

### getSubtasks

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Get subtasks of parent | Array of subtasks |
| 2 | Get subtasks of task with none | Empty array |
| 3 | Invalid parentId | Empty array |

### getAllAssignees

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Returns unique assignee names | No duplicates |
| 2 | Empty storage | Empty array |
| 3 | Null assignees ignored | Only non-null values |

---

## Context

- Use Vitest or Jest for unit testing
- Mock localStorage for each test
- Reset localStorage before each test

---

## Acceptance Criteria

- [ ] All getAllTasks/getTask tests pass
- [ ] All createTask validation tests pass
- [ ] All updateTask tests pass (including cascade logic)
- [ ] All deleteTask cascade tests pass
- [ ] All queryTasks filter tests pass
- [ ] All getSubtasks tests pass
- [ ] All getAllAssignees tests pass
- [ ] Tests are isolated (no state leakage)
