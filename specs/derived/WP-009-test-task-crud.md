# WP-009: Task CRUD API Tests

> **Assigned to**: tester
> **Priority**: 4 (test after WP-003 is implemented)

---

## Description

Write integration tests for the task CRUD API endpoints (create, read, update, delete) including hierarchy enforcement and status cascade logic.

---

## Test Cases

### Create Task — POST /api/tasks

| # | Test case                                           | Expected                                     |
|---|-----------------------------------------------------|----------------------------------------------|
| 1 | Create task with title only                         | 201, status=TODO, creator_id from session     |
| 2 | Create task with all fields                         | 201, all fields saved correctly               |
| 3 | Create task without title                           | 400, validation error                        |
| 4 | Create task with title > 255 chars                  | 400, validation error                        |
| 5 | Create task without authentication                  | 401                                          |
| 6 | Create subtask (valid parent_id)                    | 201, parent_id set                           |
| 7 | Create subtask of a subtask                         | 422, nesting depth violation                 |
| 8 | Create task with non-existent parent_id             | 404                                          |
| 9 | Create task with non-existent assignee_id           | 404                                          |
| 10| Verify status cannot be set on creation             | Status is always TODO regardless of input    |

### List Tasks — GET /api/tasks

| # | Test case                                           | Expected                                     |
|---|-----------------------------------------------------|----------------------------------------------|
| 1 | List all tasks (no filters)                         | 200, returns all tasks                       |
| 2 | Filter by status=TODO                               | Only TODO tasks returned                     |
| 3 | Filter by assignee_id                               | Only tasks assigned to that user             |
| 4 | Filter by due=overdue                               | Tasks with due_date < today and status ≠ DONE|
| 5 | Filter by due=today                                 | Tasks with due_date = today                  |
| 6 | Filter by due=this_week                             | Tasks with due_date within current week      |
| 7 | Filter by due=none                                  | Tasks with no due_date                       |
| 8 | Search by title substring                           | Case-insensitive substring match             |
| 9 | Combine status + assignee filters                   | AND logic, both filters apply                |
| 10| Filter parent_id=null                               | Only top-level tasks                         |
| 11| List without authentication                         | 401                                          |
| 12| Empty result                                        | 200, empty array                             |

### Get Task — GET /api/tasks/:id

| # | Test case                                           | Expected                                     |
|---|-----------------------------------------------------|----------------------------------------------|
| 1 | Get existing task                                   | 200, full task object                        |
| 2 | Get task with subtasks                              | 200, includes subtasks array                 |
| 3 | Get task without subtasks                           | 200, subtasks is empty array                 |
| 4 | Get non-existent task                               | 404                                          |
| 5 | Get without authentication                          | 401                                          |

### Update Task — PATCH /api/tasks/:id

| # | Test case                                           | Expected                                     |
|---|-----------------------------------------------------|----------------------------------------------|
| 1 | Update title                                        | 200, title changed, other fields unchanged   |
| 2 | Update status to IN_PROGRESS                        | 200, status changed                          |
| 3 | Update status to DONE on parent with subtasks       | 200, all subtasks also set to DONE           |
| 4 | Update assignee_id                                  | 200, assignee changed                        |
| 5 | Unassign (set assignee_id to null)                  | 200, assignee_id is null                     |
| 6 | Update due_date                                     | 200, due_date changed                        |
| 7 | Change parent_id (move task to different parent)    | 200, parent_id changed                       |
| 8 | Set parent_id on a task that has subtasks           | 422, cannot make parent into subtask         |
| 9 | Set parent_id to a subtask                          | 422, nesting depth violation                 |
| 10| Update non-existent task                            | 404                                          |
| 11| Update without authentication                       | 401                                          |
| 12| Verify updated_at changes                           | updated_at is refreshed                      |

### Delete Task — DELETE /api/tasks/:id

| # | Test case                                           | Expected                                     |
|---|-----------------------------------------------------|----------------------------------------------|
| 1 | Delete task without subtasks                        | 200, task removed from DB                    |
| 2 | Delete parent task                                  | 200, parent and all subtasks removed         |
| 3 | Delete non-existent task                            | 404                                          |
| 4 | Delete without authentication                       | 401                                          |

---

## Context

- Tests should run against a real PostgreSQL database (test database).
- Create test users via the auth API or direct DB insert before running task tests.
- Clean up test data between test runs.
- Use a test framework compatible with Next.js (e.g., Jest, Vitest).

---

## Acceptance Criteria

- [ ] All create task test cases pass
- [ ] All list/filter task test cases pass
- [ ] All get task test cases pass
- [ ] All update task test cases pass (including status cascade)
- [ ] All delete task test cases pass (including cascade delete)
- [ ] No test data leaks between test runs
